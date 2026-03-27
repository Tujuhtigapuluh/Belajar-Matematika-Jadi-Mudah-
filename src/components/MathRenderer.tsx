// ==========================================
// 🎨 LATEX-LIKE MATH RENDERER - IMPROVED
// ==========================================

import React from 'react';

interface MathRendererProps {
  latex: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Parse and render LaTeX-like math notation
export const MathRenderer: React.FC<MathRendererProps> = ({ 
  latex, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const elements = parseMathLatex(latex);

  return (
    <span className={`inline-flex items-center flex-wrap gap-1 ${sizeClasses[size]} ${className}`}>
      {elements}
    </span>
  );
};

// Main parser function
function parseMathLatex(latex: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const getKey = () => `math-${key++}`;

  while (i < latex.length) {
    // Check for special patterns

    // 0. Handle \text{} command
    if (latex.slice(i).startsWith('\\text{')) {
      const { node, endIndex } = parseTextCommand(latex, i, getKey);
      elements.push(node);
      i = endIndex;
      continue;
    }

    // 0.5 Handle \quad command (spacing)
    if (latex.slice(i).startsWith('\\quad')) {
      elements.push(
        <span key={getKey()} className="mx-4">&nbsp;</span>
      );
      i += 5;
      continue;
    }

    // 1. Fraction: frac{numerator}{denominator}
    if (latex.slice(i).startsWith('frac{')) {
      const { node, endIndex } = parseFraction(latex, i, getKey);
      elements.push(node);
      i = endIndex;
      continue;
    }

    // 2. Square root: sqrt{content}
    if (latex.slice(i).startsWith('sqrt{')) {
      const { node, endIndex } = parseSqrt(latex, i, getKey);
      elements.push(node);
      i = endIndex;
      continue;
    }

    // 3. Superscript: sup{content} or word sup{content}
    if (latex.slice(i).match(/^(\s*)sup\{/)) {
      const match = latex.slice(i).match(/^(\s*)sup\{/);
      i += match![0].length;
      const { content, endIndex } = extractBraces(latex, i);
      elements.push(
        <sup key={getKey()} className="text-[0.65em] -translate-y-1 inline-block">
          {renderContent(content, getKey)}
        </sup>
      );
      i = endIndex;
      continue;
    }

    // 4. Subscript: sub{content}
    if (latex.slice(i).match(/^(\s*)sub\{/)) {
      const match = latex.slice(i).match(/^(\s*)sub\{/);
      i += match![0].length;
      const { content, endIndex } = extractBraces(latex, i);
      elements.push(
        <sub key={getKey()} className="text-[0.65em] translate-y-0.5 inline-block">
          {renderContent(content, getKey)}
        </sub>
      );
      i = endIndex;
      continue;
    }

    // 5. Special symbols
    const symbolMatch = latex.slice(i).match(/^(π|∞|±|≠|≤|≥|→|←|↔|∈|∉|⊂|⊃|∪|∩|∅|ℝ|ℤ|ℕ|ℚ|α|β|γ|δ|θ|λ|μ|σ|φ|ω|Σ|Π|∫|∂|∇|√|✓)/);
    if (symbolMatch) {
      elements.push(
        <span key={getKey()} className="mx-0.5 text-purple-300">
          {symbolMatch[1]}
        </span>
      );
      i += symbolMatch[1].length;
      continue;
    }

    // 6. Operators with spacing
    if (latex[i] === '+' || latex[i] === '-' || latex[i] === '=' || latex[i] === '×' || latex[i] === '÷') {
      elements.push(
        <span key={getKey()} className="mx-1 text-cyan-300">
          {latex[i]}
        </span>
      );
      i++;
      continue;
    }

    // 7. Check for function names (sin, cos, tan, log, ln, sqrt)
    const funcMatch = latex.slice(i).match(/^(sin|cos|tan|log|ln|exp|abs|sqrt)\(/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      i += funcName.length;
      elements.push(
        <span key={getKey()} className="text-green-400 font-medium">
          {funcName}
        </span>
      );
      continue;
    }

    // 8. Numbers (including decimals)
    const numMatch = latex.slice(i).match(/^-?\d+\.?\d*/);
    if (numMatch) {
      elements.push(
        <span key={getKey()} className="text-yellow-200 font-medium">
          {numMatch[0]}
        </span>
      );
      i += numMatch[0].length;
      continue;
    }

    // 9. Variables (single letters)
    if (/[a-zA-Z]/.test(latex[i])) {
      elements.push(
        <span key={getKey()} className="text-pink-300 italic font-serif">
          {latex[i]}
        </span>
      );
      i++;
      continue;
    }

    // 10. Parentheses with styling
    if (latex[i] === '(' || latex[i] === ')') {
      elements.push(
        <span key={getKey()} className="text-gray-300 font-light">
          {latex[i]}
        </span>
      );
      i++;
      continue;
    }

    // 11. Whitespace
    if (latex[i] === ' ') {
      elements.push(<span key={getKey()}>&nbsp;</span>);
      i++;
      continue;
    }

    // 12. Backslash commands (generic)
    if (latex[i] === '\\') {
      // Skip unknown commands
      const cmdMatch = latex.slice(i).match(/^\\[a-zA-Z]+/);
      if (cmdMatch) {
        i += cmdMatch[0].length;
        continue;
      }
    }

    // Default: just render the character
    elements.push(<span key={getKey()}>{latex[i]}</span>);
    i++;
  }

  return elements;
}

// Parse \text{} command
function parseTextCommand(
  latex: string,
  startIndex: number,
  getKey: () => string
): { node: React.ReactNode; endIndex: number } {
  let i = startIndex + 6; // Skip '\text{'
  
  const { content, endIndex } = extractBraces(latex, i);

  const node = (
    <span key={getKey()} className="text-gray-300 font-normal mx-1">
      {content}
    </span>
  );

  return { node, endIndex };
}

// Parse fraction: frac{num}{denom}
function parseFraction(
  latex: string, 
  startIndex: number,
  getKey: () => string
): { node: React.ReactNode; endIndex: number } {
  let i = startIndex + 5; // Skip 'frac{'
  
  const { content: numerator, endIndex: afterNum } = extractBraces(latex, i);
  i = afterNum;
  
  // Skip to next {
  while (i < latex.length && latex[i] !== '{') i++;
  i++; // Skip {
  
  const { content: denominator, endIndex: afterDenom } = extractBraces(latex, i);

  const node = (
    <span key={getKey()} className="inline-flex flex-col items-center mx-1">
      <span className="px-1 pb-0.5 text-[0.85em]">
        {renderContent(numerator, getKey)}
      </span>
      <span className="w-full h-[2px] bg-current rounded-full" />
      <span className="px-1 pt-0.5 text-[0.85em]">
        {renderContent(denominator, getKey)}
      </span>
    </span>
  );

  return { node, endIndex: afterDenom };
}

// Parse square root: sqrt{content}
function parseSqrt(
  latex: string,
  startIndex: number,
  getKey: () => string
): { node: React.ReactNode; endIndex: number } {
  let i = startIndex + 5; // Skip 'sqrt{'
  
  const { content, endIndex } = extractBraces(latex, i);

  const node = (
    <span key={getKey()} className="inline-flex items-stretch mx-1">
      {/* Radical symbol */}
      <span className="relative flex items-end">
        <svg 
          className="h-full w-3 text-purple-400" 
          viewBox="0 0 12 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          preserveAspectRatio="none"
        >
          <path d="M1 12 L4 20 L10 2" />
        </svg>
      </span>
      {/* Content with top line */}
      <span className="border-t-2 border-purple-400 px-1 min-w-[1rem]">
        {renderContent(content, getKey)}
      </span>
    </span>
  );

  return { node, endIndex };
}

// Extract content within braces
function extractBraces(latex: string, startIndex: number): { content: string; endIndex: number } {
  let depth = 1;
  let i = startIndex;
  let content = '';

  while (i < latex.length && depth > 0) {
    if (latex[i] === '{') depth++;
    else if (latex[i] === '}') {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    if (depth > 0) content += latex[i];
    i++;
  }

  return { content, endIndex: i };
}

// Recursively render content
function renderContent(content: string, getKey: () => string): React.ReactNode {
  if (content.includes('frac{') || content.includes('sqrt{') || 
      content.includes('sup{') || content.includes('sub{') ||
      content.includes('\\text{') || content.includes('\\quad')) {
    return <>{parseMathLatex(content)}</>;
  }
  
  const elements: React.ReactNode[] = [];
  let buffer = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (/[0-9.]/.test(char)) {
      if (buffer) {
        elements.push(
          <span key={getKey()} className="text-pink-300 italic font-serif">{buffer}</span>
        );
        buffer = '';
      }
      let num = char;
      while (i + 1 < content.length && /[0-9.]/.test(content[i + 1])) {
        num += content[++i];
      }
      elements.push(
        <span key={getKey()} className="text-yellow-200 font-medium">{num}</span>
      );
    } else if (/[a-zA-Z]/.test(char)) {
      buffer += char;
    } else if (['+', '-', '×', '÷', '='].includes(char)) {
      if (buffer) {
        elements.push(
          <span key={getKey()} className="text-pink-300 italic font-serif">{buffer}</span>
        );
        buffer = '';
      }
      elements.push(
        <span key={getKey()} className="mx-1 text-cyan-300">{char}</span>
      );
    } else if (char === ' ') {
      if (buffer) {
        elements.push(
          <span key={getKey()} className="text-pink-300 italic font-serif">{buffer}</span>
        );
        buffer = '';
      }
      elements.push(<span key={getKey()}>&nbsp;</span>);
    } else {
      if (buffer) {
        elements.push(
          <span key={getKey()} className="text-pink-300 italic font-serif">{buffer}</span>
        );
        buffer = '';
      }
      elements.push(<span key={getKey()}>{char}</span>);
    }
  }
  
  if (buffer) {
    elements.push(
      <span key={getKey()} className="text-pink-300 italic font-serif">{buffer}</span>
    );
  }
  
  return <>{elements}</>;
}

// ==========================================
// 📐 DISPLAY MATH BLOCK
// ==========================================

interface MathBlockProps {
  latex: string;
  description?: string;
  explanation?: string;
  highlight?: boolean;
}

export const MathBlock: React.FC<MathBlockProps> = ({
  latex,
  description,
  explanation,
  highlight = false
}) => {
  return (
    <div className={`
      p-4 rounded-xl transition-all duration-300
      ${highlight 
        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
        : 'bg-white/5 border border-white/10'
      }
    `}>
      {description && (
        <div className="text-sm text-gray-400 mb-2 font-medium">
          {description}
        </div>
      )}
      <div className="flex items-center justify-center py-2 overflow-x-auto">
        <MathRenderer latex={latex} size="lg" />
      </div>
      {explanation && (
        <div className="text-sm text-gray-500 mt-2 italic border-t border-white/5 pt-2">
          💡 {explanation}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 📝 INLINE MATH
// ==========================================

export const InlineMath: React.FC<{ latex: string }> = ({ latex }) => {
  return (
    <span className="inline-flex items-center px-1 py-0.5 bg-white/5 rounded">
      <MathRenderer latex={latex} size="sm" />
    </span>
  );
};

export default MathRenderer;