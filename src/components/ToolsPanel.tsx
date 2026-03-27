// ==========================================
// 🛠️ TOOLS PANEL COMPONENT — FINAL VERSION
// ==========================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MathRenderer } from './MathRenderer.tsx';
import type { MathResult } from '../lib/mathEngine.ts';

// ==========================================
// TYPES
// ==========================================

interface ToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: MathResult[];
  onHistorySelect: (result: MathResult) => void;
}

type ActivePanel =
  | 'formulas'
  | 'multiplication'
  | 'division'
  | 'tips'
  | 'whiteboard'
  | 'history'
  | 'achievements'
  | 'numbers'
  | null;

interface ToolDefinition {
  readonly id: NonNullable<ActivePanel>;
  readonly icon: string;
  readonly label: string;
  readonly color: string;
}

type FormulaCategory = 'flat' | 'solid' | 'algebra' | 'trigonometry';

interface FormulaEntry {
  name: string;
  formula: string;
}

interface HistoryPanelProps {
  history: MathResult[];
  onSelect: (result: MathResult) => void;
}

type DivisionView = 'table' | 'custom';

// ==========================================
// CONSTANTS
// ==========================================

const TOOLS: readonly ToolDefinition[] = [
  { id: 'formulas',       icon: '📐', label: 'Rumus',           color: 'from-blue-500 to-cyan-500' },
  { id: 'multiplication', icon: '✖️', label: 'Tabel Perkalian', color: 'from-green-500 to-emerald-500' },
  { id: 'division',       icon: '➗', label: 'Tabel Pembagian', color: 'from-indigo-500 to-purple-500' },
  { id: 'numbers',        icon: '🔍', label: 'Bilangan',        color: 'from-teal-500 to-emerald-500' },
  { id: 'tips',           icon: '💡', label: 'Tips & Trik',     color: 'from-yellow-500 to-orange-500' },
  { id: 'whiteboard',     icon: '✏️', label: 'Papan Coret',     color: 'from-pink-500 to-rose-500' },
  { id: 'history',        icon: '📜', label: 'Riwayat',         color: 'from-purple-500 to-violet-500' },
  { id: 'achievements',   icon: '🏆', label: 'Pencapaian',      color: 'from-amber-500 to-yellow-500' },
] as const;

const NUMBERS_1_TO_10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const DIVISORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const DIVISION_PRESETS = [10, 12, 20, 24, 25, 36, 48, 50, 60, 72, 100, 120, 144, 360, 1000] as const;

const CANVAS_BG = '#1e293b';

const BRUSH_COLORS = ['#fff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899'] as const;

const FORMULA_CATEGORIES: Record<FormulaCategory, { title: string; formulas: FormulaEntry[] }> = {
  flat: {
    title: '📐 Bangun Datar',
    formulas: [
      { name: 'Persegi',         formula: 'Luas = s sup{2}, Keliling = 4s' },
      { name: 'Persegi Panjang', formula: 'Luas = p × l, Keliling = 2(p + l)' },
      { name: 'Segitiga',        formula: 'Luas = frac{1}{2} × a × t' },
      { name: 'Lingkaran',       formula: 'Luas = πr sup{2}, Keliling = 2πr' },
      { name: 'Trapesium',       formula: 'Luas = frac{1}{2}(a + b) × t' },
      { name: 'Jajar Genjang',   formula: 'Luas = a × t' },
      { name: 'Belah Ketupat',   formula: 'Luas = frac{1}{2} × d sub{1} × d sub{2}' },
    ],
  },
  solid: {
    title: '📦 Bangun Ruang',
    formulas: [
      { name: 'Kubus',   formula: 'V = s sup{3}, Lp = 6s sup{2}' },
      { name: 'Balok',   formula: 'V = p × l × t, Lp = 2(pl + pt + lt)' },
      { name: 'Tabung',  formula: 'V = πr sup{2}t, Lp = 2πr(r + t)' },
      { name: 'Kerucut', formula: 'V = frac{1}{3}πr sup{2}t' },
      { name: 'Bola',    formula: 'V = frac{4}{3}πr sup{3}, Lp = 4πr sup{2}' },
      { name: 'Limas',   formula: 'V = frac{1}{3} × Alas × t' },
      { name: 'Prisma',  formula: 'V = Alas × t' },
    ],
  },
  algebra: {
    title: '🔢 Aljabar',
    formulas: [
      { name: 'Kuadrat Sempurna',   formula: '(a + b) sup{2} = a sup{2} + 2ab + b sup{2}' },
      { name: 'Selisih Kuadrat',     formula: '(a - b) sup{2} = a sup{2} - 2ab + b sup{2}' },
      { name: 'Faktorisasi Selisih', formula: 'a sup{2} - b sup{2} = (a + b)(a - b)' },
      { name: 'Rumus ABC',           formula: 'x = frac{-b ± sqrt{b sup{2} - 4ac}}{2a}' },
      { name: 'Identitas Kubik',     formula: '(a + b) sup{3} = a sup{3} + 3a sup{2}b + 3ab sup{2} + b sup{3}' },
    ],
  },
  trigonometry: {
    title: '📊 Trigonometri',
    formulas: [
      { name: 'Sinus',      formula: 'sin θ = frac{depan}{miring}' },
      { name: 'Cosinus',    formula: 'cos θ = frac{samping}{miring}' },
      { name: 'Tangen',     formula: 'tan θ = frac{depan}{samping}' },
      { name: 'Identitas',  formula: 'sin sup{2}θ + cos sup{2}θ = 1' },
      { name: 'Pythagoras', formula: 'c sup{2} = a sup{2} + b sup{2}' },
    ],
  },
};

const TIPS = [
  {
    title: '✖️ Perkalian 11',
    content: 'Untuk mengalikan bilangan dua digit dengan 11: pisahkan digit, jumlahkan, letakkan di tengah.',
    example: '23 × 11 = 2_(2+3)_3 = 253',
  },
  {
    title: '✖️ Kuadrat Bilangan yang Berakhir 5',
    content: 'Kalikan digit depan dengan (digit depan + 1), tambahkan 25 di belakang.',
    example: '35² = 3×4 = 12, hasil: 1225',
  },
  {
    title: '➗ Cek Habis Dibagi 3',
    content: 'Jumlahkan semua digit. Jika hasilnya habis dibagi 3, bilangan itu juga habis dibagi 3.',
    example: '126 → 1+2+6 = 9 ✓',
  },
  {
    title: '➗ Cek Habis Dibagi 9',
    content: 'Jumlahkan semua digit. Jika hasilnya habis dibagi 9, bilangan itu juga habis dibagi 9.',
    example: '729 → 7+2+9 = 18 → 1+8 = 9 ✓',
  },
  {
    title: '✖️ Perkalian 9',
    content: 'Kurangi 1 dari angka pengali, tulis sisa dari 9.',
    example: '9 × 7 = 6_3 = 63 (7-1=6, 9-6=3)',
  },
  {
    title: '➕ Trik BODMAS',
    content: 'Urutan operasi: Brackets, Order(pangkat), Division, Multiplication, Addition, Subtraction',
    example: '2 + 3 × 4 = 2 + 12 = 14 (bukan 20)',
  },
  {
    title: '📐 Teorema Pythagoras',
    content: 'Triple Pythagoras populer: (3,4,5), (5,12,13), (8,15,17), (7,24,25)',
    example: '3² + 4² = 9 + 16 = 25 = 5²',
  },
  {
    title: '🔢 Persentase Cepat',
    content: '10% = bagi 10, 5% = setengah dari 10%, 15% = 10% + 5%',
    example: '15% dari 80 = 8 + 4 = 12',
  },
] as const;

const ACHIEVEMENTS = [
  { icon: '🌟', name: 'Pemula',          desc: 'Selesaikan 1 soal',               unlocked: true },
  { icon: '🔥', name: 'Semangat',        desc: 'Selesaikan 5 soal',               unlocked: true },
  { icon: '🧮', name: 'Kalkulator',      desc: 'Selesaikan 10 soal',              unlocked: false },
  { icon: '📐', name: 'Geometri Master', desc: 'Selesaikan 5 soal geometri',      unlocked: false },
  { icon: '🎯', name: 'Akurat',          desc: '10 jawaban benar berturut-turut', unlocked: false },
  { icon: '⚡', name: 'Kilat',           desc: 'Selesaikan soal dalam 10 detik',  unlocked: false },
  { icon: '🏆', name: 'Juara',           desc: 'Selesaikan 100 soal',             unlocked: false },
  { icon: '🎓', name: 'Profesor',        desc: 'Selesaikan semua jenis soal',     unlocked: false },
] as const;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const formatDiv = (dividend: number, divisor: number): string => {
  if (divisor === 0) return '∞';
  const result = dividend / divisor;
  if (Number.isInteger(result)) return result.toString();
  return (Math.round(result * 100) / 100).toString();
};

const isDivisible = (dividend: number, divisor: number): boolean => {
  return divisor !== 0 && dividend % divisor === 0;
};

const isPrime = (n: number): boolean => {
  if (n < 2 || !Number.isInteger(n)) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

const factorize = (n: number): number[] => {
  const result: number[] = [];
  let x = Math.floor(Math.abs(n));
  if (x < 2) return result;
  let d = 2;
  while (d * d <= x) {
    while (x % d === 0) {
      result.push(d);
      x = Math.floor(x / d);
    }
    d++;
  }
  if (x > 1) result.push(x);
  return result;
};

const gcd = (a: number, b: number): number => {
  let x = Math.abs(Math.floor(a));
  let y = Math.abs(Math.floor(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};

const lcmCalc = (a: number, b: number): number => {
  const g = gcd(a, b);
  return g ? Math.abs(a * b) / g : 0;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  onClose,
  history,
  onHistorySelect,
}) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  useEffect(() => {
    if (!isOpen) setActivePanel(null);
  }, [isOpen]);

  const activeTool = useMemo(
    () => TOOLS.find((t) => t.id === activePanel) ?? null,
    [activePanel],
  );

  const handleHistorySelect = useCallback(
    (result: MathResult) => {
      onHistorySelect(result);
      onClose();
    },
    [onHistorySelect, onClose],
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 w-full h-full bg-slate-900 z-50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🛠️ Tools
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Tutup panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!activePanel ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActivePanel(tool.id)}
                  className={`
                    p-4 rounded-xl bg-gradient-to-br ${tool.color}
                    text-white text-left transition-all
                    hover:scale-[1.02] active:scale-[0.98] shadow-lg
                  `}
                >
                  <span className="text-3xl">{tool.icon}</span>
                  <p className="mt-2 font-medium">{tool.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-white/10 flex items-center gap-2">
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  aria-label="Kembali"
                >
                  ←
                </button>
                {activeTool && (
                  <>
                    <span className="text-xl">{activeTool.icon}</span>
                    <span className="font-medium text-white">{activeTool.label}</span>
                  </>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {activePanel === 'formulas'       && <FormulasPanel />}
                {activePanel === 'multiplication' && <MultiplicationPanel />}
                {activePanel === 'division'       && <DivisionPanel />}
                {activePanel === 'tips'           && <TipsPanel />}
                {activePanel === 'whiteboard'     && <WhiteboardPanel />}
                {activePanel === 'history'        && (
                  <HistoryPanel history={history} onSelect={handleHistorySelect} />
                )}
                {activePanel === 'achievements'   && <AchievementsPanel />}
                {activePanel === 'numbers'        && <NumbersPanel />}
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
  const [activeCategory, setActiveCategory] = useState<FormulaCategory>('flat');
  const currentFormulas = FORMULA_CATEGORIES[activeCategory].formulas;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.entries(FORMULA_CATEGORIES) as [FormulaCategory, typeof FORMULA_CATEGORIES[FormulaCategory]][]).map(
          ([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeCategory === key
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}
              `}
            >
              {cat.title}
            </button>
          ),
        )}
      </div>
      <div className="space-y-3">
        {currentFormulas.map((f, idx) => (
          <div
            key={`${activeCategory}-${idx}`}
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

  const handleCellEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    const row = Number(e.currentTarget.dataset.row);
    const col = Number(e.currentTarget.dataset.col);
    if (!isNaN(row)) setHighlightRow(row);
    if (!isNaN(col)) setHighlightCol(col);
  }, []);

  const handleCellLeave = useCallback(() => {
    setHighlightRow(null);
    setHighlightCol(null);
  }, []);

  const handleHeaderColEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    setHighlightCol(Number(e.currentTarget.dataset.col));
  }, []);

  const handleHeaderColLeave = useCallback(() => {
    setHighlightCol(null);
  }, []);

  const handleHeaderRowEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    setHighlightRow(Number(e.currentTarget.dataset.row));
  }, []);

  const handleHeaderRowLeave = useCallback(() => {
    setHighlightRow(null);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-2 bg-green-500/20 text-green-300 rounded-tl-lg">×</th>
            {NUMBERS_1_TO_10.map((n) => (
              <th
                key={n}
                data-col={n}
                className={`p-2 transition-colors ${
                  highlightCol === n
                    ? 'bg-green-500/40 text-white'
                    : 'bg-green-500/20 text-green-300'
                }`}
                onMouseEnter={handleHeaderColEnter}
                onMouseLeave={handleHeaderColLeave}
              >
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NUMBERS_1_TO_10.map((row) => (
            <tr key={row}>
              <td
                data-row={row}
                className={`p-2 font-bold transition-colors ${
                  highlightRow === row
                    ? 'bg-green-500/40 text-white'
                    : 'bg-green-500/20 text-green-300'
                }`}
                onMouseEnter={handleHeaderRowEnter}
                onMouseLeave={handleHeaderRowLeave}
              >
                {row}
              </td>
              {NUMBERS_1_TO_10.map((col) => {
                const isRowHL = highlightRow === row;
                const isColHL = highlightCol === col;
                const isIntersect = isRowHL && isColHL;

                return (
                  <td
                    key={col}
                    data-row={row}
                    data-col={col}
                    className={`
                      p-2 transition-all cursor-pointer
                      ${isIntersect
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold scale-110'
                        : isRowHL || isColHL
                          ? 'bg-green-500/20 text-white font-bold scale-110'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'}
                    `}
                    onMouseEnter={handleCellEnter}
                    onMouseLeave={handleCellLeave}
                  >
                    {row * col}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// ➗ DIVISION TABLE (TABEL PEMBAGIAN)
// ==========================================

const DivisionPanel: React.FC = () => {
  const [view, setView] = useState<DivisionView>('table');
  const [highlightRow, setHighlightRow] = useState<number | null>(null);
  const [highlightCol, setHighlightCol] = useState<number | null>(null);
  const [maxNum, setMaxNum] = useState<number>(10);
  const [customN, setCustomN] = useState<string>('100');

  const numbers = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= maxNum; i++) arr.push(i);
    return arr;
  }, [maxNum]);

  const customValue = Number(customN);
  const customValid = !isNaN(customValue);

  const handleCellEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    const row = Number(e.currentTarget.dataset.row);
    const col = Number(e.currentTarget.dataset.col);
    if (!isNaN(row)) setHighlightRow(row);
    if (!isNaN(col)) setHighlightCol(col);
  }, []);

  const handleCellLeave = useCallback(() => {
    setHighlightRow(null);
    setHighlightCol(null);
  }, []);

  const handleHeaderColEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    setHighlightCol(Number(e.currentTarget.dataset.col));
  }, []);

  const handleHeaderColLeave = useCallback(() => {
    setHighlightCol(null);
  }, []);

  const handleHeaderRowEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>) => {
    setHighlightRow(Number(e.currentTarget.dataset.row));
  }, []);

  const handleHeaderRowLeave = useCallback(() => {
    setHighlightRow(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setView('table')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'table'
              ? 'bg-indigo-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          📊 Tabel Pembagian
        </button>
        <button
          onClick={() => setView('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'custom'
              ? 'bg-indigo-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          🔢 Bagi Angka Bebas
        </button>
      </div>

      {view === 'table' ? (
        <>
          {/* Range Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-400">Tabel 1 sampai:</span>
            {[10, 12, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setMaxNum(n)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  maxNum === n
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded bg-green-500/30" />
            <span>= Habis dibagi</span>
            <span className="inline-block w-3 h-3 rounded bg-white/5 ml-2" />
            <span>= Desimal</span>
          </div>

          {/* Division Table */}
          <div className="overflow-x-auto -mx-4 px-4">
            <table
              className="text-center border-collapse"
              style={{ minWidth: maxNum > 10 ? '600px' : 'auto', width: '100%' }}
            >
              <thead>
                <tr>
                  <th className="p-2 bg-indigo-500/20 text-indigo-300 rounded-tl-lg sticky left-0 z-10 backdrop-blur-sm">
                    ÷
                  </th>
                  {numbers.map((n) => (
                    <th
                      key={n}
                      data-col={n}
                      className={`p-2 transition-colors text-sm ${
                        highlightCol === n
                          ? 'bg-indigo-500/40 text-white'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                      onMouseEnter={handleHeaderColEnter}
                      onMouseLeave={handleHeaderColLeave}
                    >
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numbers.map((row) => (
                  <tr key={row}>
                    <td
                      data-row={row}
                      className={`p-2 font-bold transition-colors sticky left-0 z-10 backdrop-blur-sm text-sm ${
                        highlightRow === row
                          ? 'bg-indigo-500/40 text-white'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                      onMouseEnter={handleHeaderRowEnter}
                      onMouseLeave={handleHeaderRowLeave}
                    >
                      {row}
                    </td>
                    {numbers.map((col) => {
                      const isRowHL = highlightRow === row;
                      const isColHL = highlightCol === col;
                      const isIntersect = isRowHL && isColHL;
                      const divisible = isDivisible(row, col);
                      const result = formatDiv(row, col);

                      return (
                        <td
                          key={col}
                          data-row={row}
                          data-col={col}
                          className={`
                            p-1.5 transition-all cursor-pointer text-sm
                            ${isIntersect
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold scale-110'
                              : isRowHL || isColHL
                                ? 'bg-indigo-500/20 text-white font-semibold'
                                : divisible
                                  ? 'bg-green-500/10 text-green-300 hover:bg-green-500/20'
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }
                          `}
                          onMouseEnter={handleCellEnter}
                          onMouseLeave={handleCellLeave}
                          title={`${row} ÷ ${col} = ${result}`}
                        >
                          {result}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pola Menarik */}
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-indigo-300">📌 Pola Menarik</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Diagonal (n÷n)', desc: 'Selalu = 1',        color: 'text-green-400' },
                { label: 'Baris 1 (1÷n)',  desc: 'Selalu pecahan',    color: 'text-blue-400' },
                { label: 'Kolom 1 (n÷1)',  desc: 'Selalu = n',        color: 'text-purple-400' },
                { label: 'Kolom 2 (n÷2)',  desc: 'Setengah dari n',   color: 'text-yellow-400' },
              ].map((p, i) => (
                <div key={i} className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className={`text-sm font-medium ${p.color}`}>{p.label}</span>
                  <span className="text-xs text-gray-400 ml-2">→ {p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ---- Custom Number Division ---- */
        <>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={customN}
              onChange={(e) => setCustomN(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Masukkan angka…"
            />
            <button
              onClick={() => setCustomN('100')}
              className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
            >
              Reset
            </button>
          </div>

          {/* Hasil pembagian */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DIVISORS.map((d) => {
              const result = customValid ? customValue / d : NaN;
              const isWhole = customValid && isDivisible(customValue, d);

              return (
                <div
                  key={d}
                  className={`p-4 rounded-xl border transition-all ${
                    isWhole
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="text-xs text-indigo-300 mb-1">
                    {customValid ? customValue : '?'} ÷ {d}
                  </div>
                  <div className={`text-xl font-semibold ${isWhole ? 'text-green-400' : 'text-white'}`}>
                    {customValid ? formatDiv(customValue, d) : '—'}
                  </div>
                  {isWhole && (
                    <div className="text-xs text-green-500 mt-1">✓ Habis</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Preset */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500">Coba angka:</span>
            <div className="grid grid-cols-5 gap-2">
              {DIVISION_PRESETS.map((x) => (
                <button
                  key={x}
                  onClick={() => setCustomN(String(x))}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    customN === String(x)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>

          {/* Ringkasan */}
          {customValid && (
            <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
              <h4 className="text-sm font-medium text-indigo-300 mb-2">
                📊 Ringkasan {customValue}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">
                  Habis dibagi:{' '}
                  <span className="text-green-400 font-medium">
                    {DIVISORS.filter((d) => isDivisible(customValue, d)).join(', ') || '—'}
                  </span>
                </div>
                <div className="text-gray-400">
                  Tidak habis:{' '}
                  <span className="text-red-400 font-medium">
                    {DIVISORS.filter((d) => !isDivisible(customValue, d)).join(', ') || '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==========================================
// 💡 TIPS PANEL
// ==========================================

const TipsPanel: React.FC = () => (
  <div className="space-y-4">
    {TIPS.map((tip, idx) => (
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

// ==========================================
// ✏️ WHITEBOARD PANEL
// ==========================================

const WhiteboardPanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState<string>('#fff');
  const [brushSize, setBrushSize] = useState(3);

  const fillBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      let imageData: ImageData | null = null;
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        try {
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch {
          imageData = null;
        }
      }

      canvas.width = rect.width;
      canvas.height = 300;

      const newCtx = canvas.getContext('2d');
      if (newCtx) {
        fillBackground(newCtx, canvas.width, canvas.height);
        if (imageData) {
          newCtx.putImageData(imageData, 0, 0);
        }
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    return () => observer.disconnect();
  }, [fillBackground]);

  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0] ?? e.changedTouches[0];
        if (!touch) return { x: 0, y: 0 };
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e) e.preventDefault();
      isDrawingRef.current = true;
      lastPosRef.current = getPosition(e);
    },
    [getPosition],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current) return;
      if ('touches' in e) e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const pos = getPosition(e);
      if (!lastPosRef.current) {
        lastPosRef.current = pos;
        return;
      }

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPosRef.current = pos;
    },
    [getPosition, color, brushSize],
  );

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    fillBackground(ctx, canvas.width, canvas.height);
  }, [fillBackground]);

  return (
    <div className="space-y-4">
      <div ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-white/10 cursor-crosshair touch-none"
          style={{ height: 300 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {BRUSH_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`
                w-8 h-8 rounded-full transition-transform border-2
                ${color === c ? 'scale-125 border-white' : 'border-transparent'}
              `}
              style={{ backgroundColor: c }}
              aria-label={`Warna ${c}`}
            />
          ))}
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1 min-w-[80px]"
          aria-label="Ukuran kuas"
        />
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

const AchievementsPanel: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {ACHIEVEMENTS.map((ach, idx) => (
      <div
        key={idx}
        className={`
          p-4 rounded-xl border text-center transition-all
          ${ach.unlocked
            ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
            : 'bg-white/5 border-white/10 opacity-50'}
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

// ==========================================
// 🔍 NUMBERS PANEL
// ==========================================

const NumbersPanel: React.FC = () => {
  const [primeInput, setPrimeInput] = useState<string>('60');
  const [fpbA, setFpbA] = useState<string>('60');
  const [fpbB, setFpbB] = useState<string>('90');

  const primeValue = Number(primeInput);
  const validPrime = !isNaN(primeValue) && primeValue > 0 && Number.isInteger(primeValue);

  const primeInfo = useMemo(() => {
    if (!validPrime) return null;
    return {
      isPrime: isPrime(primeValue),
      factors: factorize(primeValue),
    };
  }, [primeValue, validPrime]);

  const aVal = Number(fpbA);
  const bVal = Number(fpbB);
  const validFpb = !isNaN(aVal) && aVal > 0 && !isNaN(bVal) && bVal > 0;

  const fpbInfo = useMemo(() => {
    if (!validFpb) return null;
    return {
      gcd: gcd(aVal, bVal),
      lcm: lcmCalc(aVal, bVal),
    };
  }, [aVal, bVal, validFpb]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cek Prima & Faktorisasi */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-teal-300 mb-2">Cek Prima & Faktorisasi</div>
          <input
            type="number"
            inputMode="numeric"
            value={primeInput}
            onChange={(e) => setPrimeInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            placeholder="Masukkan bilangan…"
          />
          <div className="mt-3 text-gray-300 text-sm space-y-1">
            {primeInfo ? (
              <>
                <div>
                  Prima:{' '}
                  <span className={primeInfo.isPrime ? 'text-green-400' : 'text-white'}>
                    {primeInfo.isPrime ? '✅ Ya' : 'Tidak'}
                  </span>
                </div>
                <div>
                  Faktor prima:{' '}
                  <span className="text-white">
                    {primeInfo.factors.length > 0 ? primeInfo.factors.join(' × ') : '—'}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Masukkan bilangan bulat positif</span>
            )}
          </div>
        </div>

        {/* FPB & KPK */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-teal-300 mb-2">FPB & KPK</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={fpbA}
              onChange={(e) => setFpbA(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="a"
            />
            <span className="text-gray-400">,</span>
            <input
              type="number"
              inputMode="numeric"
              value={fpbB}
              onChange={(e) => setFpbB(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="b"
            />
          </div>
          <div className="mt-3 text-gray-300 text-sm space-y-1">
            {fpbInfo ? (
              <>
                <div>FPB: <span className="text-white">{fpbInfo.gcd}</span></div>
                <div>KPK: <span className="text-white">{fpbInfo.lcm}</span></div>
              </>
            ) : (
              <span className="text-gray-500">Masukkan dua bilangan positif</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default ToolsPanel;