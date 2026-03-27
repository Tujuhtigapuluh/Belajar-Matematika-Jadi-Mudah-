// ==========================================
// 📊 SOLUTION DISPLAY COMPONENT
// ==========================================

import React, { useState, useEffect } from 'react';
import { MathRenderer } from './MathRenderer';
import type { MathResult, MathStep } from '../lib/mathEngine';

interface SolutionDisplayProps {
  result: MathResult | null;
  isLoading?: boolean;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({
  result,
  isLoading = false
}) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [showNotes, setShowNotes] = useState(false);

  // Animate steps appearing one by one
  useEffect(() => {
    if (!result) {
      setVisibleSteps(0);
      setShowNotes(false);
      return;
    }

    setVisibleSteps(0);
    setShowNotes(false);

    const totalSteps = result.steps.length;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setVisibleSteps(currentStep);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        // Show notes after all steps
        setTimeout(() => setShowNotes(true), 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [result]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-gray-400 animate-pulse">Menghitung...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Problem Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-purple-500/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">❓</span>
          <div className="flex-1">
            <h3 className="text-sm text-purple-300 font-medium mb-2">Pertanyaan</h3>
            <div className="bg-black/20 rounded-xl p-4 overflow-x-auto">
              <MathRenderer latex={result.latex} size="xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {!result.success && result.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-medium">Terjadi Kesalahan</h3>
              <p className="text-red-300 mt-1">{result.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Solution Steps */}
      {result.success && result.steps.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✍️</span>
            <h3 className="text-lg font-bold text-white">Penyelesaian</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>

          <div className="space-y-4">
            {result.steps.slice(0, visibleSteps).map((step, index) => (
              <StepCard 
                key={index} 
                step={step} 
                stepNumber={index + 1}
                isLast={index === result.steps.length - 1}
                totalSteps={result.steps.length}
              />
            ))}
          </div>

          {/* Progress indicator */}
          {visibleSteps < result.steps.length && (
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      )}

      {/* Final Answer */}
      {result.success && result.resultLatex && visibleSteps >= result.steps.length && (
        <div className="animate-scaleIn bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-5 border border-green-500/30">
          <div className="flex items-start gap-3">
            <span className="text-3xl animate-bounce">🎯</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-400 mb-3">Jawaban Akhir</h3>
              <div className="bg-black/30 rounded-xl p-4 overflow-x-auto">
                <MathRenderer latex={result.resultLatex} size="xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {result.success && result.notes.length > 0 && showNotes && (
        <div className="animate-slideUp bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-400 mb-3">Catatan Penting</h3>
              <div className="space-y-2">
                {result.notes.map((note, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 text-gray-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-blue-400">•</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 📋 STEP CARD COMPONENT
// ==========================================

interface StepCardProps {
  step: MathStep;
  stepNumber: number;
  isLast: boolean;
  totalSteps: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, stepNumber, isLast, totalSteps }) => {
  return (
    <div 
      className={`
        animate-slideIn relative pl-8
        ${!isLast ? 'pb-4' : ''}
      `}
      style={{ animationDelay: `${stepNumber * 0.1}s` }}
    >
      {/* Step indicator line */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-transparent"></div>
      )}
      
      {/* Step number bubble */}
      <div className={`
        absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
        ${isLast 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
        }
      `}>
        {stepNumber === totalSteps ? '✓' : stepNumber}
      </div>

      {/* Step content */}
      <div className={`
        rounded-xl p-4 border transition-all
        ${isLast 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-white/5 border-white/10 hover:border-purple-500/30'
        }
      `}>
        <div className="text-sm text-gray-400 mb-2 font-medium">
          {step.description}
        </div>
        <div className="overflow-x-auto py-2">
          <MathRenderer latex={step.latex} size="lg" />
        </div>
        {step.explanation && (
          <div className="text-sm text-gray-500 mt-2 pt-2 border-t border-white/5 italic">
            💡 {step.explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionDisplay;
