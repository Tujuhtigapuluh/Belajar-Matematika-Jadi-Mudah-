// ==========================================
// 🎨 LATEX-LIKE MATH RENDERER - FIXED VERSION
// ==========================================

import React from 'react';

interface MathRendererProps {
  latex: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

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

  // Pre-process to handle backslash commands
  const processedLatex = preprocessLatex(latex);
  const elements = parseMathLatex(processedLatex);

  return (
    <span className={`inline-flex items-center flex-wrap gap-1 ${sizeClasses[size]} ${className}`}>
      {elements}
    </span>
  );
};

// Pre-process LaTeX to normalize commands
function preprocessLatex(latex: string): string {
  return latex
    .replace(/\\\\/g, '\\') // Handle escaped backslashes
    .replace(/\\quad/g, ' QUAD ') // Replace \quad with marker
    .replace(/\\text\{([^}]*)\}/g, ' TEXT{$1} ') // Replace \text{...} with marker
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\checkmark/g, '✓')
    .trim();
}

function parseMathLatex(latex: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const getKey = () => `math-${key++}`;

  while (i < latex.length) {
    // Skip whitespace
    if (latex[i] === ' ') {
      elements.push(<span key={getKey()}>&nbsp;</span>);
      i++;
      continue;
    }

    // Handle QUAD marker (from \quad)
    if (latex.slice(i, i + 6) === ' QUAD ') {
      elements.push(<span key={getKey()} className="mx-6">&nbsp;</span>);
      i += 6;
      continue;
    }

    // Handle TEXT marker (from \text{...})
    const textMatch = latex.slice(i).match(/^ TEXT\{([^}]*)\} /);
    if (textMatch) {
      elements.push(
        <span key={getKey()} className="text-gray-300 font-normal mx-1">
          {textMatch[1]}
        </span>
      );
      i += textMatch[0].length;
      continue;
    }

    // Fraction: frac{numerator}{denominator}
    if (latex.slice(i, i + 5) === 'frac{') {
      const { node, endIndex } = parseFraction(latex, i, getKey);
      elements.push(node);
      i = endIndex;
      continue;
    }

    // Square root: sqrt{content}
    if (latex.slice(i, i + 5) === 'sqrt{') {
      const { node, endIndex } = parseSqrt(latex, i, getKey);
      elements.push(node);
      i = endIndex;
      continue;
    }

    // Superscript: sup{content}
    if (latex.slice(i, i + 4) === 'sup{') {
      i += 4;
      const { content, endIndex } = extractBraces(latex, i);
      elements.push(
        <sup key={getKey()} className="text-[0.65em] -translate-y-1 inline-block">
          {renderContent(content, getKey)}
        </sup>
      );
      i = endIndex;
      continue;
    }

    // Subscript: sub{content}
    if (latex.slice(i, i + 4) === 'sub{') {
      i += 4;
      const { content, endIndex } = extractBraces(latex, i);
      elements.push(
        <sub key={getKey()} className="text-[0.65em] translate-y-0.5 inline-block">
          {renderContent(content, getKey)}
        </sub>
      );
      i = endIndex;
      continue;
    }

    // Special symbols
    const symbolMatch = latex.slice(i).match(/^(π|∞|±|≠|≤|≥|→|←|↔|∈|∉|⊂|⊃|∪|∩|∅|ℝ|ℤ|ℕ|ℚ|α|β|γ|δ|θ|λ|μ|σ|φ|ω|Σ|Π|∫|∂|∇|√|✓|✗|·|×|÷)/);
    if (symbolMatch) {
      elements.push(
        <span key={getKey()} className="mx-0.5 text-purple-300">
          {symbolMatch[1]}
        </span>
      );
      i += symbolMatch[1].length;
      continue;
    }

    // Operators
    if (['+', '-', '=', '×', '÷'].includes(latex[i])) {
      elements.push(
        <span key={getKey()} className="mx-1 text-cyan-300">
          {latex[i]}
        </span>
      );
      i++;
      continue;
    }

    // Numbers (including decimals and negative)
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

    // Variables (letters)
    if (/[a-zA-Z]/.test(latex[i])) {
      elements.push(
        <span key={getKey()} className="text-pink-300 italic font-serif">
          {latex[i]}
        </span>
      );
      i++;
      continue;
    }

    // Parentheses
    if (latex[i] === '(' || latex[i] === ')') {
      elements.push(
        <span key={getKey()} className="text-gray-300 font-light">
          {latex[i]}
        </span>
      );
      i++;
      continue;
    }

    // Skip unknown characters
    i++;
  }

  return elements;
}

function parseFraction(latex: string, startIndex: number, getKey: () => string) {
  let i = startIndex + 5; // Skip 'frac{'
  const { content: num, endIndex: afterNum } = extractBraces(latex, i);
  i = afterNum;
  
  // Skip to next {
  while (i < latex.length && latex[i] !== '{') i++;
  if (i >= latex.length) return { node: <span key={getKey()}>frac error</span>, endIndex: i };
  i++; // Skip {
  
  const { content: den, endIndex } = extractBraces(latex, i);

  return {
    node: (
      <span key={getKey()} className="inline-flex flex-col items-center mx-1">
        <span className="px-1 pb-0.5 text-[0.85em]">{renderContent(num, getKey)}</span>
        <span className="w-full h-[2px] bg-current rounded-full" />
        <span className="px-1 pt-0.5 text-[0.85em]">{renderContent(den, getKey)}</span>
      </span>
    ),
    endIndex
  };
}

function parseSqrt(latex: string, startIndex: number, getKey: () => string) {
  let i = startIndex + 5; // Skip 'sqrt{'
  const { content, endIndex } = extractBraces(latex, i);

  return {
    node: (
      <span key={getKey()} className="inline-flex items-stretch mx-1">
        <span className="text-purple-400 text-lg">√</span>
        <span className="border-t-2 border-purple-400 px-1 pt-0.5 min-w-[1rem]">
          {renderContent(content, getKey)}
        </span>
      </span>
    ),
    endIndex
  };
}

function extractBraces(latex: string, startIndex: number) {
  let depth = 1, i = startIndex, content = '';
  
  while (i < latex.length && depth > 0) {
    if (latex[i] === '{') {
      depth++;
      if (depth > 1) content += '{';
    } else if (latex[i] === '}') {
      depth--;
      if (depth > 0) content += '}';
    } else {
      content += latex[i];
    }
    i++;
  }
  
  return { content, endIndex: i };
}

function renderContent(content: string, getKey: () => string) {
  // Check if content contains LaTeX commands
  if (content.includes('frac{') || content.includes('sqrt{') || 
      content.includes('sup{') || content.includes('sub{') ||
      content.includes(' QUAD ') || content.includes(' TEXT{')) {
    return <>{parseMathLatex(content)}</>;
  }
  
  // Simple text rendering
  const elements: React.ReactNode[] = [];
  let buffer = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (/[0-9.]/.test(char)) {
      if (buffer) {
        elements.push(<span key={getKey()} className="text-pink-300 italic">{buffer}</span>);
        buffer = '';
      }
      let num = char;
      while (i + 1 < content.length && /[0-9.]/.test(content[i + 1])) {
        num += content[++i];
      }
      elements.push(<span key={getKey()} className="text-yellow-200 font-medium">{num}</span>);
    } else if (/[a-zA-Z]/.test(char)) {
      buffer += char;
    } else if (['+', '-', '=', '×', '÷'].includes(char)) {
      if (buffer) {
        elements.push(<span key={getKey()} className="text-pink-300 italic">{buffer}</span>);
        buffer = '';
      }
      elements.push(<span key={getKey()} className="mx-1 text-cyan-300">{char}</span>);
    } else if (char === ' ') {
      if (buffer) {
        elements.push(<span key={getKey()} className="text-pink-300 italic">{buffer}</span>);
        buffer = '';
      }
      elements.push(<span key={getKey()}>&nbsp;</span>);
    } else {
      if (buffer) {
        elements.push(<span key={getKey()} className="text-pink-300 italic">{buffer}</span>);
        buffer = '';
      }
      elements.push(<span key={getKey()}>{char}</span>);
    }
  }
  
  if (buffer) {
    elements.push(<span key={getKey()} className="text-pink-300 italic">{buffer}</span>);
  }
  
  return <>{elements}</>;
}

// MathBlock dan InlineMath tetap sama
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

export const InlineMath: React.FC<{ latex: string }> = ({ latex }) => {
  return (
    <span className="inline-flex items-center px-1 py-0.5 bg-white/5 rounded">
      <MathRenderer latex={latex} size="sm" />
    </span>
  );
};

export default MathRenderer;