// ==========================================
// 🛠️ TOOLS PANEL COMPONENT
// ==========================================

import React, { useState, useRef, useEffect } from 'react';
import { MathRenderer } from './MathRenderer.tsx';
import type { MathResult } from '../lib/mathEngine.ts';

interface ToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: MathResult[];
  onHistorySelect: (result: MathResult) => void;
}

type ActivePanel = 'formulas' | 'multiplication' | 'tips' | 'whiteboard' | 'history' | 'achievements' | null;

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  onClose,
  history,
  onHistorySelect
}) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const tools = [
    { id: 'formulas', icon: '📐', label: 'Rumus', color: 'from-blue-500 to-cyan-500' },
    { id: 'multiplication', icon: '✖️', label: 'Tabel Perkalian', color: 'from-green-500 to-emerald-500' },
    { id: 'tips', icon: '💡', label: 'Tips & Trik', color: 'from-yellow-500 to-orange-500' },
    { id: 'whiteboard', icon: '✏️', label: 'Papan Coret', color: 'from-pink-500 to-rose-500' },
    { id: 'history', icon: '📜', label: 'Riwayat', color: 'from-purple-500 to-violet-500' },
    { id: 'achievements', icon: '🏆', label: 'Pencapaian', color: 'from-amber-500 to-yellow-500' },
  ] as const;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 z-50 shadow-2xl animate-slideInRight overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🛠️ Tools
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!activePanel ? (
            // Tool buttons
            <div className="p-4 grid grid-cols-2 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActivePanel(tool.id)}
                  className={`
                    p-4 rounded-xl bg-gradient-to-br ${tool.color}
                    text-white text-left transition-all hover:scale-[1.02] active:scale-[0.98]
                    shadow-lg
                  `}
                >
                  <span className="text-3xl">{tool.icon}</span>
                  <p className="mt-2 font-medium">{tool.label}</p>
                </button>
              ))}
            </div>
          ) : (
            // Active panel content
            <div className="flex flex-col h-full">
              {/* Panel header */}
              <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  ←
                </button>
                <span className="text-xl">{tools.find(t => t.id === activePanel)?.icon}</span>
                <span className="font-medium text-white">{tools.find(t => t.id === activePanel)?.label}</span>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activePanel === 'formulas' && <FormulasPanel />}
                {activePanel === 'multiplication' && <MultiplicationPanel />}
                {activePanel === 'tips' && <TipsPanel />}
                {activePanel === 'whiteboard' && <WhiteboardPanel />}
                {activePanel === 'history' && <HistoryPanel history={history} onSelect={onHistorySelect} />}
                {activePanel === 'achievements' && <AchievementsPanel />}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ==========================================
// 📐 FORMULAS PANEL
// ==========================================

const FormulasPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('flat');

  const categories = {
    flat: {
      title: '📐 Bangun Datar',
      formulas: [
        { name: 'Persegi', formula: 'Luas = s sup{2}, Keliling = 4s' },
        { name: 'Persegi Panjang', formula: 'Luas = p × l, Keliling = 2(p + l)' },
        { name: 'Segitiga', formula: 'Luas = frac{1}{2} × a × t' },
        { name: 'Lingkaran', formula: 'Luas = πr sup{2}, Keliling = 2πr' },
        { name: 'Trapesium', formula: 'Luas = frac{1}{2}(a + b) × t' },
        { name: 'Jajar Genjang', formula: 'Luas = a × t' },
        { name: 'Belah Ketupat', formula: 'Luas = frac{1}{2} × d sub{1} × d sub{2}' },
      ]
    },
    solid: {
      title: '📦 Bangun Ruang',
      formulas: [
        { name: 'Kubus', formula: 'V = s sup{3}, Lp = 6s sup{2}' },
        { name: 'Balok', formula: 'V = p × l × t, Lp = 2(pl + pt + lt)' },
        { name: 'Tabung', formula: 'V = πr sup{2}t, Lp = 2πr(r + t)' },
        { name: 'Kerucut', formula: 'V = frac{1}{3}πr sup{2}t' },
        { name: 'Bola', formula: 'V = frac{4}{3}πr sup{3}, Lp = 4πr sup{2}' },
        { name: 'Limas', formula: 'V = frac{1}{3} × Alas × t' },
        { name: 'Prisma', formula: 'V = Alas × t' },
      ]
    },
    algebra: {
      title: '🔢 Aljabar',
      formulas: [
        { name: 'Kuadrat Sempurna', formula: '(a + b) sup{2} = a sup{2} + 2ab + b sup{2}' },
        { name: 'Selisih Kuadrat', formula: '(a - b) sup{2} = a sup{2} - 2ab + b sup{2}' },
        { name: 'Selisih Kuadrat', formula: 'a sup{2} - b sup{2} = (a + b)(a - b)' },
        { name: 'Rumus ABC', formula: 'x = frac{-b ± sqrt{b sup{2} - 4ac}}{2a}' },
        { name: 'Identitas Kubik', formula: '(a + b) sup{3} = a sup{3} + 3a sup{2}b + 3ab sup{2} + b sup{3}' },
      ]
    },
    trigonometry: {
      title: '📊 Trigonometri',
      formulas: [
        { name: 'Sinus', formula: 'sin θ = frac{depan}{miring}' },
        { name: 'Cosinus', formula: 'cos θ = frac{samping}{miring}' },
        { name: 'Tangen', formula: 'tan θ = frac{depan}{samping}' },
        { name: 'Identitas', formula: 'sin sup{2}θ + cos sup{2}θ = 1' },
        { name: 'Pythagoras', formula: 'c sup{2} = a sup{2} + b sup{2}' },
      ]
    }
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${activeCategory === key 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }
            `}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Formulas */}
      <div className="space-y-3">
        {categories[activeCategory as keyof typeof categories].formulas.map((f, idx) => (
          <div 
            key={idx}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-colors"
          >
            <div className="text-sm text-purple-300 font-medium mb-2">{f.name}</div>
            <MathRenderer latex={f.formula} size="md" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// ✖️ MULTIPLICATION TABLE
// ==========================================

const MultiplicationPanel: React.FC = () => {
  const [highlightRow, setHighlightRow] = useState<number | null>(null);
  const [highlightCol, setHighlightCol] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-2 bg-purple-500/20 text-purple-300 rounded-tl-lg">×</th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <th 
                key={n} 
                className={`p-2 transition-colors ${highlightCol === n ? 'bg-purple-500/40 text-white' : 'bg-purple-500/20 text-purple-300'}`}
                onMouseEnter={() => setHighlightCol(n)}
                onMouseLeave={() => setHighlightCol(null)}
              >
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
            <tr key={row}>
              <td 
                className={`p-2 font-bold transition-colors ${highlightRow === row ? 'bg-purple-500/40 text-white' : 'bg-purple-500/20 text-purple-300'}`}
                onMouseEnter={() => setHighlightRow(row)}
                onMouseLeave={() => setHighlightRow(null)}
              >
                {row}
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(col => (
                <td 
                  key={col}
                  className={`
                    p-2 transition-all cursor-pointer
                    ${(highlightRow === row || highlightCol === col) 
                      ? 'bg-purple-500/20 text-white font-bold scale-110' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }
                    ${highlightRow === row && highlightCol === col ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
                  `}
                  onMouseEnter={() => { setHighlightRow(row); setHighlightCol(col); }}
                  onMouseLeave={() => { setHighlightRow(null); setHighlightCol(null); }}
                >
                  {row * col}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// 💡 TIPS PANEL
// ==========================================

const TipsPanel: React.FC = () => {
  const tips = [
    {
      title: '✖️ Perkalian 11',
      content: 'Untuk mengalikan bilangan dua digit dengan 11: pisahkan digit, jumlahkan, letakkan di tengah.',
      example: '23 × 11 = 2_(2+3)_3 = 253'
    },
    {
      title: '✖️ Kuadrat Bilangan yang Berakhir 5',
      content: 'Kalikan digit depan dengan (digit depan + 1), tambahkan 25 di belakang.',
      example: '35² = 3×4 = 12, hasil: 1225'
    },
    {
      title: '➗ Cek Habis Dibagi 3',
      content: 'Jumlahkan semua digit. Jika hasilnya habis dibagi 3, bilangan itu juga habis dibagi 3.',
      example: '126 → 1+2+6 = 9 ✓'
    },
    {
      title: '➗ Cek Habis Dibagi 9',
      content: 'Jumlahkan semua digit. Jika hasilnya habis dibagi 9, bilangan itu juga habis dibagi 9.',
      example: '729 → 7+2+9 = 18 → 1+8 = 9 ✓'
    },
    {
      title: '✖️ Perkalian 9',
      content: 'Kurangi 1 dari angka pengali, tulis sisa dari 9.',
      example: '9 × 7 = 6_3 = 63 (7-1=6, 9-6=3)'
    },
    {
      title: '➕ Trik BODMAS',
      content: 'Urutan operasi: Brackets, Order(pangkat), Division, Multiplication, Addition, Subtraction',
      example: '2 + 3 × 4 = 2 + 12 = 14 (bukan 20)'
    },
    {
      title: '📐 Teorema Pythagoras',
      content: 'Triple Pythagoras populer: (3,4,5), (5,12,13), (8,15,17), (7,24,25)',
      example: '3² + 4² = 9 + 16 = 25 = 5²'
    },
    {
      title: '🔢 Persentase Cepat',
      content: '10% = bagi 10, 5% = setengah dari 10%, 15% = 10% + 5%',
      example: '15% dari 80 = 8 + 4 = 12'
    },
  ];

  return (
    <div className="space-y-4">
      {tips.map((tip, idx) => (
        <div 
          key={idx}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20"
        >
          <h4 className="font-bold text-yellow-400 mb-2">{tip.title}</h4>
          <p className="text-gray-300 text-sm mb-2">{tip.content}</p>
          <div className="bg-black/20 rounded-lg px-3 py-2 font-mono text-sm text-green-400">
            {tip.example}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// ✏️ WHITEBOARD PANEL
// ==========================================

const WhiteboardPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#fff');
  const [brushSize, setBrushSize] = useState(3);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPosition(e);
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getPosition(e);
    if (!lastPos.current) {
      lastPos.current = pos;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ['#fff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899'];

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={350}
        height={300}
        className="w-full rounded-xl border border-white/10 cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Colors */}
        <div className="flex gap-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Brush size */}
        <input
          type="range"
          min={1}
          max={10}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1"
        />

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 📜 HISTORY PANEL
// ==========================================

interface HistoryPanelProps {
  history: MathResult[];
  onSelect: (result: MathResult) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl">📭</span>
        <p className="mt-2">Belum ada riwayat</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((result, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(result)}
          className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 transition-colors"
        >
          <div className="text-sm text-gray-400 mb-1">
            {result.success ? '✅' : '❌'} Soal #{history.length - idx}
          </div>
          <MathRenderer latex={result.latex} size="sm" />
          {result.resultLatex && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="text-green-400 text-sm">= </span>
              <MathRenderer latex={result.resultLatex} size="sm" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

// ==========================================
// 🏆 ACHIEVEMENTS PANEL
// ==========================================

const AchievementsPanel: React.FC = () => {
  const achievements = [
    { icon: '🌟', name: 'Pemula', desc: 'Selesaikan 1 soal', unlocked: true },
    { icon: '🔥', name: 'Semangat', desc: 'Selesaikan 5 soal', unlocked: true },
    { icon: '🧮', name: 'Kalkulator', desc: 'Selesaikan 10 soal', unlocked: false },
    { icon: '📐', name: 'Geometri Master', desc: 'Selesaikan 5 soal geometri', unlocked: false },
    { icon: '🎯', name: 'Akurat', desc: '10 jawaban benar berturut-turut', unlocked: false },
    { icon: '⚡', name: 'Kilat', desc: 'Selesaikan soal dalam 10 detik', unlocked: false },
    { icon: '🏆', name: 'Juara', desc: 'Selesaikan 100 soal', unlocked: false },
    { icon: '🎓', name: 'Profesor', desc: 'Selesaikan semua jenis soal', unlocked: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {achievements.map((ach, idx) => (
        <div
          key={idx}
          className={`
            p-4 rounded-xl border text-center transition-all
            ${ach.unlocked 
              ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30' 
              : 'bg-white/5 border-white/10 opacity-50'
            }
          `}
        >
          <span className="text-3xl">{ach.icon}</span>
          <p className="font-medium text-white mt-2">{ach.name}</p>
          <p className="text-xs text-gray-400 mt-1">{ach.desc}</p>
          {ach.unlocked && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              ✓ Unlocked
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ToolsPanel;