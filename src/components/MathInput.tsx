// ==========================================
// ⌨️ SAFE MATH INPUT COMPONENT
// ==========================================

import React, { useState, useCallback } from 'react';
import { MathRenderer } from './MathRenderer.tsx';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

interface ModalState {
  type: 'fraction' | 'power' | 'sqrt' | null;
  data: { numerator?: string; denominator?: string; base?: string; exp?: string; radicand?: string };
}

export const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ketik soal matematika...'
}) => {
  const [modal, setModal] = useState<ModalState>({ type: null, data: {} });
  const [showKeyboard, setShowKeyboard] = useState(true);

  const displayLatex = convertToDisplayLatex(value);

  const handleButton = useCallback((btn: string) => {
    switch (btn) {
      case 'FRAC':
        setModal({ type: 'fraction', data: { numerator: '', denominator: '' } });
        break;
      case 'POWER':
        setModal({ type: 'power', data: { base: '', exp: '' } });
        break;
      case 'SQRT':
        setModal({ type: 'sqrt', data: { radicand: '' } });
        break;
      case 'CLEAR':
        onChange('');
        break;
      case 'BACKSPACE':
        onChange(value.slice(0, -1));
        break;
      case 'SUBMIT':
        onSubmit();
        break;
      default:
        onChange(value + btn);
    }
  }, [value, onChange, onSubmit]);

  const handleModalSubmit = useCallback(() => {
    if (modal.type === 'fraction' && modal.data.numerator && modal.data.denominator) {
      if (modal.data.denominator === '0') {
        alert('Penyebut tidak boleh 0!');
        return;
      }
      onChange(value + `(${modal.data.numerator}/${modal.data.denominator})`);
    } else if (modal.type === 'power' && modal.data.base && modal.data.exp) {
      onChange(value + `(${modal.data.base}^${modal.data.exp})`);
    } else if (modal.type === 'sqrt' && modal.data.radicand) {
      const rad = parseFloat(modal.data.radicand);
      if (!isNaN(rad) && rad < 0) {
        alert('Akar kuadrat bilangan negatif tidak terdefinisi dalam bilangan real!');
        return;
      }
      onChange(value + `sqrt(${modal.data.radicand})`);
    }
    setModal({ type: null, data: {} });
  }, [modal, value, onChange]);

  const keyboardRows = [
    ['7', '8', '9', '÷', 'FRAC'],
    ['4', '5', '6', '×', 'POWER'],
    ['1', '2', '3', '-', 'SQRT'],
    ['0', '.', '=', '+', '!'],
    ['x', 'y', '(', ')', 'BACKSPACE'],
  ];

  const getButtonStyle = (btn: string) => {
    if (btn === 'SUBMIT') return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold';
    if (btn === 'BACKSPACE') return 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
    if (btn === 'CLEAR') return 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30';
    if (['FRAC', 'POWER', 'SQRT'].includes(btn)) return 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30';
    if (['+', '-', '×', '÷', '='].includes(btn)) return 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30';
    if (['x', 'y'].includes(btn)) return 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30';
    return 'bg-white/10 text-white hover:bg-white/20';
  };

  const getButtonLabel = (btn: string) => {
    switch (btn) {
      case 'FRAC': return '⁄';
      case 'POWER': return 'xⁿ';
      case 'SQRT': return '√';
      case 'BACKSPACE': return '⌫';
      case 'CLEAR': return 'C';
      default: return btn;
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Display */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 border border-white/10">
        <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
          <span>📝 Soal:</span>
          {value && (
            <button
              onClick={() => onChange('')}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Hapus semua
            </button>
          )}
        </div>
        <div className="min-h-[60px] flex items-center justify-center bg-black/30 rounded-xl p-3">
          {value ? (
            <MathRenderer latex={displayLatex} size="xl" />
          ) : (
            <span className="text-gray-500 italic">{placeholder}</span>
          )}
        </div>
        {/* Raw input (hidden but functional) */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(sanitizeInput(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          placeholder="Atau ketik langsung di sini..."
        />
      </div>

      {/* Toggle Keyboard */}
      <button
        onClick={() => setShowKeyboard(!showKeyboard)}
        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        {showKeyboard ? '▼ Sembunyikan Keyboard' : '▲ Tampilkan Keyboard'}
      </button>

      {/* Math Keyboard */}
      {showKeyboard && (
        <div className="bg-slate-800/50 rounded-2xl p-3 border border-white/10">
          <div className="grid gap-2">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                {row.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleButton(btn)}
                    className={`
                      py-3 rounded-xl font-medium text-lg transition-all duration-200
                      active:scale-95 ${getButtonStyle(btn)}
                    `}
                  >
                    {getButtonLabel(btn)}
                  </button>
                ))}
              </div>
            ))}
            {/* Submit row */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => handleButton('CLEAR')}
                className={`py-3 rounded-xl font-medium text-lg transition-all active:scale-95 ${getButtonStyle('CLEAR')}`}
              >
                🗑️ Hapus
              </button>
              <button
                onClick={() => handleButton('SUBMIT')}
                className={`py-3 rounded-xl font-medium text-lg transition-all active:scale-95 ${getButtonStyle('SUBMIT')}`}
              >
                ✨ Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Contoh:</span>
        {[
          '2 + 3 × 4',
          '(8/2)^3',
          'sqrt(144)',
          '5!',
          '2x + 5 = 15',
          'x^2 + 5x + 6 = 0'
        ].map((example) => (
          <button
            key={example}
            onClick={() => onChange(example)}
            className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Modal for special inputs */}
      {modal.type && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            {modal.type === 'fraction' && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  📐 Masukkan Pecahan
                </h3>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Pembilang (atas)"
                    value={modal.data.numerator || ''}
                    onChange={(e) => setModal({ 
                      ...modal, 
                      data: { ...modal.data, numerator: sanitizeNumber(e.target.value) } 
                    })}
                    className="w-32 text-center bg-white/10 border-b-2 border-white/30 rounded-t-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <div className="w-32 h-0.5 bg-white/50" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Penyebut (bawah)"
                    value={modal.data.denominator || ''}
                    onChange={(e) => setModal({ 
                      ...modal, 
                      data: { ...modal.data, denominator: sanitizeNumber(e.target.value) } 
                    })}
                    className="w-32 text-center bg-white/10 border-t-2 border-white/30 rounded-b-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  {modal.data.denominator === '0' && (
                    <p className="text-red-400 text-sm">⚠️ Penyebut tidak boleh 0!</p>
                  )}
                </div>
              </>
            )}

            {modal.type === 'power' && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  📊 Masukkan Pangkat
                </h3>
                <div className="flex items-start justify-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Basis"
                    value={modal.data.base || ''}
                    onChange={(e) => setModal({ 
                      ...modal, 
                      data: { ...modal.data, base: sanitizeExpression(e.target.value) } 
                    })}
                    className="w-20 text-center bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white text-lg focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="n"
                    value={modal.data.exp || ''}
                    onChange={(e) => setModal({ 
                      ...modal, 
                      data: { ...modal.data, exp: sanitizeNumber(e.target.value) } 
                    })}
                    className="w-12 text-center bg-white/10 border border-white/30 rounded-lg px-2 py-1 text-white text-sm -translate-y-2 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-center text-gray-400 text-sm mt-2">
                  Preview: {modal.data.base || 'a'}<sup>{modal.data.exp || 'n'}</sup>
                </p>
              </>
            )}

            {modal.type === 'sqrt' && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  √ Masukkan Akar Kuadrat
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl text-purple-400">√</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Bilangan"
                    value={modal.data.radicand || ''}
                    onChange={(e) => setModal({ 
                      ...modal, 
                      data: { ...modal.data, radicand: sanitizeExpression(e.target.value) } 
                    })}
                    className="w-24 text-center bg-white/10 border-t-2 border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>
                {modal.data.radicand && parseFloat(modal.data.radicand) < 0 && (
                  <p className="text-red-400 text-sm text-center mt-2">
                    ⚠️ Bilangan negatif tidak punya akar real!
                  </p>
                )}
              </>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setModal({ type: null, data: {} })}
                className="flex-1 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleModalSubmit}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Masukkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 🛡️ INPUT SANITIZATION
// ==========================================

function sanitizeInput(input: string): string {
  let sanitized = input
    .replace(/[<>{}[\]\\`'"]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 200);
  
  sanitized = sanitized
    .replace(/([+\-*/^]){2,}/g, '$1')
    .replace(/\+-/g, '-')
    .replace(/-\+/g, '-');
  
  return sanitized;
}

function sanitizeNumber(input: string): string {
  return input.replace(/[^0-9.\-]/g, '').slice(0, 20);
}

function sanitizeExpression(input: string): string {
  return input.replace(/[^0-9a-zA-Z+\-*/^().]/g, '').slice(0, 50);
}

// ==========================================
// 🔄 DISPLAY LATEX CONVERTER
// ==========================================

function convertToDisplayLatex(input: string): string {
  let latex = input;
  
  latex = latex.replace(/\(([^()]+)\/([^()]+)\)/g, 'frac{$1}{$2}');
  
  latex = latex.replace(/(\d+)\/(\d+)/g, 'frac{$1}{$2}');
  
  latex = latex.replace(/\(([^()]+)\)\^(\d+)/g, '($1) sup{$2}');
  latex = latex.replace(/([a-zA-Z0-9]+)\^(\d+)/g, '$1 sup{$2}');
  latex = latex.replace(/\^(\d+)/g, ' sup{$1}');
  
  latex = latex.replace(/sqrt\(([^()]+)\)/g, 'sqrt{$1}');
  
  latex = latex.replace(/\*/g, '×');
  
  latex = latex.replace(/÷/g, '÷');
  
  return latex;
}

export default MathInput;
