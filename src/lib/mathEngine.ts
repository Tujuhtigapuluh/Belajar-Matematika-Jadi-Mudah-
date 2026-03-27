// ==========================================
// 🧮 SYMBOLIC MATH ENGINE - Wolfram Mini
// ==========================================

// Token Types
export type TokenType = 
  | 'NUMBER' | 'VARIABLE' | 'OPERATOR' | 'FUNCTION' 
  | 'LPAREN' | 'RPAREN' | 'EQUALS' | 'COMMA' | 'FACTORIAL' | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

// AST Node Types
export type NodeType = 
  | 'Number' | 'Variable' | 'BinaryOp' | 'UnaryOp' 
  | 'Function' | 'Equation' | 'Factorial';

export interface ASTNode {
  type: NodeType;
  value?: number | string;
  operator?: string;
  left?: ASTNode;
  right?: ASTNode;
  argument?: ASTNode;
  name?: string;
  args?: ASTNode[];
}

// Result Types
export interface MathResult {
  success: boolean;
  input: string;
  latex: string;
  result?: string | number;
  resultLatex?: string;
  steps: MathStep[];
  notes: string[];
  error?: string;
  type: 'arithmetic' | 'equation' | 'simplify' | 'factor' | 'expand' | 'derivative' | 'error';
}

export interface MathStep {
  description: string;
  latex: string;
  explanation?: string;
}

// ==========================================
// 🔤 TOKENIZER (Lexer)
// ==========================================

export class Tokenizer {
  private input: string;
  private pos: number = 0;
  private tokens: Token[] = [];

  constructor(input: string) {
    // Sanitize input
    this.input = this.sanitize(input);
  }

  private sanitize(input: string): string {
    return input
      .replace(/\s+/g, ' ')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/√/g, 'sqrt')
      .replace(/\^/g, '^')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/⁵/g, '^5')
      .replace(/⁶/g, '^6')
      .replace(/⁷/g, '^7')
      .replace(/⁸/g, '^8')
      .replace(/⁹/g, '^9')
      .replace(/⁰/g, '^0')
      .replace(/π/g, 'pi')
      .trim();
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.pos = 0;

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];

      // Numbers (including decimals)
      if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.input[this.pos + 1] || ''))) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Variables and Functions
      if (/[a-zA-Z_]/.test(char)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Operators
      if (/[+\-*/^]/.test(char)) {
        this.tokens.push({ type: 'OPERATOR', value: char, position: this.pos });
        this.pos++;
        continue;
      }

      // Parentheses
      if (char === '(') {
        this.tokens.push({ type: 'LPAREN', value: '(', position: this.pos });
        this.pos++;
        continue;
      }
      if (char === ')') {
        this.tokens.push({ type: 'RPAREN', value: ')', position: this.pos });
        this.pos++;
        continue;
      }

      // Equals
      if (char === '=') {
        this.tokens.push({ type: 'EQUALS', value: '=', position: this.pos });
        this.pos++;
        continue;
      }

      // Comma
      if (char === ',') {
        this.tokens.push({ type: 'COMMA', value: ',', position: this.pos });
        this.pos++;
        continue;
      }

      // Factorial
      if (char === '!') {
        this.tokens.push({ type: 'FACTORIAL', value: '!', position: this.pos });
        this.pos++;
        continue;
      }

      // Unknown character - skip
      this.pos++;
    }

    this.tokens.push({ type: 'EOF', value: '', position: this.pos });
    return this.tokens;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private readNumber(): Token {
    const start = this.pos;
    let hasDecimal = false;

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];
      if (/[0-9]/.test(char)) {
        this.pos++;
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        this.pos++;
      } else {
        break;
      }
    }

    return { type: 'NUMBER', value: this.input.slice(start, this.pos), position: start };
  }

  private readIdentifier(): Token {
    const start = this.pos;
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      this.pos++;
    }

    const value = this.input.slice(start, this.pos);
    const functions = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'exp', 'pi', 'e'];
    
    if (functions.includes(value.toLowerCase())) {
      return { type: 'FUNCTION', value: value.toLowerCase(), position: start };
    }

    return { type: 'VARIABLE', value, position: start };
  }
}

// ==========================================
// 🌳 PARSER (AST Builder)
// ==========================================

export class Parser {
  private tokens: Token[] = [];
  private pos: number = 0;

  parse(input: string): ASTNode {
    const tokenizer = new Tokenizer(input);
    this.tokens = tokenizer.tokenize();
    this.pos = 0;

    const result = this.parseEquation();
    return result;
  }

  private current(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: '', position: 0 };
  }

  private consume(type?: TokenType): Token {
    const token = this.current();
    if (type && token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    this.pos++;
    return token;
  }

  private parseEquation(): ASTNode {
    const left = this.parseExpression();
    
    if (this.current().type === 'EQUALS') {
      this.consume('EQUALS');
      const right = this.parseExpression();
      return { type: 'Equation', left, right };
    }
    
    return left;
  }

  private parseExpression(): ASTNode {
    return this.parseAdditive();
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();

    while (this.current().type === 'OPERATOR' && ['+', '-'].includes(this.current().value)) {
      const operator = this.consume().value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryOp', operator, left, right };
    }

    return left;
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parsePower();

    while (this.current().type === 'OPERATOR' && ['*', '/'].includes(this.current().value)) {
      const operator = this.consume().value;
      const right = this.parsePower();
      left = { type: 'BinaryOp', operator, left, right };
    }

    // Implicit multiplication: 2x, xy, 2(3+4), x(y), (x)(y)
    const canImplicitMultiply = (prev: Token | undefined, curr: Token): boolean => {
      if (!prev) return false;
      
      const prevTypes = ['NUMBER', 'VARIABLE', 'RPAREN'];
      const currTypes = ['NUMBER', 'VARIABLE', 'FUNCTION', 'LPAREN'];
      
      return prevTypes.includes(prev.type) && currTypes.includes(curr.type);
    };

    while (canImplicitMultiply(this.tokens[this.pos - 1], this.current())) {
      const right = this.parsePower();
      left = { type: 'BinaryOp', operator: '*', left, right };
    }

    return left;
  }

  private parsePower(): ASTNode {
    let left = this.parseUnary();

    if (this.current().type === 'OPERATOR' && this.current().value === '^') {
      this.consume();
      const right = this.parsePower(); // Right associative
      left = { type: 'BinaryOp', operator: '^', left, right };
    }

    return left;
  }

  private parseUnary(): ASTNode {
    if (this.current().type === 'OPERATOR' && ['+', '-'].includes(this.current().value)) {
      const operator = this.consume().value;
      const argument = this.parseUnary();
      return { type: 'UnaryOp', operator, argument };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): ASTNode {
    let node = this.parsePrimary();

    while (this.current().type === 'FACTORIAL') {
      this.consume();
      node = { type: 'Factorial', argument: node };
    }

    return node;
  }

  private parsePrimary(): ASTNode {
    const token = this.current();

    // Number
    if (token.type === 'NUMBER') {
      this.consume();
      return { type: 'Number', value: parseFloat(token.value) };
    }

    // Constants
    if (token.type === 'FUNCTION') {
      if (token.value === 'pi') {
        this.consume();
        return { type: 'Number', value: Math.PI };
      }
      if (token.value === 'e') {
        this.consume();
        return { type: 'Number', value: Math.E };
      }

      // Function call
      const name = token.value;
      this.consume();
      
      if (this.current().type === 'LPAREN') {
        this.consume('LPAREN');
        const args: ASTNode[] = [];
        
        if (this.current().type !== 'RPAREN') {
          args.push(this.parseExpression());
          while (this.current().type === 'COMMA') {
            this.consume();
            args.push(this.parseExpression());
          }
        }
        
        this.consume('RPAREN');
        return { type: 'Function', name, args };
      } else {
        // sqrt16 tanpa kurung
        if (this.current().type === 'NUMBER' || this.current().type === 'VARIABLE') {
          const arg = this.parsePrimary();
          return { type: 'Function', name, args: [arg] };
        }
        throw new Error(`Gunakan kurung untuk fungsi ${name}, contoh: ${name}(x)`);
      }
    }

    // Variable
    if (token.type === 'VARIABLE') {
      this.consume();
      return { type: 'Variable', value: token.value };
    }

    // Parentheses
    if (token.type === 'LPAREN') {
      this.consume('LPAREN');
      const expr = this.parseExpression();
      this.consume('RPAREN');
      return expr;
    }

    throw new Error(`Unexpected token: ${token.type} (${token.value})`);
  }
}

// ==========================================
// 🔢 EVALUATOR
// ==========================================

export class Evaluator {
  private variables: Map<string, number> = new Map();

  setVariable(name: string, value: number): void {
    this.variables.set(name, value);
  }

  evaluate(node: ASTNode): number {
    switch (node.type) {
      case 'Number':
        return node.value as number;

      case 'Variable': {
        const value = this.variables.get(node.value as string);
        if (value === undefined) {
          throw new Error(`Variabel "${node.value}" tidak diketahui nilainya`);
        }
        return value;
      }

      case 'BinaryOp': {
        const left = this.evaluate(node.left!);
        const right = this.evaluate(node.right!);
        
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': 
            if (right === 0) throw new Error('Pembagian dengan nol tidak terdefinisi dalam bilangan real');
            return left / right;
          case '^': return Math.pow(left, right);
          default: throw new Error(`Operator tidak dikenal: ${node.operator}`);
        }
      }

      case 'UnaryOp': {
        const arg = this.evaluate(node.argument!);
        switch (node.operator) {
          case '+': return arg;
          case '-': return -arg;
          default: throw new Error(`Operator unary tidak dikenal: ${node.operator}`);
        }
      }

      case 'Function': {
        const args = node.args!.map(arg => this.evaluate(arg));
        return this.evaluateFunction(node.name!, args);
      }

      case 'Factorial': {
        const n = this.evaluate(node.argument!);
        return this.factorial(n);
      }

      default:
        throw new Error(`Tipe node tidak dikenal: ${node.type}`);
    }
  }

  private evaluateFunction(name: string, args: number[]): number {
    const x = args[0];
    
    switch (name) {
      case 'sin': return Math.sin(x);
      case 'cos': return Math.cos(x);
      case 'tan': return Math.tan(x);
      case 'log': return Math.log10(x);
      case 'ln': return Math.log(x);
      case 'sqrt': 
        if (x < 0) throw new Error('Akar kuadrat bilangan negatif tidak terdefinisi dalam bilangan real');
        return Math.sqrt(x);
      case 'abs': return Math.abs(x);
      case 'exp': return Math.exp(x);
      default: throw new Error(`Fungsi tidak dikenal: ${name}`);
    }
  }

  private factorial(n: number): number {
    if (n < 0) throw new Error('Faktorial bilangan negatif tidak terdefinisi');
    if (!Number.isInteger(n)) throw new Error('Faktorial hanya untuk bilangan bulat');
    if (n > 170) throw new Error('Faktorial terlalu besar untuk dihitung');
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
}

// ==========================================
// 📐 LATEX CONVERTER
// ==========================================

export class LaTeXConverter {
  toLatex(node: ASTNode): string {
    switch (node.type) {
      case 'Number': {
        const num = node.value as number;
        if (Number.isInteger(num)) return num.toString();
        if (Math.abs(num - Math.PI) < 0.0001) return 'π';
        if (Math.abs(num - Math.E) < 0.0001) return 'e';
        return num.toFixed(4).replace(/\.?0+$/, '');
      }

      case 'Variable':
        return node.value as string;

      case 'BinaryOp': {
        const left = this.toLatex(node.left!);
        const right = this.toLatex(node.right!);
        
        switch (node.operator) {
          case '+': return `${left} + ${right}`;
          case '-': return `${left} - ${right}`;
          case '*': {
            const leftIsNum = node.left!.type === 'Number';
            const rightIsVar = node.right!.type === 'Variable';
            if (leftIsNum && rightIsVar) {
              return `${left}${right}`;
            }
            return `${left} × ${right}`;
          }
          case '/': return `frac{${left}}{${right}}`;
          case '^': {
            const needsParen = node.left!.type === 'BinaryOp' || node.left!.type === 'UnaryOp';
            const base = needsParen ? `(${left})` : left;
            return `${base} sup{${right}}`;
          }
          default: return `${left} ${node.operator} ${right}`;
        }
      }

      case 'UnaryOp': {
        const arg = this.toLatex(node.argument!);
        if (node.operator === '-') return `-${arg}`;
        return arg;
      }

      case 'Function': {
        const args = node.args!.map(arg => this.toLatex(arg)).join(', ');
        
        if (node.name === 'sqrt') {
          return `sqrt{${args}}`;
        }
        
        return `${node.name}(${args})`;
      }

      case 'Factorial': {
        const arg = this.toLatex(node.argument!);
        const needsParen = node.argument!.type === 'BinaryOp';
        return needsParen ? `(${arg})!` : `${arg}!`;
      }

      case 'Equation': {
        const left = this.toLatex(node.left!);
        const right = this.toLatex(node.right!);
        return `${left} = ${right}`;
      }

      default:
        return '';
    }
  }
}

// ==========================================
// 🧠 SYMBOLIC SOLVER
// ==========================================

export class SymbolicSolver {
  private parser = new Parser();
  private evaluator = new Evaluator();
  private latex = new LaTeXConverter();

  solve(input: string): MathResult {
    try {
      if (!input || input.trim() === '') {
        return this.errorResult(input, 'Silakan masukkan soal matematika');
      }

      const ast = this.parser.parse(input);
      const inputLatex = this.latex.toLatex(ast);

      if (ast.type === 'Equation') {
        return this.solveEquation(input, ast, inputLatex);
      }

      if (this.hasVariables(ast)) {
        return this.simplifyExpression(input, ast, inputLatex);
      }

      return this.evaluateArithmetic(input, ast, inputLatex);

    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('nol') || errorMsg.includes('zero')) {
        return {
          success: false,
          input,
          latex: input,
          error: 'Pembagian dengan nol tidak terdefinisi',
          steps: [{
            description: 'Error',
            latex: '\\text{Pembagian dengan nol}',
            explanation: 'Tidak bisa membagi dengan nol'
          }],
          notes: ['❌ Tidak bisa membagi dengan nol dalam matematika'],
          type: 'error'
        };
      }
      return this.errorResult(input, errorMsg);
    }
  }

  private hasVariables(node: ASTNode): boolean {
    if (node.type === 'Variable') return true;
    if (node.left && this.hasVariables(node.left)) return true;
    if (node.right && this.hasVariables(node.right)) return true;
    if (node.argument && this.hasVariables(node.argument)) return true;
    if (node.args) return node.args.some(arg => this.hasVariables(arg));
    return false;
  }

  private evaluateArithmetic(input: string, ast: ASTNode, inputLatex: string): MathResult {
    const steps: MathStep[] = [];
    const notes: string[] = [];

    steps.push({
      description: 'Soal yang diberikan',
      latex: inputLatex,
      explanation: 'Mari kita selesaikan langkah demi langkah'
    });

    const detailedSteps = this.generateArithmeticSteps(ast);
    steps.push(...detailedSteps);

    const result = this.evaluator.evaluate(ast);
    const resultLatex = this.formatNumber(result);

    steps.push({
      description: 'Hasil akhir',
      latex: `${inputLatex} = ${resultLatex}`,
      explanation: 'Jawaban sudah dalam bentuk paling sederhana'
    });

    notes.push('✅ Perhitungan selesai dengan benar');
    if (Number.isInteger(result)) {
      notes.push('📝 Hasil adalah bilangan bulat');
    } else {
      notes.push('📝 Hasil adalah bilangan desimal');
    }

    return {
      success: true,
      input,
      latex: inputLatex,
      result,
      resultLatex,
      steps,
      notes,
      type: 'arithmetic'
    };
  }

  private generateArithmeticSteps(ast: ASTNode): MathStep[] {
    const steps: MathStep[] = [];
    this.collectSteps(ast, steps);
    return steps;
  }

  private collectSteps(node: ASTNode, steps: MathStep[], depth: number = 0): number {
    switch (node.type) {
      case 'Number':
        return node.value as number;

      case 'BinaryOp': {
        const left = this.collectSteps(node.left!, steps, depth + 1);
        const right = this.collectSteps(node.right!, steps, depth + 1);
        
        let result: number;
        let opName: string;
        let opSymbol: string;
        
        switch (node.operator) {
          case '+':
            result = left + right;
            opName = 'Penjumlahan';
            opSymbol = '+';
            break;
          case '-':
            result = left - right;
            opName = 'Pengurangan';
            opSymbol = '-';
            break;
          case '*':
            result = left * right;
            opName = 'Perkalian';
            opSymbol = '×';
            break;
          case '/':
            if (right === 0) throw new Error('Pembagian dengan nol');
            result = left / right;
            opName = 'Pembagian';
            opSymbol = '/';
            break;
          case '^':
            result = Math.pow(left, right);
            opName = 'Perpangkatan';
            opSymbol = '^';
            break;
          default:
            throw new Error('Operator tidak dikenal');
        }

        if (depth > 0 || (node.left!.type !== 'Number' || node.right!.type !== 'Number')) {
          if (node.operator === '/') {
            steps.push({
              description: opName,
              latex: `frac{${this.formatNumber(left)}}{${this.formatNumber(right)}} = ${this.formatNumber(result)}`,
              explanation: `${this.formatNumber(left)} dibagi ${this.formatNumber(right)} = ${this.formatNumber(result)}`
            });
          } else if (node.operator === '^') {
            steps.push({
              description: opName,
              latex: `${this.formatNumber(left)} sup{${this.formatNumber(right)}} = ${this.formatNumber(result)}`,
              explanation: `${this.formatNumber(left)} pangkat ${this.formatNumber(right)} = ${this.formatNumber(result)}`
            });
          } else {
            steps.push({
              description: opName,
              latex: `${this.formatNumber(left)} ${opSymbol} ${this.formatNumber(right)} = ${this.formatNumber(result)}`,
              explanation: `${this.formatNumber(left)} ${opName.toLowerCase()} ${this.formatNumber(right)} = ${this.formatNumber(result)}`
            });
          }
        }

        return result;
      }

      case 'UnaryOp': {
        const arg = this.collectSteps(node.argument!, steps, depth + 1);
        if (node.operator === '-') {
          steps.push({
            description: 'Negasi',
            latex: `-${this.formatNumber(arg)} = ${this.formatNumber(-arg)}`,
            explanation: 'Mengubah tanda bilangan'
          });
          return -arg;
        }
        return arg;
      }

      case 'Function': {
        const args = node.args!.map(arg => this.collectSteps(arg, steps, depth + 1));
        const result = this.evaluateFunction(node.name!, args);
        
        if (node.name === 'sqrt') {
          steps.push({
            description: 'Akar kuadrat',
            latex: `sqrt{${this.formatNumber(args[0])}} = ${this.formatNumber(result)}`,
            explanation: `Akar kuadrat dari ${this.formatNumber(args[0])} = ${this.formatNumber(result)}`
          });
        } else {
          steps.push({
            description: `Fungsi ${node.name}`,
            latex: `${node.name}(${args.map(a => this.formatNumber(a)).join(', ')}) = ${this.formatNumber(result)}`,
            explanation: `Menghitung ${node.name} dari ${args[0]}`
          });
        }
        
        return result;
      }

      case 'Factorial': {
        const n = this.collectSteps(node.argument!, steps, depth + 1);
        const result = this.factorial(n);
        
        if (n > 1 && n <= 10) {
          const expansion = Array.from({length: n}, (_, i) => n - i).join(' × ');
          steps.push({
            description: 'Faktorial',
            latex: `${n}! = ${expansion} = ${result}`,
            explanation: `${n} faktorial adalah perkalian ${n} sampai 1`
          });
        } else {
          steps.push({
            description: 'Faktorial',
            latex: `${n}! = ${this.formatNumber(result)}`,
            explanation: `${n} faktorial = ${this.formatNumber(result)}`
          });
        }
        
        return result;
      }

      default:
        throw new Error('Tipe node tidak dikenal');
    }
  }

  private evaluateFunction(name: string, args: number[]): number {
    const x = args[0];
    switch (name) {
      case 'sin': return Math.sin(x);
      case 'cos': return Math.cos(x);
      case 'tan': return Math.tan(x);
      case 'log': return Math.log10(x);
      case 'ln': return Math.log(x);
      case 'sqrt': 
        if (x < 0) throw new Error('Akar kuadrat bilangan negatif tidak terdefinisi');
        return Math.sqrt(x);
      case 'abs': return Math.abs(x);
      case 'exp': return Math.exp(x);
      default: throw new Error(`Fungsi tidak dikenal: ${name}`);
    }
  }

  private factorial(n: number): number {
    if (n < 0) throw new Error('Faktorial negatif tidak terdefinisi');
    if (!Number.isInteger(n)) throw new Error('Faktorial hanya untuk bilangan bulat');
    if (n > 170) throw new Error('Faktorial terlalu besar');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  private solveEquation(input: string, ast: ASTNode, inputLatex: string): MathResult {
    const steps: MathStep[] = [];
    const notes: string[] = [];

    steps.push({
      description: 'Persamaan yang diberikan',
      latex: inputLatex,
      explanation: 'Mari kita selesaikan persamaan ini'
    });

    const variable = this.findVariable(ast);
    if (!variable) {
      return this.errorResult(input, 'Tidak ditemukan variabel dalam persamaan');
    }

    const degree = this.getPolynomialDegree(ast, variable);
    
    if (degree === 1) {
      return this.solveLinear(input, ast, inputLatex, variable, steps, notes);
    } else if (degree === 2) {
      return this.solveQuadratic(input, ast, inputLatex, variable, steps, notes);
    } else {
      return this.errorResult(input, `Persamaan derajat ${degree} belum didukung`);
    }
  }

  private findVariable(node: ASTNode): string | null {
    if (node.type === 'Variable') return node.value as string;
    if (node.left) {
      const v = this.findVariable(node.left);
      if (v) return v;
    }
    if (node.right) {
      const v = this.findVariable(node.right);
      if (v) return v;
    }
    if (node.argument) return this.findVariable(node.argument);
    if (node.args) {
      for (const arg of node.args) {
        const v = this.findVariable(arg);
        if (v) return v;
      }
    }
    return null;
  }

  private getPolynomialDegree(node: ASTNode, variable: string): number {
    const coeffs = this.extractCoefficients(node, variable);
    return Math.max(...Object.keys(coeffs).map(Number));
  }

  private extractCoefficients(node: ASTNode, variable: string): Record<number, number> {
    const coeffs: Record<number, number> = { 0: 0 };
    
    this.collectTerms(node.left!, variable, coeffs, 1);
    this.collectTerms(node.right!, variable, coeffs, -1);
    
    return coeffs;
  }

  private collectTerms(node: ASTNode, variable: string, coeffs: Record<number, number>, sign: number): void {
    if (node.type === 'Number') {
      coeffs[0] = (coeffs[0] || 0) + sign * (node.value as number);
    } else if (node.type === 'Variable') {
      if (node.value === variable) {
        coeffs[1] = (coeffs[1] || 0) + sign;
      }
    } else if (node.type === 'BinaryOp') {
      if (node.operator === '+') {
        this.collectTerms(node.left!, variable, coeffs, sign);
        this.collectTerms(node.right!, variable, coeffs, sign);
      } else if (node.operator === '-') {
        this.collectTerms(node.left!, variable, coeffs, sign);
        this.collectTerms(node.right!, variable, coeffs, -sign);
      } else if (node.operator === '*') {
        if (node.left!.type === 'Number' && node.right!.type === 'Variable') {
          if (node.right!.value === variable) {
            coeffs[1] = (coeffs[1] || 0) + sign * (node.left!.value as number);
          }
        } else if (node.left!.type === 'Variable' && node.right!.type === 'Number') {
          if (node.left!.value === variable) {
            coeffs[1] = (coeffs[1] || 0) + sign * (node.right!.value as number);
          }
        } else if (
          node.left!.type === 'Number' &&
          node.right!.type === 'BinaryOp' &&
          node.right!.operator === '^' &&
          node.right!.left!.type === 'Variable' &&
          node.right!.left!.value === variable
        ) {
          const power = node.right!.right!.value as number;
          coeffs[power] = (coeffs[power] || 0) + sign * (node.left!.value as number);
        }
      } else if (node.operator === '^') {
        if (node.left!.type === 'Variable' && node.left!.value === variable) {
          const power = node.right!.type === 'Number' ? (node.right!.value as number) : 1;
          coeffs[power] = (coeffs[power] || 0) + sign;
        }
      }
    } else if (node.type === 'UnaryOp' && node.operator === '-') {
      this.collectTerms(node.argument!, variable, coeffs, -sign);
    }
  }

  private solveLinear(
    input: string, 
    ast: ASTNode, 
    inputLatex: string, 
    variable: string,
    steps: MathStep[],
    notes: string[]
  ): MathResult {
    const leftTerms = this.flattenExpression(ast.left!, variable);
    const rightTerms = this.flattenExpression(ast.right!, variable);

    let varCoeff = leftTerms.varCoeff - rightTerms.varCoeff;
    let constant = rightTerms.constant - leftTerms.constant;

    // Langkah 1: Identifikasi komponen
    steps.push({
      description: 'Identifikasi komponen persamaan',
      latex: `${this.formatNumber(leftTerms.varCoeff)}${variable} + ${this.formatNumber(leftTerms.constant)} = ${this.formatNumber(rightTerms.constant)}`,
      explanation: `Ruas kiri: ${this.formatNumber(leftTerms.varCoeff)}${variable} (variabel) dan ${this.formatNumber(leftTerms.constant)} (konstanta). Ruas kanan: ${this.formatNumber(rightTerms.constant)} (konstanta).`
    });

    // Langkah 2: Pindahkan konstanta dari kiri ke kanan
    if (leftTerms.constant !== 0) {
      const newRightConstant = rightTerms.constant - leftTerms.constant;
      steps.push({
        description: `Pindahkan ${this.formatNumber(leftTerms.constant)} dari kiri ke kanan`,
        latex: `${this.formatNumber(leftTerms.varCoeff)}${variable} = ${this.formatNumber(rightTerms.constant)} - ${this.formatNumber(leftTerms.constant)}`,
        explanation: `Konstanta pindah ruas jadi negatif: ${this.formatNumber(rightTerms.constant)} - ${this.formatNumber(leftTerms.constant)}`
      });

      steps.push({
        description: 'Hitung pengurangan di ruas kanan',
        latex: `${this.formatNumber(varCoeff)}${variable} = ${this.formatNumber(constant)}`,
        explanation: `${this.formatNumber(rightTerms.constant)} dikurangi ${this.formatNumber(leftTerms.constant)} sama dengan ${this.formatNumber(constant)}`
      });
    }

    if (varCoeff === 0) {
      if (constant === 0) {
        steps.push({
          description: 'Persamaan identitas',
          latex: '0 = 0',
          explanation: 'Persamaan benar untuk semua nilai ' + variable
        });
        notes.push('🔢 Persamaan ini punya tak hingga solusi');
        return {
          success: true, input, latex: inputLatex,
          result: 'Semua bilangan real',
          resultLatex: `${variable} = ℝ (semua bilangan real)`,
          steps, notes, type: 'equation'
        };
      } else {
        steps.push({
          description: 'Kontradiksi',
          latex: `0 = ${this.formatNumber(constant)}`,
          explanation: 'Persamaan tidak mungkin dipenuhi'
        });
        notes.push('❌ Persamaan ini tidak punya solusi');
        return {
          success: true, input, latex: inputLatex,
          result: 'Tidak ada solusi',
          resultLatex: 'Tidak ada solusi (∅)',
          steps, notes, type: 'equation'
        };
      }
    }

    const solution = constant / varCoeff;

    // Langkah 3: Isolasi variabel
    if (varCoeff !== 1) {
      steps.push({
        description: `Bagi kedua ruas dengan ${this.formatNumber(varCoeff)}`,
        latex: `${variable} = frac{${this.formatNumber(constant)}}{${this.formatNumber(varCoeff)}}`,
        explanation: `Agar ${variable} sendirian di kiri, bagi ${this.formatNumber(constant)} dengan ${this.formatNumber(varCoeff)}`
      });

      steps.push({
        description: 'Hitung pembagian',
        latex: `${variable} = ${this.formatNumber(solution)}`,
        explanation: `${this.formatNumber(constant)} dibagi ${this.formatNumber(varCoeff)} sama dengan ${this.formatNumber(solution)}`
      });
    } else {
      steps.push({
        description: 'Solusi langsung',
        latex: `${variable} = ${this.formatNumber(solution)}`,
        explanation: `Nilai ${variable} sudah sendirian di ruas kiri`
      });
    }

    // Langkah 4: Verifikasi dengan dua langkah terpisah (tanpa \text{})
    this.evaluator.setVariable(variable, solution);
    const leftVal = this.evaluator.evaluate(ast.left!);
    const rightVal = this.evaluator.evaluate(ast.right!);

    steps.push({
      description: 'Verifikasi: substitusi ke ruas kiri',
      latex: `${this.latex.toLatex(ast.left!)} = ${this.formatNumber(leftVal)}`,
      explanation: `Ganti ${variable} dengan ${this.formatNumber(solution)}: hasilnya ${this.formatNumber(leftVal)}`
    });

    steps.push({
      description: 'Verifikasi: cek ruas kanan',
      latex: `${this.latex.toLatex(ast.right!)} = ${this.formatNumber(rightVal)}`,
      explanation: `Ruas kanan tetap ${this.formatNumber(rightVal)}`
    });

    steps.push({
      description: 'Kesimpulan',
      latex: `${this.formatNumber(leftVal)} = ${this.formatNumber(rightVal)} ✓`,
      explanation: `Karena ${this.formatNumber(leftVal)} = ${this.formatNumber(rightVal)}, maka ${variable} = ${this.formatNumber(solution)} benar!`
    });

    notes.push('✅ Solusi terverifikasi');
    notes.push(`🔍 ${variable} = ${this.formatNumber(solution)}`);
    notes.push(`📊 Ruas kiri: ${this.formatNumber(leftVal)}, Ruas kanan: ${this.formatNumber(rightVal)}`);

    return {
      success: true, input, latex: inputLatex,
      result: solution,
      resultLatex: `${variable} = ${this.formatNumber(solution)}`,
      steps, notes, type: 'equation'
    };
  }

  private flattenExpression(node: ASTNode, variable: string): { varCoeff: number; constant: number } {
    let varCoeff = 0;
    let constant = 0;

    const process = (n: ASTNode, sign: number): void => {
      if (n.type === 'Number') {
        constant += sign * (n.value as number);
      } else if (n.type === 'Variable') {
        if (n.value === variable) varCoeff += sign;
      } else if (n.type === 'BinaryOp') {
        if (n.operator === '+') {
          process(n.left!, sign);
          process(n.right!, sign);
        } else if (n.operator === '-') {
          process(n.left!, sign);
          process(n.right!, -sign);
        } else if (n.operator === '*') {
          if (n.left!.type === 'Number' && n.right!.type === 'Variable' && n.right!.value === variable) {
            varCoeff += sign * (n.left!.value as number);
          } else if (n.right!.type === 'Number' && n.left!.type === 'Variable' && n.left!.value === variable) {
            varCoeff += sign * (n.right!.value as number);
          } else {
            try {
              const val = this.evaluator.evaluate(n);
              constant += sign * val;
            } catch {
            }
          }
        }
      } else if (n.type === 'UnaryOp' && n.operator === '-') {
        process(n.argument!, -sign);
      }
    };

    process(node, 1);
    return { varCoeff, constant };
  }

  private solveQuadratic(
    input: string,
    ast: ASTNode,
    inputLatex: string,
    variable: string,
    steps: MathStep[],
    notes: string[]
  ): MathResult {
    const coeffs = this.extractQuadraticCoeffs(ast, variable);
    const { a, b, c } = coeffs;

    // Langkah 1: Identifikasi koefisien dengan jelas
    steps.push({
      description: 'Identifikasi koefisien persamaan kuadrat',
      latex: `${this.formatCoeff(a)}${variable} sup{2} ${this.formatSignedTerm(b, variable)} ${this.formatSignedConstant(c)} = 0`,
      explanation: `Bentuk umum: a${variable}² + b${variable} + c = 0. Dari persamaan ini: a = ${this.formatNumber(a)}, b = ${this.formatNumber(b)}, c = ${this.formatNumber(c)}`
    });

    // Langkah 2: Hitung b² dengan detail
    const bSquared = b * b;
    steps.push({
      description: 'Hitung b² (b dipangkatkan 2)',
      latex: `b sup{2} = ${this.formatNumber(b)} sup{2} = ${this.formatNumber(b)} × ${this.formatNumber(b)} = ${this.formatNumber(bSquared)}`,
      explanation: `Nilai b = ${this.formatNumber(b)}, maka b² = ${this.formatNumber(b)} × ${this.formatNumber(b)} = ${this.formatNumber(bSquared)}`
    });

    // Langkah 3: Hitung 4ac dengan detail
    const fourAC = 4 * a * c;
    steps.push({
      description: 'Hitung 4ac (4 dikali a dikali c)',
      latex: `4ac = 4 × ${this.formatNumber(a)} × ${this.formatNumber(c)} = ${this.formatNumber(fourAC)}`,
      explanation: `4 × a × c = 4 × ${this.formatNumber(a)} × ${this.formatNumber(c)} = ${this.formatNumber(fourAC)}`
    });

    // Langkah 4: Hitung diskriminan D
    const D = bSquared - fourAC;
    steps.push({
      description: 'Hitung diskriminan D = b² - 4ac',
      latex: `D = ${this.formatNumber(bSquared)} - ${this.formatNumber(fourAC)} = ${this.formatNumber(D)}`,
      explanation: `D = b² - 4ac = ${this.formatNumber(bSquared)} - ${this.formatNumber(fourAC)} = ${this.formatNumber(D)}. ${D > 0 ? 'Karena D > 0, ada 2 akar real berbeda.' : D === 0 ? 'Karena D = 0, ada 1 akar kembar.' : 'Karena D < 0, tidak ada akar real.'}`
    });

    if (D < 0) {
      steps.push({
        description: 'D < 0: Tidak ada akar real',
        latex: `D = ${this.formatNumber(D)} < 0`,
        explanation: 'Persamaan tidak memotong sumbu x'
      });
      
      notes.push('❌ Persamaan tidak punya akar real');
      notes.push('📝 Akar kompleks: x = ' + `${this.formatNumber(-b/(2*a))} ± ${this.formatNumber(Math.sqrt(-D)/(2*a))}i`);

      return {
        success: true, input, latex: inputLatex,
        result: 'Tidak ada akar real',
        resultLatex: 'D < 0 → Tidak ada akar real',
        steps, notes, type: 'equation'
      };
    }

    // Langkah 5: Rumus ABC
    steps.push({
      description: 'Tulis rumus ABC (Rumus Kuadrat)',
      latex: `${variable} = frac{-b ± sqrt{D}}{2a}`,
      explanation: 'Rumus ini digunakan untuk mencari nilai x dari persamaan kuadrat'
    });

    // Langkah 6: Hitung komponen-komponen terpisah
    const negB = -b;
    const sqrtD = Math.sqrt(D);
    const twoA = 2 * a;

    steps.push({
      description: 'Hitung -b (negasi dari b)',
      latex: `-b = -(${this.formatNumber(b)}) = ${this.formatNumber(negB)}`,
      explanation: `Negasi dari ${this.formatNumber(b)} adalah ${this.formatNumber(negB)}`
    });

    steps.push({
      description: 'Hitung akar kuadrat D (√D)',
      latex: `sqrt{D} = sqrt{${this.formatNumber(D)}} = ${this.formatNumber(sqrtD)}`,
      explanation: `Akar kuadrat dari ${this.formatNumber(D)} adalah ${this.formatNumber(sqrtD)}`
    });

    steps.push({
      description: 'Hitung penyebut (2a)',
      latex: `2a = 2 × ${this.formatNumber(a)} = ${this.formatNumber(twoA)}`,
      explanation: `2 dikali a = 2 × ${this.formatNumber(a)} = ${this.formatNumber(twoA)}`
    });

    // Langkah 7: Substitusi ke rumus
    steps.push({
      description: 'Substitusi semua nilai ke rumus ABC',
      latex: `${variable} = frac{${this.formatNumber(negB)} ± ${this.formatNumber(sqrtD)}}{${this.formatNumber(twoA)}}`,
      explanation: `Ganti -b dengan ${this.formatNumber(negB)}, √D dengan ${this.formatNumber(sqrtD)}, dan 2a dengan ${this.formatNumber(twoA)}`
    });

    // Langkah 8: Hitung x1 dengan detail lengkap
    const x1Numerator = negB + sqrtD;
    const x1 = x1Numerator / twoA;
    
    steps.push({
      description: 'Hitung akar pertama (x₁): gunakan tanda +',
      latex: `${variable} sub{1} = frac{${this.formatNumber(negB)} + ${this.formatNumber(sqrtD)}}{${this.formatNumber(twoA)}} = frac{${this.formatNumber(x1Numerator)}}{${this.formatNumber(twoA)}}`,
      explanation: `Pembilang: ${this.formatNumber(negB)} + ${this.formatNumber(sqrtD)} = ${this.formatNumber(x1Numerator)}. Penyebut tetap ${this.formatNumber(twoA)}`
    });

    steps.push({
      description: 'Sederhanakan pecahan untuk x₁',
      latex: `${variable} sub{1} = frac{${this.formatNumber(x1Numerator)}}{${this.formatNumber(twoA)}} = ${this.formatNumber(x1)}`,
      explanation: `${this.formatNumber(x1Numerator)} dibagi ${this.formatNumber(twoA)} = ${this.formatNumber(x1)}`
    });

    // Langkah 9: Hitung x2 dengan detail lengkap
    const x2Numerator = negB - sqrtD;
    const x2 = x2Numerator / twoA;
    
    steps.push({
      description: 'Hitung akar kedua (x₂): gunakan tanda -',
      latex: `${variable} sub{2} = frac{${this.formatNumber(negB)} - ${this.formatNumber(sqrtD)}}{${this.formatNumber(twoA)}} = frac{${this.formatNumber(x2Numerator)}}{${this.formatNumber(twoA)}}`,
      explanation: `Pembilang: ${this.formatNumber(negB)} - ${this.formatNumber(sqrtD)} = ${this.formatNumber(x2Numerator)}. Penyebut tetap ${this.formatNumber(twoA)}`
    });

    steps.push({
      description: 'Sederhanakan pecahan untuk x₂',
      latex: `${variable} sub{2} = frac{${this.formatNumber(x2Numerator)}}{${this.formatNumber(twoA)}} = ${this.formatNumber(x2)}`,
      explanation: `${this.formatNumber(x2Numerator)} dibagi ${this.formatNumber(twoA)} = ${this.formatNumber(x2)}`
    });

    // Langkah 10-11: Verifikasi
    this.evaluator.setVariable(variable, x1);
    const leftVal1 = this.evaluator.evaluate(ast.left!);
    
    steps.push({
      description: `Verifikasi x₁ = ${this.formatNumber(x1)}`,
      latex: `(${this.formatNumber(x1)}) sup{2} + 5(${this.formatNumber(x1)}) + 6 = ${this.formatNumber(leftVal1)}`,
      explanation: `Substitusi x = ${this.formatNumber(x1)} ke persamaan awal: hasilnya ${this.formatNumber(leftVal1)} (harus = 0)`
    });

    this.evaluator.setVariable(variable, x2);
    const leftVal2 = this.evaluator.evaluate(ast.left!);
    
    steps.push({
      description: `Verifikasi x₂ = ${this.formatNumber(x2)}`,
      latex: `(${this.formatNumber(x2)}) sup{2} + 5(${this.formatNumber(x2)}) + 6 = ${this.formatNumber(leftVal2)}`,
      explanation: `Substitusi x = ${this.formatNumber(x2)} ke persamaan awal: hasilnya ${this.formatNumber(leftVal2)} (harus = 0)`
    });

    // Langkah 12: Kesimpulan
    if (D === 0) {
      steps.push({
        description: 'Kesimpulan',
        latex: `${variable} = ${this.formatNumber(x1)} (akar kembar)`,
        explanation: `Karena D = 0, hanya ada satu akar (kembar): ${variable} = ${this.formatNumber(x1)}`
      });
      
      notes.push(`✅ Akar kembar: ${variable} = ${this.formatNumber(x1)}`);
    } else {
      steps.push({
        description: 'Kesimpulan',
        latex: `${variable} sub{1} = ${this.formatNumber(x1)} quad ${variable} sub{2} = ${this.formatNumber(x2)}`,
        explanation: `Dua akar real berbeda: ${variable}₁ = ${this.formatNumber(x1)} dan ${variable}₂ = ${this.formatNumber(x2)}. Keduanya memenuhi persamaan!`
      });
      
      notes.push(`✅ ${variable}₁ = ${this.formatNumber(x1)}, ${variable}₂ = ${this.formatNumber(x2)}`);
      notes.push(`📝 Jumlah akar: ${this.formatNumber(x1 + x2)} = -b/a = ${this.formatNumber(-b/a)}`);
      notes.push(`📝 Hasil kali akar: ${this.formatNumber(x1 * x2)} = c/a = ${this.formatNumber(c/a)}`);
    }

    return {
      success: true, input, latex: inputLatex,
      result: D === 0 ? x1 : `${x1}, ${x2}`,
      resultLatex: D === 0 
        ? `${variable} = ${this.formatNumber(x1)} (akar kembar)`
        : `${variable} sub{1} = ${this.formatNumber(x1)}, ${variable} sub{2} = ${this.formatNumber(x2)}`,
      steps, notes, type: 'equation'
    };
  }

  private extractQuadraticCoeffs(ast: ASTNode, variable: string): { a: number; b: number; c: number } {
    let a = 0, b = 0, c = 0;

    const process = (node: ASTNode, sign: number, side: 'left' | 'right'): void => {
      const s = side === 'left' ? sign : -sign;
      
      if (node.type === 'Number') {
        c += s * (node.value as number);
      } else if (node.type === 'Variable' && node.value === variable) {
        b += s;
      } else if (node.type === 'BinaryOp') {
        if (node.operator === '+') {
          process(node.left!, s, 'left');
          process(node.right!, s, 'left');
        } else if (node.operator === '-') {
          process(node.left!, s, 'left');
          process(node.right!, -s, 'left');
        } else if (node.operator === '*') {
          const leftNum = node.left!.type === 'Number' ? node.left!.value as number : null;
          const rightNum = node.right!.type === 'Number' ? node.right!.value as number : null;
          
          if (leftNum !== null) {
            if (node.right!.type === 'Variable' && node.right!.value === variable) {
              b += s * leftNum;
            } else if (node.right!.type === 'BinaryOp' && node.right!.operator === '^') {
              if (node.right!.left!.type === 'Variable' && node.right!.left!.value === variable) {
                const power = node.right!.right!.value as number;
                if (power === 2) a += s * leftNum;
              }
            }
          } else if (rightNum !== null) {
            if (node.left!.type === 'Variable' && node.left!.value === variable) {
              b += s * rightNum;
            }
          }
        } else if (node.operator === '^') {
          if (node.left!.type === 'Variable' && node.left!.value === variable) {
            const power = node.right!.type === 'Number' ? node.right!.value as number : 0;
            if (power === 2) a += s;
          }
        }
      } else if (node.type === 'UnaryOp' && node.operator === '-') {
        process(node.argument!, -s, 'left');
      }
    };

    process(ast.left!, 1, 'left');
    process(ast.right!, 1, 'right');

    return { a, b, c };
  }

  private simplifyExpression(input: string, _ast: ASTNode, inputLatex: string): MathResult {
    const steps: MathStep[] = [];
    const notes: string[] = [];

    steps.push({
      description: 'Ekspresi yang diberikan',
      latex: inputLatex,
      explanation: 'Ekspresi ini mengandung variabel'
    });

    notes.push('📝 Ekspresi ini tidak bisa dihitung menjadi angka tunggal');
    notes.push('💡 Masukkan nilai variabel atau buat persamaan untuk menyelesaikannya');

    return {
      success: true, input, latex: inputLatex,
      result: 'Ekspresi simbolik',
      resultLatex: inputLatex,
      steps, notes, type: 'simplify'
    };
  }

  private formatNumber(n: number): string {
    if (!isFinite(n)) return 'Tidak terdefinisi';
    if (Number.isInteger(n)) return n.toString();
    const rounded = Math.round(n * 10000) / 10000;
    return rounded.toString();
  }

  private formatCoeff(n: number): string {
    if (n === 1) return '';
    if (n === -1) return '-';
    return this.formatNumber(n);
  }

  private formatSignedTerm(coeff: number, variable: string): string {
    if (coeff === 0) return '';
    if (coeff > 0) return `+ ${coeff === 1 ? '' : coeff}${variable}`;
    if (coeff === -1) return `- ${variable}`;
    return `- ${Math.abs(coeff)}${variable}`;
  }

  private formatSignedConstant(n: number): string {
    if (n === 0) return '';
    if (n > 0) return `+ ${n}`;
    return `- ${Math.abs(n)}`;
  }

  private errorResult(input: string, message: string): MathResult {
    return {
      success: false,
      input,
      latex: input,
      error: message,
      steps: [{
        description: 'Error',
        latex: message,
        explanation: 'Silakan perbaiki input dan coba lagi'
      }],
      notes: ['❌ ' + message],
      type: 'error'
    };
  }
}

// ==========================================
// 📤 EXPORT SINGLETON
// ==========================================

export const mathEngine = new SymbolicSolver();