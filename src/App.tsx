import { useState, useRef, useEffect, useCallback } from 'react'

// ==================== TYPES ====================
interface Step {
  explanation: string
  result: string
  formula?: string
}

interface Solution {
  question: string
  steps: Step[]
  finalAnswer: string
  notes: string[]
  proof?: string
}

interface HistoryItem {
  question: string
  answer: string
  timestamp: Date
}

interface Achievement {
  id: string
  title: string
  icon: string
  unlocked: boolean
}

// ==================== MATH RENDERER ====================
const MathRenderer = ({ expression }: { expression: string }) => {
  const renderMath = (expr: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = []
    let i = 0
    let key = 0

    while (i < expr.length) {
      // Fraction: frac{a}{b}
      if (expr.slice(i).startsWith('frac{')) {
        const start = i + 5
        let braceCount = 1
        let j = start
        while (braceCount > 0 && j < expr.length) {
          if (expr[j] === '{') braceCount++
          if (expr[j] === '}') braceCount--
          j++
        }
        const numerator = expr.slice(start, j - 1)
        
        if (expr[j] === '{') {
          const start2 = j + 1
          braceCount = 1
          j = start2
          while (braceCount > 0 && j < expr.length) {
            if (expr[j] === '{') braceCount++
            if (expr[j] === '}') braceCount--
            j++
          }
          const denominator = expr.slice(start2, j - 1)
          
          elements.push(
            <span key={key++} className="inline-flex flex-col items-center mx-1 align-middle">
              <span className="text-sm border-b-2 border-current px-2 pb-0.5">{renderMath(numerator)}</span>
              <span className="text-sm px-2 pt-0.5">{renderMath(denominator)}</span>
            </span>
          )
          i = j
          continue
        }
      }

      // Square root: sqrt{a}
      if (expr.slice(i).startsWith('sqrt{')) {
        const start = i + 5
        let braceCount = 1
        let j = start
        while (braceCount > 0 && j < expr.length) {
          if (expr[j] === '{') braceCount++
          if (expr[j] === '}') braceCount--
          j++
        }
        const content = expr.slice(start, j - 1)
        elements.push(
          <span key={key++} className="inline-flex items-center mx-0.5">
            <span className="text-lg">√</span>
            <span className="border-t-2 border-current px-1">{renderMath(content)}</span>
          </span>
        )
        i = j
        continue
      }

      // Superscript: sup{a}
      if (expr.slice(i).startsWith('sup{')) {
        const start = i + 4
        let braceCount = 1
        let j = start
        while (braceCount > 0 && j < expr.length) {
          if (expr[j] === '{') braceCount++
          if (expr[j] === '}') braceCount--
          j++
        }
        const content = expr.slice(start, j - 1)
        elements.push(
          <sup key={key++} className="text-xs align-super">{renderMath(content)}</sup>
        )
        i = j
        continue
      }

      // Replace symbols
      if (expr[i] === '*') {
        elements.push(<span key={key++} className="mx-0.5">×</span>)
        i++
        continue
      }

      elements.push(<span key={key++}>{expr[i]}</span>)
      i++
    }

    return elements
  }

  return <span className="inline-flex items-center flex-wrap">{renderMath(expression)}</span>
}

// ==================== MATH SOLVER ====================
const solveMath = (input: string): Solution => {
  const question = input.trim()
  const steps: Step[] = []
  let finalAnswer = ''
  const notes: string[] = []
  let proof = ''

  // Clean input
  let expr = question
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')

  // Parse fractions from visual input
  const fracMatch = expr.match(/(\d+)\/(\d+)/)
  
  // CASE 1: Persamaan Kuadrat (ax² + bx + c = 0)
  if (expr.includes('x²') || expr.includes('x^2')) {
    expr = expr.replace(/x²/g, 'x^2')
    const match = expr.match(/(-?\d*)x\^2([+-]\d*)x([+-]\d+)=0/)
    
    if (match) {
      const a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseInt(match[1])
      const b = match[2] === '' || match[2] === '+' ? 1 : match[2] === '-' ? -1 : parseInt(match[2])
      const c = parseInt(match[3])

      steps.push({
        explanation: '📝 Ini adalah persamaan kuadrat. Kita gunakan rumus ABC:',
        result: 'x = frac{-b ± sqrt{bsup{2} - 4ac}}{2a}',
        formula: 'Rumus ABC (Kuadrat)'
      })

      steps.push({
        explanation: `📌 Dari soal, kita dapat: a = ${a}, b = ${b}, c = ${c}`,
        result: `a = ${a}, b = ${b}, c = ${c}`
      })

      const discriminant = b * b - 4 * a * c
      steps.push({
        explanation: '🔢 Hitung diskriminan (D):',
        result: `D = bsup{2} - 4ac = (${b})sup{2} - 4(${a})(${c}) = ${b*b} - ${4*a*c} = ${discriminant}`
      })

      if (discriminant > 0) {
        const sqrtD = Math.sqrt(discriminant)
        const x1 = (-b + sqrtD) / (2 * a)
        const x2 = (-b - sqrtD) / (2 * a)

        steps.push({
          explanation: '✅ Karena D > 0, ada dua akar berbeda:',
          result: `sqrt{${discriminant}} = ${sqrtD}`
        })

        steps.push({
          explanation: '📍 Hitung x₁:',
          result: `xsub{1} = frac{-${b} + ${sqrtD}}{2(${a})} = frac{${-b + sqrtD}}{${2*a}} = ${x1}`
        })

        steps.push({
          explanation: '📍 Hitung x₂:',
          result: `xsub{2} = frac{-${b} - ${sqrtD}}{2(${a})} = frac{${-b - sqrtD}}{${2*a}} = ${x2}`
        })

        finalAnswer = `x₁ = ${x1}, x₂ = ${x2}`
        proof = `Bukti: ${a}(${x1})² + ${b}(${x1}) + ${c} = ${a*x1*x1 + b*x1 + c} ✓`
      } else if (discriminant === 0) {
        const x = -b / (2 * a)
        steps.push({
          explanation: '✅ Karena D = 0, ada satu akar kembar:',
          result: `x = frac{-${b}}{2(${a})} = ${x}`
        })
        finalAnswer = `x = ${x}`
      } else {
        steps.push({
          explanation: '❌ Karena D < 0, tidak ada akar real',
          result: 'Persamaan tidak memiliki solusi bilangan real'
        })
        finalAnswer = 'Tidak ada akar real'
      }

      notes.push('💡 Rumus ABC: x = (-b ± √(b²-4ac)) / 2a')
      notes.push('📚 Diskriminan menentukan jumlah akar: D>0 (2 akar), D=0 (1 akar), D<0 (tidak ada akar real)')
    }
  }
  // CASE 2: Persamaan Linear (ax + b = c)
  else if (expr.includes('x') && expr.includes('=')) {
    const parts = expr.split('=')
    const left = parts[0]
    const right = parseFloat(parts[1])

    steps.push({
      explanation: '📝 Ini adalah persamaan linear. Kita cari nilai x:',
      result: question
    })

    const match = left.match(/(-?\d*)x([+-]\d+)?/)
    if (match) {
      const coef = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1])
      const constant = match[2] ? parseFloat(match[2]) : 0

      steps.push({
        explanation: `📌 Pindahkan ${constant > 0 ? '+' + constant : constant} ke kanan (ubah tanda):`,
        result: `${coef === 1 ? '' : coef}x = ${right} ${constant > 0 ? '-' : '+'} ${Math.abs(constant)}`
      })

      const rightSide = right - constant
      steps.push({
        explanation: '🔢 Hitung ruas kanan:',
        result: `${coef === 1 ? '' : coef}x = ${rightSide}`
      })

      if (coef !== 1) {
        steps.push({
          explanation: `📍 Bagi kedua ruas dengan ${coef}:`,
          result: `x = frac{${rightSide}}{${coef}} = ${rightSide / coef}`
        })
      }

      finalAnswer = `x = ${rightSide / coef}`
      proof = `Bukti: ${coef}(${rightSide/coef}) + ${constant} = ${coef * (rightSide/coef) + constant} = ${right} ✓`
      notes.push('💡 Ingat: pindah ruas = ubah tanda!')
    }
  }
  // CASE 3: Akar Kuadrat
  else if (expr.includes('√') || expr.includes('sqrt')) {
    const num = parseFloat(expr.replace(/[√sqrt()]/g, ''))
    
    steps.push({
      explanation: '📝 Mencari akar kuadrat:',
      result: `sqrt{${num}}`
    })

    const sqrt = Math.sqrt(num)
    const isWhole = Number.isInteger(sqrt)

    if (isWhole) {
      steps.push({
        explanation: `🔢 Cari bilangan yang jika dikuadratkan = ${num}:`,
        result: `${sqrt} × ${sqrt} = ${num}`
      })
      finalAnswer = `${sqrt}`
    } else {
      // Find perfect square factors
      let factor = 1
      for (let i = Math.floor(Math.sqrt(num)); i > 1; i--) {
        if (num % (i * i) === 0) {
          factor = i
          break
        }
      }
      
      if (factor > 1) {
        const remaining = num / (factor * factor)
        steps.push({
          explanation: `🔍 Sederhanakan: ${num} = ${factor}² × ${remaining}`,
          result: `sqrt{${num}} = sqrt{${factor}sup{2} × ${remaining}} = ${factor}sqrt{${remaining}}`
        })
        finalAnswer = `${factor}√${remaining} ≈ ${sqrt.toFixed(3)}`
      } else {
        finalAnswer = `≈ ${sqrt.toFixed(3)}`
      }
    }

    notes.push(`💡 √${num} artinya: bilangan berapa yang jika dikali dirinya sendiri = ${num}`)
    proof = `Bukti: ${sqrt.toFixed(3)}² ≈ ${(sqrt * sqrt).toFixed(1)} ✓`
  }
  // CASE 4: Faktorial
  else if (expr.includes('!')) {
    const num = parseInt(expr.replace('!', ''))
    
    steps.push({
      explanation: `📝 Menghitung faktorial ${num}!:`,
      result: `${num}! = ${Array.from({length: num}, (_, i) => num - i).join(' × ')}`
    })

    let result = 1
    let calculation = ''
    for (let i = num; i >= 1; i--) {
      result *= i
      if (i > 1) {
        calculation += `${num - (num - i)} langkah: ${result} `
      }
    }

    steps.push({
      explanation: '🔢 Kalikan semua:',
      result: `${Array.from({length: num}, (_, i) => num - i).join(' × ')} = ${result}`
    })

    finalAnswer = `${result}`
    notes.push(`💡 n! = n × (n-1) × (n-2) × ... × 2 × 1`)
    proof = `${num}! = ${result} ✓`
  }
  // CASE 5: Pangkat
  else if (expr.includes('^') || expr.includes('sup{')) {
    let base: number, exp: number
    
    if (expr.includes('^')) {
      const parts = expr.split('^')
      base = parseFloat(parts[0])
      exp = parseFloat(parts[1])
    } else {
      const match = expr.match(/(\d+)sup\{(\d+)\}/)
      base = parseFloat(match![1])
      exp = parseFloat(match![2])
    }

    steps.push({
      explanation: `📝 Menghitung ${base} pangkat ${exp}:`,
      result: `${base}sup{${exp}} = ${Array(exp).fill(base).join(' × ')}`
    })

    let result = 1
    for (let i = 1; i <= exp; i++) {
      result *= base
      if (i <= 4 || i === exp) {
        steps.push({
          explanation: `📍 Langkah ${i}:`,
          result: `${Array(i).fill(base).join(' × ')} = ${result}`
        })
      } else if (i === 5) {
        steps.push({
          explanation: '⏭️ Lanjutkan perhitungan...',
          result: '...'
        })
      }
    }

    finalAnswer = `${result}`
    notes.push(`💡 aⁿ artinya: a dikali dengan dirinya sendiri sebanyak n kali`)
    proof = `${base}^${exp} = ${result} ✓`
  }
  // CASE 6: Pecahan
  else if (fracMatch) {
    const num = parseFloat(fracMatch[1])
    const den = parseFloat(fracMatch[2])
    
    steps.push({
      explanation: '📝 Menghitung pembagian (pecahan):',
      result: `frac{${num}}{${den}}`
    })

    const result = num / den
    const isWhole = Number.isInteger(result)

    if (isWhole) {
      steps.push({
        explanation: `🔢 ${num} dibagi ${den}:`,
        result: `${num} ÷ ${den} = ${result}`
      })
    } else {
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
      const g = gcd(num, den)
      
      if (g > 1) {
        steps.push({
          explanation: `🔍 Sederhanakan dengan FPB = ${g}:`,
          result: `frac{${num}}{${den}} = frac{${num/g}}{${den/g}}`
        })
      }
      
      steps.push({
        explanation: '🔢 Hasil pembagian:',
        result: `${num} ÷ ${den} = ${result}`
      })
    }

    finalAnswer = isWhole ? `${result}` : `${result.toFixed(4).replace(/\.?0+$/, '')}`
    notes.push('💡 Pecahan a/b artinya: a dibagi b')
    proof = `${den} × ${result} = ${num} ✓`
  }
  // CASE 7: Persentase
  else if (expr.includes('%')) {
    const match = expr.match(/(\d+)%\*(\d+)/) || expr.match(/(\d+)%/)
    
    if (match && match[2]) {
      const percent = parseFloat(match[1])
      const value = parseFloat(match[2])
      
      steps.push({
        explanation: `📝 Menghitung ${percent}% dari ${value}:`,
        result: `${percent}% × ${value}`
      })

      steps.push({
        explanation: '🔢 Ubah persen ke pecahan:',
        result: `frac{${percent}}{100} × ${value}`
      })

      const result = (percent / 100) * value
      steps.push({
        explanation: '📍 Hitung:',
        result: `frac{${percent} × ${value}}{100} = frac{${percent * value}}{100} = ${result}`
      })

      finalAnswer = `${result}`
      notes.push('💡 a% dari b = (a/100) × b')
    }
  }
  // CASE 8: Aritmatika (BODMAS)
  else {
    steps.push({
      explanation: '📝 Mari kita hitung step by step:',
      result: expr.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ')
    })

    // Simple expression calculator (safe alternative to eval)
    const calculate = (expression: string): number => {
      const tokens = expression.match(/[\d.]+|[+\-*/]/g) || []
      const nums: number[] = []
      const ops: string[] = []
      
      const apply = () => {
        const b = nums.pop()!
        const a = nums.pop()!
        const op = ops.pop()!
        switch(op) {
          case '+': nums.push(a + b); break
          case '-': nums.push(a - b); break
          case '*': nums.push(a * b); break
          case '/': nums.push(a / b); break
        }
      }
      
      const precedence = (op: string) => op === '+' || op === '-' ? 1 : 2
      
      for (const token of tokens) {
        if (/[\d.]/.test(token[0])) {
          nums.push(parseFloat(token))
        } else {
          while (ops.length && precedence(ops[ops.length-1]) >= precedence(token)) apply()
          ops.push(token)
        }
      }
      while (ops.length) apply()
      return nums[0] || 0
    }

    // Handle parentheses
    let current = expr
    while (current.includes('(')) {
      const match = current.match(/\(([^()]+)\)/)
      if (match) {
        const inner = match[1]
        const innerResult = calculate(inner)
        steps.push({
          explanation: '📌 Kerjakan dalam kurung dulu:',
          result: `(${inner.replace(/\*/g, '×')}) = ${innerResult}`
        })
        current = current.replace(`(${inner})`, innerResult.toString())
      }
    }

    // Handle multiplication and division
    while (/[\d.]+[*/][\d.]+/.test(current)) {
      const match = current.match(/([\d.]+)([*/])([\d.]+)/)
      if (match) {
        const a = parseFloat(match[1])
        const op = match[2]
        const b = parseFloat(match[3])
        const result = op === '*' ? a * b : a / b
        
        steps.push({
          explanation: op === '*' ? '✖️ Perkalian:' : '➗ Pembagian:',
          result: op === '*' 
            ? `${a} × ${b} = ${result}`
            : `frac{${a}}{${b}} = ${result}`
        })
        current = current.replace(match[0], result.toString())
      }
    }

    // Handle addition and subtraction
    while (/[\d.]+[+-][\d.]+/.test(current)) {
      const match = current.match(/([\d.]+)([+-])([\d.]+)/)
      if (match) {
        const a = parseFloat(match[1])
        const op = match[2]
        const b = parseFloat(match[3])
        const result = op === '+' ? a + b : a - b
        
        steps.push({
          explanation: op === '+' ? '➕ Penjumlahan:' : '➖ Pengurangan:',
          result: `${a} ${op} ${b} = ${result}`
        })
        current = current.replace(match[0], result.toString())
      }
    }

    finalAnswer = current
    notes.push('💡 Urutan: Kurung → Pangkat → Kali/Bagi → Tambah/Kurang (BODMAS)')
  }

  return { question, steps, finalAnswer, notes, proof }
}

// ==================== MAIN APP ====================
export default function App() {
  const [input, setInput] = useState('')
  const [solution, setSolution] = useState<Solution | null>(null)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [quizMode, setQuizMode] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizStreak, setQuizStreak] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizQuestion, setQuizQuestion] = useState<{q: string, a: number} | null>(null)
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first', title: 'Langkah Pertama', icon: '🌟', unlocked: false },
    { id: 'streak5', title: 'Streak 5x', icon: '🔥', unlocked: false },
    { id: 'score10', title: 'Skor 10', icon: '🏆', unlocked: false },
    { id: 'explorer', title: 'Penjelajah', icon: '🧭', unlocked: false },
    { id: 'master', title: 'Master', icon: '👑', unlocked: false },
  ])

  // Whiteboard state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushColor, setBrushColor] = useState('#ffffff')

  // Input modal
  const [modal, setModal] = useState<{type: string, data: any} | null>(null)

  const examples = [
    { label: '12 + 8 × 3', value: '12 + 8 * 3' },
    { label: '24 ÷ 4', value: '24/4' },
    { label: '2⁵', value: '2^5' },
    { label: '√144', value: '√144' },
    { label: '5!', value: '5!' },
    { label: '2x + 5 = 15', value: '2x + 5 = 15' },
    { label: 'x² + 5x + 6 = 0', value: 'x² + 5x + 6 = 0' },
    { label: '25% × 80', value: '25%*80' },
  ]

  const formulas = {
    'Bangun Datar': [
      { name: 'Persegi', formula: 'L = s²', desc: 'Luas = sisi × sisi' },
      { name: 'Persegi Panjang', formula: 'L = p × l', desc: 'Luas = panjang × lebar' },
      { name: 'Segitiga', formula: 'L = ½ × a × t', desc: 'Luas = ½ × alas × tinggi' },
      { name: 'Lingkaran', formula: 'L = πr²', desc: 'Luas = π × jari-jari²' },
      { name: 'Trapesium', formula: 'L = ½(a+b)t', desc: 'Luas = ½ × (sisi sejajar) × tinggi' },
    ],
    'Bangun Ruang': [
      { name: 'Kubus', formula: 'V = s³', desc: 'Volume = sisi³' },
      { name: 'Balok', formula: 'V = p×l×t', desc: 'Volume = panjang × lebar × tinggi' },
      { name: 'Tabung', formula: 'V = πr²t', desc: 'Volume = π × r² × tinggi' },
      { name: 'Kerucut', formula: 'V = ⅓πr²t', desc: 'Volume = ⅓ × π × r² × tinggi' },
      { name: 'Bola', formula: 'V = ⁴⁄₃πr³', desc: 'Volume = ⁴⁄₃ × π × r³' },
    ],
    'Aljabar': [
      { name: 'Kuadrat', formula: '(a+b)² = a²+2ab+b²', desc: 'Identitas kuadrat' },
      { name: 'Selisih Kuadrat', formula: 'a²-b² = (a+b)(a-b)', desc: 'Faktorisasi' },
      { name: 'Rumus ABC', formula: 'x = (-b±√(b²-4ac))/2a', desc: 'Persamaan kuadrat' },
    ],
  }

  const tips = [
    { title: 'Perkalian 11', content: '11 × 23 = 253 (2, 2+3, 3)' },
    { title: 'Kuadrat berakhir 5', content: '25² = 2×3|25 = 625' },
    { title: 'Perkalian 9', content: '9 × 7 = (7-1)|10-(7-1) = 63' },
    { title: 'Persentase', content: '15% dari 80 = 80% dari 15 = 12' },
    { title: 'Bagi 5', content: 'n÷5 = n×2÷10' },
  ]

  const multiplicationTable = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => (i + 1) * (j + 1))
  )

  // Solve function
  const solve = useCallback(() => {
    if (!input.trim()) return
    
    const sol = solveMath(input)
    setSolution(sol)
    setVisibleSteps(0)
    setShowNotes(false)
    
    setHistory(prev => [{
      question: input,
      answer: sol.finalAnswer,
      timestamp: new Date()
    }, ...prev.slice(0, 9)])

    // Unlock first achievement
    if (!achievements[0].unlocked) {
      const newAch = [...achievements]
      newAch[0].unlocked = true
      setAchievements(newAch)
    }
  }, [input, achievements])

  // Animate steps
  useEffect(() => {
    if (solution && visibleSteps < solution.steps.length) {
      const timer = setTimeout(() => {
        setVisibleSteps(v => v + 1)
      }, 600)
      return () => clearTimeout(timer)
    } else if (solution && visibleSteps === solution.steps.length) {
      setTimeout(() => setShowNotes(true), 400)
    }
  }, [solution, visibleSteps])

  // Quiz functions
  const generateQuiz = () => {
    const operations = ['+', '-', '×', '÷']
    const op = operations[Math.floor(Math.random() * operations.length)]
    let a: number, b: number, answer: number

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 50) + 10
        b = Math.floor(Math.random() * 50) + 10
        answer = a + b
        break
      case '-':
        a = Math.floor(Math.random() * 50) + 30
        b = Math.floor(Math.random() * 30) + 1
        answer = a - b
        break
      case '×':
        a = Math.floor(Math.random() * 12) + 1
        b = Math.floor(Math.random() * 12) + 1
        answer = a * b
        break
      case '÷':
        b = Math.floor(Math.random() * 10) + 2
        answer = Math.floor(Math.random() * 10) + 1
        a = b * answer
        break
      default:
        a = 1; b = 1; answer = 2
    }

    setQuizQuestion({ q: `${a} ${op} ${b}`, a: answer })
    setQuizAnswer('')
    setQuizFeedback(null)
  }

  const checkQuizAnswer = () => {
    if (!quizQuestion || !quizAnswer) return
    
    const isCorrect = parseFloat(quizAnswer) === quizQuestion.a
    setQuizFeedback(isCorrect ? 'correct' : 'wrong')
    
    if (isCorrect) {
      setQuizScore(s => s + 1)
      setQuizStreak(s => s + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
      
      // Check achievements
      const newAch = [...achievements]
      if (quizStreak + 1 >= 5 && !newAch[1].unlocked) {
        newAch[1].unlocked = true
      }
      if (quizScore + 1 >= 10 && !newAch[2].unlocked) {
        newAch[2].unlocked = true
      }
      setAchievements(newAch)
    } else {
      setQuizStreak(0)
    }

    setTimeout(generateQuiz, 1500)
  }

  // Whiteboard functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Input helpers
  const addToInput = (val: string) => {
    setInput(prev => prev + val)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      solve()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧮</span>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  MathGenius PRO
                </h1>
                <p className="text-xs text-white/50">Belajar Matematika Jadi Mudah!</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setQuizMode(false); setSolution(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !quizMode ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50' : 'text-white/60 hover:bg-white/10'
              }`}
            >
              🔢 Hitung
            </button>
            <button
              onClick={() => { setQuizMode(true); generateQuiz() }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                quizMode ? 'bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/50' : 'text-white/60 hover:bg-white/10'
              }`}
            >
              🎮 Kuis
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-[61px] left-0 h-[calc(100vh-61px)] w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform z-30 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="p-4 space-y-2">
            {/* Menu Items */}
            {[
              { id: 'formulas', icon: '📐', label: 'Rumus Matematika' },
              { id: 'table', icon: '✖️', label: 'Tabel Perkalian' },
              { id: 'tips', icon: '💡', label: 'Tips & Trik' },
              { id: 'whiteboard', icon: '✏️', label: 'Papan Coret' },
              { id: 'history', icon: '📜', label: 'Riwayat' },
              { id: 'achievements', icon: '🏆', label: 'Pencapaian' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activePanel === item.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white ring-1 ring-cyan-500/30'
                    : 'hover:bg-white/5 text-white/70'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Panel Content */}
          {activePanel && (
            <div className="px-4 pb-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                {/* Formulas Panel */}
                {activePanel === 'formulas' && (
                  <div className="space-y-4">
                    {Object.entries(formulas).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-cyan-400 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-lg p-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/80">{item.name}</span>
                                <span className="text-cyan-400 font-mono text-sm">{item.formula}</span>
                              </div>
                              <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Multiplication Table */}
                {activePanel === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="p-1 text-cyan-400">×</th>
                          {[...Array(10)].map((_, i) => (
                            <th key={i} className="p-1 text-cyan-400">{i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {multiplicationTable.map((row, i) => (
                          <tr key={i}>
                            <td className="p-1 text-cyan-400 font-bold">{i + 1}</td>
                            {row.map((val, j) => (
                              <td key={j} className="p-1 text-center text-white/70 hover:bg-cyan-500/20 rounded cursor-pointer">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tips Panel */}
                {activePanel === 'tips' && (
                  <div className="space-y-3">
                    {tips.map((tip, i) => (
                      <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-yellow-400 mb-1">{tip.title}</h4>
                        <p className="text-xs text-white/70 font-mono">{tip.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Whiteboard Panel */}
                {activePanel === 'whiteboard' && (
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {['#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${brushColor === color ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <button
                        onClick={clearCanvas}
                        className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                      >
                        Hapus
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={230}
                      height={200}
                      className="bg-slate-800 rounded-lg cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                )}

                {/* History Panel */}
                {activePanel === 'history' && (
                  <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-white/40 text-sm text-center py-4">Belum ada riwayat</p>
                    ) : (
                      history.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(item.question)}
                          className="w-full bg-slate-800/50 rounded-lg p-2 text-left hover:bg-slate-800/70 transition"
                        >
                          <div className="text-sm text-white/80 truncate">{item.question}</div>
                          <div className="text-xs text-cyan-400">= {item.answer}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Achievements Panel */}
                {activePanel === 'achievements' && (
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className={`p-3 rounded-lg text-center ${
                          ach.unlocked
                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                            : 'bg-slate-800/50 opacity-50'
                        }`}
                      >
                        <span className="text-2xl">{ach.unlocked ? ach.icon : '🔒'}</span>
                        <p className="text-xs mt-1 text-white/70">{ach.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-61px)] p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
            {!quizMode ? (
              /* Calculator Mode */
              <>
                {/* Input Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-4xl">👋</span>
                    <div>
                      <h2 className="text-lg font-semibold">Halo! Saya siap membantu</h2>
                      <p className="text-sm text-white/60">Tulis soal matematikamu di bawah ini</p>
                    </div>
                  </div>

                  {/* Visual Input Display */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 min-h-[60px] border border-white/5">
                    {input ? (
                      <div className="text-2xl">
                        <MathRenderer expression={input} />
                      </div>
                    ) : (
                      <span className="text-white/30">Soal akan tampil di sini...</span>
                    )}
                  </div>

                  {/* Number Pad */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {['7', '8', '9', '÷', '('].map(btn => (
                      <button
                        key={btn}
                        onClick={() => addToInput(btn === '÷' ? '/' : btn)}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-lg font-semibold transition"
                      >
                        {btn}
                      </button>
                    ))}
                    {['4', '5', '6', '×', ')'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => addToInput(btn === '×' ? '*' : btn)}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-lg font-semibold transition"
                      >
                        {btn}
                      </button>
                    ))}
                    {['1', '2', '3', '-', 'x'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => addToInput(btn)}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-lg font-semibold transition"
                      >
                        {btn}
                      </button>
                    ))}
                    {['0', '.', '=', '+', '²'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => btn === '=' ? addToInput('=') : btn === '²' ? addToInput('²') : addToInput(btn)}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-lg font-semibold transition"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>

                  {/* Special Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <button
                      onClick={() => setModal({ type: 'fraction', data: { num: '', den: '' } })}
                      className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl border border-purple-500/30 transition flex flex-col items-center"
                    >
                      <span className="text-xs border-b border-white/50 px-1">a</span>
                      <span className="text-xs px-1">b</span>
                    </button>
                    <button
                      onClick={() => setModal({ type: 'power', data: { base: '', exp: '' } })}
                      className="p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl border border-pink-500/30 transition"
                    >
                      xⁿ
                    </button>
                    <button
                      onClick={() => setModal({ type: 'sqrt', data: { value: '' } })}
                      className="p-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl border border-cyan-500/30 transition"
                    >
                      √x
                    </button>
                    <button
                      onClick={() => addToInput('!')}
                      className="p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl border border-yellow-500/30 transition"
                    >
                      n!
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInput('')}
                      className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setInput(prev => prev.slice(0, -1))}
                      className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl font-semibold transition"
                    >
                      ⌫
                    </button>
                    <button
                      onClick={solve}
                      className="flex-[2] py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl font-bold text-lg transition shadow-lg shadow-purple-500/25"
                    >
                      ✨ Selesaikan
                    </button>
                  </div>

                  {/* Hidden text input for keyboard */}
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="mt-4 w-full bg-slate-800/50 rounded-xl px-4 py-3 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="atau ketik langsung di sini..."
                  />

                  {/* Examples */}
                  <div className="mt-4">
                    <p className="text-sm text-white/50 mb-2">Contoh soal:</p>
                    <div className="flex flex-wrap gap-2">
                      {examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(ex.value)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition"
                        >
                          {ex.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Solution Section */}
                {solution && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 animate-fadeIn">
                    {/* Question */}
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 mb-6 border border-cyan-500/20">
                      <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <span className="text-xl">❓</span>
                        <span className="font-semibold">Pertanyaan:</span>
                      </div>
                      <div className="text-2xl font-semibold">
                        <MathRenderer expression={solution.question} />
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-purple-400 mb-4">
                        <span className="text-xl">✍️</span>
                        <span className="font-semibold">Penyelesaian:</span>
                      </div>
                      <div className="space-y-3">
                        {solution.steps.slice(0, visibleSteps).map((step, i) => (
                          <div
                            key={i}
                            className="bg-slate-800/30 rounded-xl p-4 border-l-4 border-purple-500/50 animate-slideIn"
                          >
                            <p className="text-white/80 mb-2">{step.explanation}</p>
                            <div className="text-lg font-semibold text-white bg-slate-800/50 rounded-lg px-3 py-2 inline-block">
                              <MathRenderer expression={step.result} />
                            </div>
                            {step.formula && (
                              <span className="ml-2 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                                {step.formula}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final Answer */}
                    {visibleSteps === solution.steps.length && (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-5 mb-6 border border-green-500/30 animate-fadeIn">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <span className="text-2xl">🎯</span>
                          <span className="font-semibold text-lg">Jawaban Akhir:</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">
                          <MathRenderer expression={solution.finalAnswer} />
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {showNotes && (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-5 border border-yellow-500/20 animate-fadeIn">
                        <div className="flex items-center gap-2 text-yellow-400 mb-3">
                          <span className="text-xl">📝</span>
                          <span className="font-semibold">Catatan Penting:</span>
                        </div>
                        <ul className="space-y-2">
                          {solution.notes.map((note, i) => (
                            <li key={i} className="text-white/70 text-sm">{note}</li>
                          ))}
                        </ul>
                        {solution.proof && (
                          <div className="mt-4 pt-4 border-t border-yellow-500/20">
                            <p className="text-sm text-emerald-400">✓ {solution.proof}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Quiz Mode */
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">🎮 Mode Kuis</h2>
                    <p className="text-white/60">Jawab dengan cepat dan benar!</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400">{quizScore}</p>
                      <p className="text-xs text-white/50">Skor</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-400">
                        {quizStreak > 0 && '🔥'}{quizStreak}
                      </p>
                      <p className="text-xs text-white/50">Streak</p>
                    </div>
                  </div>
                </div>

                {quizQuestion && (
                  <div className="space-y-6">
                    <div className={`bg-slate-800/50 rounded-2xl p-8 text-center transition-all ${
                      quizFeedback === 'correct' ? 'ring-2 ring-green-500 bg-green-500/10' :
                      quizFeedback === 'wrong' ? 'ring-2 ring-red-500 bg-red-500/10' : ''
                    }`}>
                      <p className="text-4xl font-bold mb-2">{quizQuestion.q} = ?</p>
                      {quizFeedback && (
                        <p className={`text-lg ${quizFeedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                          {quizFeedback === 'correct' ? '✅ Benar!' : `❌ Salah! Jawaban: ${quizQuestion.a}`}
                        </p>
                      )}
                    </div>

                    <input
                      type="number"
                      value={quizAnswer}
                      onChange={e => setQuizAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkQuizAnswer()}
                      className="w-full bg-slate-800/50 rounded-xl px-4 py-4 text-2xl text-center font-bold border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="Ketik jawabanmu..."
                      autoFocus
                      disabled={quizFeedback !== null}
                    />

                    <button
                      onClick={checkQuizAnswer}
                      disabled={!quizAnswer || quizFeedback !== null}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 rounded-xl font-bold text-lg transition"
                    >
                      Cek Jawaban
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal for special input */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-white/20 animate-fadeIn">
            {modal.type === 'fraction' && (
              <>
                <h3 className="text-lg font-bold mb-4 text-center">Masukkan Pecahan</h3>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="Pembilang"
                    value={modal.data.num}
                    onChange={e => setModal({ ...modal, data: { ...modal.data, num: e.target.value } })}
                    className="w-32 bg-slate-700 rounded-lg px-3 py-2 text-center text-xl border border-white/10"
                    autoFocus
                  />
                  <div className="w-32 h-0.5 bg-white"></div>
                  <input
                    type="number"
                    placeholder="Penyebut"
                    value={modal.data.den}
                    onChange={e => setModal({ ...modal, data: { ...modal.data, den: e.target.value } })}
                    className="w-32 bg-slate-700 rounded-lg px-3 py-2 text-center text-xl border border-white/10"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2 bg-slate-700 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (modal.data.num && modal.data.den) {
                        addToInput(`${modal.data.num}/${modal.data.den}`)
                        setModal(null)
                      }
                    }}
                    className="flex-1 py-2 bg-cyan-500 rounded-lg font-semibold"
                  >
                    OK
                  </button>
                </div>
              </>
            )}

            {modal.type === 'power' && (
              <>
                <h3 className="text-lg font-bold mb-4 text-center">Masukkan Pangkat</h3>
                <div className="flex items-start justify-center gap-1 mb-4">
                  <input
                    type="number"
                    placeholder="Basis"
                    value={modal.data.base}
                    onChange={e => setModal({ ...modal, data: { ...modal.data, base: e.target.value } })}
                    className="w-24 bg-slate-700 rounded-lg px-3 py-2 text-center text-xl border border-white/10"
                    autoFocus
                  />
                  <input
                    type="number"
                    placeholder="n"
                    value={modal.data.exp}
                    onChange={e => setModal({ ...modal, data: { ...modal.data, exp: e.target.value } })}
                    className="w-16 bg-slate-700 rounded-lg px-2 py-1 text-center text-sm border border-white/10 -mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2 bg-slate-700 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (modal.data.base && modal.data.exp) {
                        addToInput(`${modal.data.base}^${modal.data.exp}`)
                        setModal(null)
                      }
                    }}
                    className="flex-1 py-2 bg-pink-500 rounded-lg font-semibold"
                  >
                    OK
                  </button>
                </div>
              </>
            )}

            {modal.type === 'sqrt' && (
              <>
                <h3 className="text-lg font-bold mb-4 text-center">Masukkan Akar</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-3xl">√</span>
                  <input
                    type="number"
                    placeholder="Bilangan"
                    value={modal.data.value}
                    onChange={e => setModal({ ...modal, data: { ...modal.data, value: e.target.value } })}
                    className="w-32 bg-slate-700 rounded-lg px-3 py-2 text-center text-xl border-t-2 border-white/50"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2 bg-slate-700 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (modal.data.value) {
                        addToInput(`√${modal.data.value}`)
                        setModal(null)
                      }
                    }}
                    className="flex-1 py-2 bg-cyan-500 rounded-lg font-semibold"
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-fall { animation: fall 3s linear forwards; }
      `}</style>
    </div>
  )
}
