// ==========================================
// 🧮 MATHGENIUS PRO v3.0 - SYMBOLIC SOLVER
// ==========================================

import React, { useState, useCallback } from 'react';
import { mathEngine, type MathResult } from './lib/mathEngine';
import { MathInput } from './components/MathInput';
import { SolutionDisplay } from './components/SolutionDisplay';
import { ToolsPanel } from './components/ToolsPanel';
import { MathRenderer } from './components/MathRenderer';

type AppMode = 'calculate' | 'quiz';

interface QuizState {
  question: string;
  answer: number;
  userAnswer: string;
  score: number;
  streak: number;
  total: number;
  feedback: 'correct' | 'wrong' | null;
}

export default function App() {
  // State
  const [mode, setMode] = useState<AppMode>('calculate');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<MathResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<MathResult[]>([]);
  const [showTools, setShowTools] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<QuizState>({
    question: '',
    answer: 0,
    userAnswer: '',
    score: 0,
    streak: 0,
    total: 0,
    feedback: null
  });

  // Handle calculation
  const handleCalculate = useCallback(() => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResult(null);

    // Simulate slight delay for UX
    setTimeout(() => {
      const calcResult = mathEngine.solve(input);
      setResult(calcResult);
      setHistory(prev => [calcResult, ...prev].slice(0, 10));
      setIsLoading(false);

      if (calcResult.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, 300);
  }, [input]);

  // Handle history selection
  const handleHistorySelect = useCallback((historyResult: MathResult) => {
    setInput(historyResult.input);
    setResult(historyResult);
    setShowTools(false);
  }, []);

  // Generate quiz question
  const generateQuiz = useCallback(() => {
    const operations = ['+', '-', '×', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let a: number, b: number, answer: number;
    
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 20;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      case '÷':
        b = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        a = b * answer;
        break;
      default:
        a = 1; b = 1; answer = 2;
    }

    setQuiz(prev => ({
      ...prev,
      question: `${a} ${op} ${b}`,
      answer,
      userAnswer: '',
      feedback: null
    }));
  }, []);

  // Check quiz answer
  const checkQuizAnswer = useCallback(() => {
    const userNum = parseFloat(quiz.userAnswer);
    const isCorrect = userNum === quiz.answer;

    setQuiz(prev => ({
      ...prev,
      feedback: isCorrect ? 'correct' : 'wrong',
      score: isCorrect ? prev.score + 10 : prev.score,
      streak: isCorrect ? prev.streak + 1 : 0,
      total: prev.total + 1
    }));

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    setTimeout(() => {
      generateQuiz();
    }, 1500);
  }, [quiz.userAnswer, quiz.answer, generateQuiz]);

  // Start quiz mode
  const startQuiz = useCallback(() => {
    setMode('quiz');
    setQuiz({
      question: '',
      answer: 0,
      userAnswer: '',
      score: 0,
      streak: 0,
      total: 0,
      feedback: null
    });
    generateQuiz();
  }, [generateQuiz]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            🧮 MathGenius PRO
          </h1>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setMode('calculate')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'calculate' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🔢 Hitung
              </button>
              <button
                onClick={startQuiz}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'quiz' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎮 Kuis
              </button>
            </div>

            {/* Tools Button */}
            <button
              onClick={() => setShowTools(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              🛠️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {mode === 'calculate' ? (
          <CalculatorMode
            input={input}
            setInput={setInput}
            result={result}
            isLoading={isLoading}
            onCalculate={handleCalculate}
          />
        ) : (
          <QuizMode
            quiz={quiz}
            setQuiz={setQuiz}
            onCheck={checkQuizAnswer}
            onSkip={generateQuiz}
          />
        )}
      </main>

      {/* Tools Panel */}
      <ToolsPanel
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        history={history}
        onHistorySelect={handleHistorySelect}
      />

      {/* Footer */}
      <footer className="text-center py-4 text-gray-600 text-sm">
        Made with 💜 for learning math
      </footer>
    </div>
  );
}

// ==========================================
// 🔢 CALCULATOR MODE
// ==========================================

interface CalculatorModeProps {
  input: string;
  setInput: (value: string) => void;
  result: MathResult | null;
  isLoading: boolean;
  onCalculate: () => void;
}

const CalculatorMode: React.FC<CalculatorModeProps> = ({
  input,
  setInput,
  result,
  isLoading,
  onCalculate
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl px-6 py-3 border border-purple-500/30">
          <span className="text-3xl">🤖</span>
          <div className="text-left">
            <p className="text-white font-medium">Halo! Saya MathGenius</p>
            <p className="text-sm text-gray-400">Tulis soal matematikamu di bawah ini</p>
          </div>
        </div>
      </div>

      {/* Math Input */}
      <MathInput
        value={input}
        onChange={setInput}
        onSubmit={onCalculate}
        placeholder="Ketik soal matematika..."
      />

      {/* Solution Display */}
      <SolutionDisplay
        result={result}
        isLoading={isLoading}
      />
    </div>
  );
};

// ==========================================
// 🎮 QUIZ MODE
// ==========================================

interface QuizModeProps {
  quiz: QuizState;
  setQuiz: React.Dispatch<React.SetStateAction<QuizState>>;
  onCheck: () => void;
  onSkip: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ quiz, setQuiz, onCheck, onSkip }) => {
  return (
    <div className="space-y-6">
      {/* Score Board */}
      <div className="flex justify-center gap-4">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl px-4 py-2 border border-green-500/30">
          <span className="text-green-400 font-bold text-lg">🏆 {quiz.score}</span>
          <span className="text-gray-400 text-sm ml-1">poin</span>
        </div>
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl px-4 py-2 border border-orange-500/30">
          <span className="text-orange-400 font-bold text-lg">🔥 {quiz.streak}</span>
          <span className="text-gray-400 text-sm ml-1">streak</span>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl px-4 py-2 border border-purple-500/30">
          <span className="text-purple-400 font-bold text-lg">📝 {quiz.total}</span>
          <span className="text-gray-400 text-sm ml-1">soal</span>
        </div>
      </div>

      {/* Question Card */}
      <div className={`
        bg-slate-800/50 rounded-2xl p-6 border transition-all duration-300
        ${quiz.feedback === 'correct' ? 'border-green-500 bg-green-500/10' : ''}
        ${quiz.feedback === 'wrong' ? 'border-red-500 bg-red-500/10' : 'border-white/10'}
      `}>
        <div className="text-center">
          <span className="text-sm text-gray-400">Berapa hasil dari:</span>
          <div className="my-6">
            <MathRenderer latex={quiz.question + ' = ?'} size="xl" />
          </div>
        </div>

        {/* Answer Input */}
        <div className="flex gap-3">
          <input
            type="number"
            value={quiz.userAnswer}
            onChange={(e) => setQuiz(prev => ({ ...prev, userAnswer: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && quiz.userAnswer && onCheck()}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="?"
            disabled={quiz.feedback !== null}
          />
          <button
            onClick={onCheck}
            disabled={!quiz.userAnswer || quiz.feedback !== null}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            ✓
          </button>
        </div>

        {/* Feedback */}
        {quiz.feedback && (
          <div className={`mt-4 text-center animate-scaleIn ${
            quiz.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
          }`}>
            {quiz.feedback === 'correct' ? (
              <span className="text-2xl">🎉 Benar! +10 poin</span>
            ) : (
              <span className="text-2xl">
                ❌ Salah! Jawaban: {quiz.answer}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ⏭️ Lewati soal ini
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 🎊 CONFETTI COMPONENT
// ==========================================

const Confetti: React.FC = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random(),
    color: ['#a855f7', '#ec4899', '#22c55e', '#eab308', '#3b82f6'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
};
