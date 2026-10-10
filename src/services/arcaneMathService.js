const fs = require('fs');
const path = require('path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'arcaneMathQuestions.json');
const RANKING_FILE = path.join(DATA_DIR, 'arcaneMathRanking.json');
const STATE_FILE = path.join(DATA_DIR, 'arcaneMathState.json');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ==========================================
// BANCO INICIAL DE QUESTÕES ARCANAS (SEED)
// ==========================================
const INITIAL_SEED_QUESTIONS = {
  facil: [
    {
      id: 'math_f_1',
      difficulty: 'facil',
      pt: {
        question: 'Se um mago colhe 7 cristais a cada 4 horas, quantos cristais ele terá colhido após 12 horas?',
        options: ['14 cristais', '21 cristais', '28 cristais', '35 cristais'],
        correctIndex: 1,
        explanation: '12 horas contêm 3 intervalos de 4 horas (12 ÷ 4 = 3). Portanto: 3 × 7 = 21 cristais.',
      },
      en: {
        question: 'If a mage harvests 7 crystals every 4 hours, how many crystals will be gathered after 12 hours?',
        options: ['14 crystals', '21 crystals', '28 crystals', '35 crystals'],
        correctIndex: 1,
        explanation: '12 hours contains 3 periods of 4 hours (12 ÷ 4 = 3). Thus: 3 × 7 = 21 crystals.',
      },
    },
    {
      id: 'math_f_2',
      difficulty: 'facil',
      pt: {
        question: 'Uma poção necessita de 3/4 de litro de orvalho lunar. Se você preparar 8 frascos, quantos litros precisará?',
        options: ['4 litros', '6 litros', '8 litros', '10 litros'],
        correctIndex: 1,
        explanation: '8 frascos × (3/4) = 24/4 = 6 litros no total.',
      },
      en: {
        question: 'A potion requires 3/4 liter of moon dew. If you brew 8 vials, how many liters are required?',
        options: ['4 liters', '6 liters', '8 liters', '10 liters'],
        correctIndex: 1,
        explanation: '8 vials × (3/4) = 24/4 = 6 liters in total.',
      },
    },
    {
      id: 'math_f_3',
      difficulty: 'facil',
      pt: {
        question: 'Qual é o valor de x na equação rúnica: 4x - 15 = 45?',
        options: ['x = 12', 'x = 15', 'x = 18', 'x = 20'],
        correctIndex: 1,
        explanation: '4x = 45 + 15 ➔ 4x = 60 ➔ x = 60 ÷ 4 = 15.',
      },
      en: {
        question: 'What is the value of x in the runic equation: 4x - 15 = 45?',
        options: ['x = 12', 'x = 15', 'x = 18', 'x = 20'],
        correctIndex: 1,
        explanation: '4x = 45 + 15 ➔ 4x = 60 ➔ x = 60 ÷ 4 = 15.',
      },
    },
    {
      id: 'math_f_4',
      difficulty: 'facil',
      pt: {
        question: 'Um baú continha 120 runas. Foram retiradas 35% delas. Quantas runas restaram no baú?',
        options: ['72 runas', '78 runas', '82 runas', '88 runas'],
        correctIndex: 1,
        explanation: 'Se 35% foram retiradas, restaram 65%: 120 × 0.65 = 78 runas.',
      },
      en: {
        question: 'A chest contained 120 runes. 35% were removed. How many runes remain in the chest?',
        options: ['72 runes', '78 runes', '82 runes', '88 runes'],
        correctIndex: 1,
        explanation: 'If 35% were removed, 65% remain: 120 × 0.65 = 78 runes.',
      },
    },
    {
      id: 'math_f_5',
      difficulty: 'facil',
      pt: {
        question: 'Qual é a média aritmética entre os números mágicos 14, 22, 36 e 48?',
        options: ['28', '30', '32', '34'],
        correctIndex: 1,
        explanation: 'Soma = 14 + 22 + 36 + 48 = 120. Média = 120 ÷ 4 = 30.',
      },
      en: {
        question: 'What is the arithmetic mean of the magic numbers 14, 22, 36, and 48?',
        options: ['28', '30', '32', '34'],
        correctIndex: 1,
        explanation: 'Sum = 14 + 22 + 36 + 48 = 120. Mean = 120 ÷ 4 = 30.',
      },
    },
    {
      id: 'math_f_6',
      difficulty: 'facil',
      pt: {
        question: 'O perímetro de um altar quadrado sagrado é de 52 metros. Qual é a sua área?',
        options: ['144 m²', '169 m²', '196 m²', '225 m²'],
        correctIndex: 1,
        explanation: 'Lado = 52 ÷ 4 = 13 m. Área = 13 × 13 = 169 m².',
      },
      en: {
        question: 'The perimeter of a sacred square altar is 52 meters. What is its area?',
        options: ['144 m²', '169 m²', '196 m²', '225 m²'],
        correctIndex: 1,
        explanation: 'Side = 52 ÷ 4 = 13 m. Area = 13 × 13 = 169 m².',
      },
    },
    {
      id: 'math_f_7',
      difficulty: 'facil',
      pt: {
        question: 'Em uma torre, o relógio mágico adianta 4 minutos a cada 6 horas. Quantos minutos adiantará em 3 dias?',
        options: ['36 minutos', '48 minutos', '56 minutos', '64 minutos'],
        correctIndex: 1,
        explanation: '3 dias = 72 horas. Número de ciclos de 6h = 72 ÷ 6 = 12. Adiantamento = 12 × 4 = 48 minutos.',
      },
      en: {
        question: 'In a wizard tower, a clock gains 4 minutes every 6 hours. How many minutes will it gain in 3 days?',
        options: ['36 minutes', '48 minutes', '56 minutes', '64 minutes'],
        correctIndex: 1,
        explanation: '3 days = 72 hours. Number of 6h cycles = 72 ÷ 6 = 12. Total gain = 12 × 4 = 48 minutes.',
      },
    },
    {
      id: 'math_f_8',
      difficulty: 'facil',
      pt: {
        question: 'Qual é o menor múltiplo comum (MMC) entre 12 e 18?',
        options: ['24', '36', '48', '72'],
        correctIndex: 1,
        explanation: 'Múltiplos de 12: 12, 24, 36... Múltiplos de 18: 18, 36... Logo, MMC(12, 18) = 36.',
      },
      en: {
        question: 'What is the least common multiple (LCM) of 12 and 18?',
        options: ['24', '36', '48', '72'],
        correctIndex: 1,
        explanation: 'Multiples of 12: 12, 24, 36... Multiples of 18: 18, 36... Thus, LCM(12, 18) = 36.',
      },
    },
    {
      id: 'math_f_9',
      difficulty: 'facil',
      pt: {
        question: 'Se 5 grimórios custam 175 moedas, quanto custarão 8 grimórios do mesmo tipo?',
        options: ['240 moedas', '280 moedas', '320 moedas', '350 moedas'],
        correctIndex: 1,
        explanation: 'Cada grimório custa 175 ÷ 5 = 35 moedas. 8 grimórios = 8 × 35 = 280 moedas.',
      },
      en: {
        question: 'If 5 grimoires cost 175 coins, how much do 8 identical grimoires cost?',
        options: ['240 coins', '280 coins', '320 coins', '350 coins'],
        correctIndex: 1,
        explanation: 'Each grimoire costs 175 ÷ 5 = 35 coins. 8 grimoires = 8 × 35 = 280 coins.',
      },
    },
    {
      id: 'math_f_10',
      difficulty: 'facil',
      pt: {
        question: 'Qual é o resultado da expressão: 15 + 3 × (8 - 2)?',
        options: ['27', '33', '36', '108'],
        correctIndex: 1,
        explanation: 'Primeiro parênteses: (8 - 2) = 6. Multiplicação: 3 × 6 = 18. Soma: 15 + 18 = 33.',
      },
      en: {
        question: 'What is the result of the expression: 15 + 3 × (8 - 2)?',
        options: ['27', '33', '36', '108'],
        correctIndex: 1,
        explanation: 'Parentheses first: (8 - 2) = 6. Multiplication: 3 × 6 = 18. Addition: 15 + 18 = 33.',
      },
    },
  ],
  medio: [
    {
      id: 'math_m_1',
      difficulty: 'medio',
      pt: {
        question: 'Resolva a equação quadrática x² - 7x + 10 = 0. Quais são as raízes reais?',
        options: ['x = 1 e x = 10', 'x = 2 e x = 5', 'x = 3 e x = 4', 'x = -2 e x = -5'],
        correctIndex: 1,
        explanation: 'Por Bhaskara ou fatoração: (x - 2)(x - 5) = 0 ➔ raízes x = 2 e x = 5.',
      },
      en: {
        question: 'Solve the quadratic equation x² - 7x + 10 = 0. What are the real roots?',
        options: ['x = 1 and x = 10', 'x = 2 and x = 5', 'x = 3 and x = 4', 'x = -2 and x = -5'],
        correctIndex: 1,
        explanation: 'By factoring: (x - 2)(x - 5) = 0 ➔ roots are x = 2 and x = 5.',
      },
    },
    {
      id: 'math_m_2',
      difficulty: 'medio',
      pt: {
        question: 'Um triângulo retângulo possui catetos medindo 9 cm e 12 cm. Qual é o comprimento da hipotenusa?',
        options: ['13 cm', '15 cm', '16 cm', '18 cm'],
        correctIndex: 1,
        explanation: 'Pelo Teorema de Pitágoras: h² = 9² + 12² = 81 + 144 = 225 ➔ h = √225 = 15 cm.',
      },
      en: {
        question: 'A right triangle has legs of 9 cm and 12 cm. What is the length of the hypotenuse?',
        options: ['13 cm', '15 cm', '16 cm', '18 cm'],
        correctIndex: 1,
        explanation: 'By Pythagorean Theorem: h² = 9² + 12² = 81 + 144 = 225 ➔ h = √225 = 15 cm.',
      },
    },
    {
      id: 'math_m_3',
      difficulty: 'medio',
      pt: {
        question: 'De quantas maneiras distintas um conselho de 3 magos pode ser escolhido a partir de um grupo de 8 aprendizes?',
        options: ['24 maneiras', '56 maneiras', '112 maneiras', '336 maneiras'],
        correctIndex: 1,
        explanation: 'Combinação C(8, 3) = 8! / (3! × 5!) = (8 × 7 × 6) / (3 × 2 × 1) = 56.',
      },
      en: {
        question: 'How many ways can a council of 3 wizards be selected from a group of 8 apprentices?',
        options: ['24 ways', '56 ways', '112 ways', '336 ways'],
        correctIndex: 1,
        explanation: 'Combination C(8, 3) = 8! / (3! × 5!) = (8 × 7 × 6) / 6 = 56.',
      },
    },
    {
      id: 'math_m_4',
      difficulty: 'medio',
      pt: {
        question: 'Se log₂(x) = 5, qual é o valor de x?',
        options: ['10', '32', '25', '64'],
        correctIndex: 1,
        explanation: 'Pela definição de logaritmo: 2⁵ = x ➔ x = 32.',
      },
      en: {
        question: 'If log₂(x) = 5, what is the value of x?',
        options: ['10', '32', '25', '64'],
        correctIndex: 1,
        explanation: 'By logarithm definition: 2⁵ = x ➔ x = 32.',
      },
    },
    {
      id: 'math_m_5',
      difficulty: 'medio',
      pt: {
        question: 'Uma progressão aritmética (PA) tem primeiro termo a₁ = 3 e razão r = 4. Qual é o 15º termo?',
        options: ['55', '59', '63', '67'],
        correctIndex: 1,
        explanation: 'aₙ = a₁ + (n - 1) × r ➔ a₁₅ = 3 + 14 × 4 = 3 + 56 = 59.',
      },
      en: {
        question: 'An arithmetic progression has first term a₁ = 3 and common difference r = 4. What is the 15th term?',
        options: ['55', '59', '63', '67'],
        correctIndex: 1,
        explanation: 'aₙ = a₁ + (n - 1) × r ➔ a₁₅ = 3 + 14 × 4 = 3 + 56 = 59.',
      },
    },
    {
      id: 'math_m_6',
      difficulty: 'medio',
      pt: {
        question: 'Dois dados de 6 faces são lançados. Qual é a probabilidade da soma das faces ser igual a 7?',
        options: ['1/12', '1/6', '1/4', '5/36'],
        correctIndex: 1,
        explanation: 'Casos favoráveis com soma 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 casos de 36. Probabilidade = 6/36 = 1/6.',
      },
      en: {
        question: 'Two 6-sided dice are rolled. What is the probability that the sum of the dice is 7?',
        options: ['1/12', '1/6', '1/4', '5/36'],
        correctIndex: 1,
        explanation: 'Favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 out of 36. Probability = 6/36 = 1/6.',
      },
    },
    {
      id: 'math_m_7',
      difficulty: 'medio',
      pt: {
        question: 'Qual é o volume de um cilindro rúnico com raio da base r = 3 cm e altura h = 10 cm? (Use π ≈ 3,14)',
        options: ['188,4 cm³', '282,6 cm³', '314,0 cm³', '942,0 cm³'],
        correctIndex: 1,
        explanation: 'V = π × r² × h = 3,14 × 9 × 10 = 282,6 cm³.',
      },
      en: {
        question: 'What is the volume of a runic cylinder with base radius r = 3 cm and height h = 10 cm? (Use π ≈ 3.14)',
        options: ['188.4 cm³', '282.6 cm³', '314.0 cm³', '942.0 cm³'],
        correctIndex: 1,
        explanation: 'V = π × r² × h = 3.14 × 9 × 10 = 282.6 cm³.',
      },
    },
    {
      id: 'math_m_8',
      difficulty: 'medio',
      pt: {
        question: 'Qual é o valor exato de sen(30°) + cos(60°)?',
        options: ['√3/2', '1', '√2/2', '1/2'],
        correctIndex: 1,
        explanation: 'sen(30°) = 1/2 e cos(60°) = 1/2. Logo: 1/2 + 1/2 = 1.',
      },
      en: {
        question: 'What is the exact value of sin(30°) + cos(60°)?',
        options: ['√3/2', '1', '√2/2', '1/2'],
        correctIndex: 1,
        explanation: 'sin(30°) = 1/2 and cos(60°) = 1/2. Therefore: 1/2 + 1/2 = 1.',
      },
    },
    {
      id: 'math_m_9',
      difficulty: 'medio',
      pt: {
        question: 'Um capital de 1.000 moedas foi aplicado a juros simples de 5% ao mês durante 6 meses. Qual o montante final?',
        options: ['1.250 moedas', '1.300 moedas', '1.350 moedas', '1.400 moedas'],
        correctIndex: 1,
        explanation: 'J = C × i × t = 1000 × 0,05 × 6 = 300 moedas de juros. Montante = 1000 + 300 = 1300.',
      },
      en: {
        question: 'A principal of 1,000 coins is invested at 5% simple interest per month for 6 months. What is the final amount?',
        options: ['1,250 coins', '1,300 coins', '1,350 coins', '1,400 coins'],
        correctIndex: 1,
        explanation: 'Interest = P × r × t = 1000 × 0.05 × 6 = 300. Final Amount = 1000 + 300 = 1300.',
      },
    },
    {
      id: 'math_m_10',
      difficulty: 'medio',
      pt: {
        question: 'Se f(x) = 2x² - 3x + 5, qual é o valor numérico de f(4)?',
        options: ['21', '25', '29', '33'],
        correctIndex: 1,
        explanation: 'f(4) = 2(4)² - 3(4) + 5 = 2(16) - 12 + 5 = 32 - 12 + 5 = 25.',
      },
      en: {
        question: 'If f(x) = 2x² - 3x + 5, what is the numerical value of f(4)?',
        options: ['21', '25', '29', '33'],
        correctIndex: 1,
        explanation: 'f(4) = 2(4)² - 3(4) + 5 = 2(16) - 12 + 5 = 32 - 12 + 5 = 25.',
      },
    },
  ],
  dificil: [
    {
      id: 'math_d_1',
      difficulty: 'dificil',
      pt: {
        question: 'Qual é a derivada da função f(x) = 3x⁴ - 5x² + 7x - 9 no ponto x = 2?',
        options: ['68', '83', '91', '103'],
        correctIndex: 1,
        explanation: "f'(x) = 12x³ - 10x + 7. Aplicando x = 2: 12(8) - 10(2) + 7 = 96 - 20 + 7 = 83.",
      },
      en: {
        question: 'What is the derivative of f(x) = 3x⁴ - 5x² + 7x - 9 at the point x = 2?',
        options: ['68', '83', '91', '103'],
        correctIndex: 1,
        explanation: "f'(x) = 12x³ - 10x + 7. Evaluating at x = 2: 12(8) - 10(2) + 7 = 96 - 20 + 7 = 83.",
      },
    },
    {
      id: 'math_d_2',
      difficulty: 'dificil',
      pt: {
        question: 'Qual é a soma dos infinitos termos da progressão geométrica (PG): 12, 4, 4/3, 4/9...?',
        options: ['16', '18', '20', '24'],
        correctIndex: 1,
        explanation: 'Razão q = 4/12 = 1/3. Soma = a₁ / (1 - q) = 12 / (1 - 1/3) = 12 / (2/3) = 18.',
      },
      en: {
        question: 'What is the sum of the infinite geometric series: 12, 4, 4/3, 4/9...?',
        options: ['16', '18', '20', '24'],
        correctIndex: 1,
        explanation: 'Common ratio q = 1/3. Sum = a₁ / (1 - q) = 12 / (2/3) = 18.',
      },
    },
    {
      id: 'math_d_3',
      difficulty: 'dificil',
      pt: {
        question: 'Qual é o determinante da matriz 2x2: [[7, 4], [5, 3]]?',
        options: ['-1', '1', '2', '41'],
        correctIndex: 1,
        explanation: 'Det = (7 × 3) - (4 × 5) = 21 - 20 = 1.',
      },
      en: {
        question: 'What is the determinant of the 2x2 matrix: [[7, 4], [5, 3]]?',
        options: ['-1', '1', '2', '41'],
        correctIndex: 1,
        explanation: 'Det = (7 × 3) - (4 × 5) = 21 - 20 = 1.',
      },
    },
    {
      id: 'math_d_4',
      difficulty: 'dificil',
      pt: {
        question: 'Quantos anagramas possui a palavra ARCANO?',
        options: ['180', '360', '720', '1440'],
        correctIndex: 1,
        explanation: 'A palavra ARCANO possui 6 letras com a letra A repetida 2 vezes. Total = 6! / 2! = 720 / 2 = 360.',
      },
      en: {
        question: 'How many distinct permutations exist for the letters of ARCANO?',
        options: ['180', '360', '720', '1440'],
        correctIndex: 1,
        explanation: '6 letters with 2 "A"s. Permutations = 6! / 2! = 720 / 2 = 360.',
      },
    },
    {
      id: 'math_d_5',
      difficulty: 'dificil',
      pt: {
        question: 'Qual é a integral definida de 2x dx no intervalo de x = 1 a x = 5?',
        options: ['20', '24', '26', '28'],
        correctIndex: 1,
        explanation: 'A primitiva de 2x é x². Avaliando de 1 a 5: 5² - 1² = 25 - 1 = 24.',
      },
      en: {
        question: 'What is the definite integral of 2x dx evaluated from x = 1 to x = 5?',
        options: ['20', '24', '26', '28'],
        correctIndex: 1,
        explanation: 'The antiderivative of 2x is x². Evaluating from 1 to 5: 5² - 1² = 25 - 1 = 24.',
      },
    },
    {
      id: 'math_d_6',
      difficulty: 'dificil',
      pt: {
        question: 'Considere o número complexo z = 3 + 4i. Qual é o seu módulo |z|?',
        options: ['4', '5', '7', '25'],
        correctIndex: 1,
        explanation: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      },
      en: {
        question: 'Consider the complex number z = 3 + 4i. What is its modulus |z|?',
        options: ['4', '5', '7', '25'],
        correctIndex: 1,
        explanation: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      },
    },
    {
      id: 'math_d_7',
      difficulty: 'dificil',
      pt: {
        question: 'Qual é o resto da divisão de 2¹⁰⁰ por 7?',
        options: ['1', '2', '4', '6'],
        correctIndex: 1,
        explanation: 'Pelo Pequeno Teorema de Fermat, 2⁶ ≡ 1 (mod 7). 100 = 6 × 16 + 4. Logo 2¹⁰⁰ ≡ 2⁴ = 16 ≡ 2 (mod 7).',
      },
      en: {
        question: 'What is the remainder when 2¹⁰⁰ is divided by 7?',
        options: ['1', '2', '4', '6'],
        correctIndex: 1,
        explanation: "By Fermat's Little Theorem, 2⁶ ≡ 1 (mod 7). 100 = 6 × 16 + 4. Thus 2¹⁰⁰ ≡ 2⁴ = 16 ≡ 2 (mod 7).",
      },
    },
    {
      id: 'math_d_8',
      difficulty: 'dificil',
      pt: {
        question: 'Qual é o limite: lim (x ➔ 0) de [sen(5x) / x]?',
        options: ['0', '5', '1', 'Infinito'],
        correctIndex: 1,
        explanation: 'Pelo limite fundamental lim (u ➔ 0) [sen(u)/u] = 1: lim [5 × sen(5x)/(5x)] = 5 × 1 = 5.',
      },
      en: {
        question: 'What is the limit: lim (x ➔ 0) of [sin(5x) / x]?',
        options: ['0', '5', '1', 'Infinity'],
        correctIndex: 1,
        explanation: 'Using the fundamental limit lim (u ➔ 0) [sin(u)/u] = 1: lim [5 × sin(5x)/(5x)] = 5 × 1 = 5.',
      },
    },
    {
      id: 'math_d_9',
      difficulty: 'dificil',
      pt: {
        question: 'Quantos vértices possui um icosaedro regular?',
        options: ['8', '12', '20', '30'],
        correctIndex: 1,
        explanation: 'Um icosaedro regular possui 20 faces triangulares, 30 arestas e 12 vértices (V - A + F = 2 ➔ 12 - 30 + 20 = 2).',
      },
      en: {
        question: 'How many vertices does a regular icosahedron have?',
        options: ['8', '12', '20', '30'],
        correctIndex: 1,
        explanation: 'A regular icosahedron has 20 triangular faces, 30 edges, and 12 vertices (Euler characteristic: V - E + F = 2).',
      },
    },
    {
      id: 'math_d_10',
      difficulty: 'dificil',
      pt: {
        question: 'Se a matriz A é ortogonal (Aᵀ × A = I), qual é o módulo do seu determinante |det(A)|?',
        options: ['0', '1', '2', 'Indeterminado'],
        correctIndex: 1,
        explanation: 'det(Aᵀ × A) = det(Aᵀ) × det(A) = (det(A))² = det(I) = 1. Portanto |det(A)| = 1.',
      },
      en: {
        question: 'If matrix A is orthogonal (Aᵀ × A = I), what is the absolute value of its determinant |det(A)|?',
        options: ['0', '1', '2', 'Indeterminate'],
        correctIndex: 1,
        explanation: 'det(Aᵀ × A) = det(A)² = det(I) = 1 ➔ |det(A)| = 1.',
      },
    },
  ],
  extremo: [
    {
      id: 'math_e_1',
      difficulty: 'extremo',
      pt: {
        question: '[Nível IMO/Putnam] Seja p um número primo ímpar. Quantos resíduos quadráticos módulo p existem no conjunto {1, 2, ..., p - 1}?',
        options: ['p - 1', '(p - 1) / 2', '(p + 1) / 2', '√p'],
        correctIndex: 1,
        explanation: 'Para todo primo ímpar p, exatamente metade dos elementos de (Z/pZ)* são resíduos quadráticos: (p - 1)/2.',
      },
      en: {
        question: '[IMO/Putnam Level] Let p be an odd prime. How many quadratic residues modulo p exist in {1, 2, ..., p - 1}?',
        options: ['p - 1', '(p - 1) / 2', '(p + 1) / 2', '√p'],
        correctIndex: 1,
        explanation: 'For any odd prime p, exactly half of the units in (Z/pZ)* are quadratic residues: (p - 1)/2.',
      },
    },
    {
      id: 'math_e_2',
      difficulty: 'extremo',
      pt: {
        question: '[Olimpíada Mundial] Qual é o valor da soma infinita de Basileia: ∑ (1 / n²) para n de 1 até o infinito?',
        options: ['π / 4', 'π² / 6', 'π² / 8', 'e² / 2'],
        correctIndex: 1,
        explanation: 'Resolvido por Leonhard Euler em 1734: a série dos inversos dos quadrados converge para π²/6.',
      },
      en: {
        question: '[World Math Olympiad] What is the value of the Basel sum: ∑ (1 / n²) from n = 1 to infinity?',
        options: ['π / 4', 'π² / 6', 'π² / 8', 'e² / 2'],
        correctIndex: 1,
        explanation: "Solved by Leonhard Euler in 1734: the Basel problem series converges exactly to π²/6.",
      },
    },
    {
      id: 'math_e_3',
      difficulty: 'extremo',
      pt: {
        question: '[Teoria dos Números Avançada] Qual é o valor da função totiente de Euler φ(360)?',
        options: ['72', '96', '120', '144'],
        correctIndex: 1,
        explanation: '360 = 2³ × 3² × 5¹. φ(360) = 360 × (1 - 1/2) × (1 - 1/3) × (1 - 1/5) = 360 × (1/2) × (2/3) × (4/5) = 96.',
      },
      en: {
        question: "[Advanced Number Theory] What is the value of Euler's totient function φ(360)?",
        options: ['72', '96', '120', '144'],
        correctIndex: 1,
        explanation: '360 = 2³ × 3² × 5¹. φ(360) = 360 × (1/2) × (2/3) × (4/5) = 96.',
      },
    },
    {
      id: 'math_e_4',
      difficulty: 'extremo',
      pt: {
        question: '[Cálculo e Análise Real] Qual é o valor da Integral Gaussiana: ∫₋∞⁺∞ e^(-x²) dx?',
        options: ['1', '√π', 'π', '2π'],
        correctIndex: 1,
        explanation: 'A integral clássica de Gauss sobre toda a reta real é rigorosamente demonstrada como √π.',
      },
      en: {
        question: '[Analysis & Calculus] What is the exact value of the Gaussian Integral: ∫₋∞⁺∞ e^(-x²) dx?',
        options: ['1', '√π', 'π', '2π'],
        correctIndex: 1,
        explanation: 'The classic Gaussian integral over the entire real line evaluates exactly to √π.',
      },
    },
    {
      id: 'math_e_5',
      difficulty: 'extremo',
      pt: {
        question: '[Geometria Olímpica] Em um triângulo qualquer, a reta de Euler conecta quais pontos notáveis?',
        options: ['Incentro, Baricentro e Incentro', 'Ortocentro, Baricentro e Circuncentro', 'Baricentro, Circuncentro e Ex-incentro', 'Ortocentro, Incentro e Ponto de Fermat'],
        correctIndex: 1,
        explanation: 'A reta de Euler passa pelo Ortocentro (H), Baricentro (G) e Circuncentro (O), com HG = 2 × GO.',
      },
      en: {
        question: '[Olympiad Geometry] In any arbitrary triangle, the Euler line collinearly connects which triangle centers?',
        options: ['Incenter, Centroid, and Orthocenter', 'Orthocenter, Centroid, and Circumcenter', 'Centroid, Circumcenter, and Excenter', 'Orthocenter, Incenter, and Fermat point'],
        correctIndex: 1,
        explanation: 'The Euler line connects the Orthocenter (H), Centroid (G), and Circumcenter (O), satisfying HG = 2 × GO.',
      },
    },
    {
      id: 'math_e_6',
      difficulty: 'extremo',
      pt: {
        question: '[Álgebra Abstrata] Qual é a ordem do grupo simétrico S₅ de permutações de 5 elementos?',
        options: ['60', '120', '240', '720'],
        correctIndex: 1,
        explanation: 'A ordem do grupo simétrico Sₙ é dada por n!. Para n = 5: 5! = 5 × 4 × 3 × 2 × 1 = 120.',
      },
      en: {
        question: '[Abstract Algebra] What is the order of the symmetric group S₅ of permutations on 5 elements?',
        options: ['60', '120', '240', '720'],
        correctIndex: 1,
        explanation: 'The order of the symmetric group Sₙ is n!. For n = 5: 5! = 120.',
      },
    },
    {
      id: 'math_e_7',
      difficulty: 'extremo',
      pt: {
        question: '[Olimpíada Internacional] Se f(x) satisfaz a equação funcional f(x + y) = f(x)f(y) para todos x,y reais com f(1) = e, qual é f(x)?',
        options: ['f(x) = e × x', 'f(x) = e^x', 'f(x) = ln(x)', 'f(x) = x^e'],
        correctIndex: 1,
        explanation: 'A clássica equação funcional de Cauchy contínua para multiplicação exponencial resulta estritamente em f(x) = e^x.',
      },
      en: {
        question: '[International Olympiad] If f(x) satisfies Cauchy’s equation f(x + y) = f(x)f(y) for all real x,y with f(1) = e, what is f(x)?',
        options: ['f(x) = e × x', 'f(x) = e^x', 'f(x) = ln(x)', 'f(x) = x^e'],
        correctIndex: 1,
        explanation: 'The continuous exponential Cauchy functional equation uniquely yields f(x) = e^x.',
      },
    },
    {
      id: 'math_e_8',
      difficulty: 'extremo',
      pt: {
        question: '[Teoria dos Grafos] Pelo Teorema das Quatro Cores, qual é o número cromático máximo para colorir qualquer grafo planar sem faces adjacentes de mesma cor?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
        explanation: 'Provado por Appel e Haken em 1976: qualquer mapa/grafo planar requer no máximo 4 cores.',
      },
      en: {
        question: '[Graph Theory] By the Four Color Theorem, what is the maximum chromatic number required to color any planar graph without adjacent regions sharing a color?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
        explanation: 'Proven by Appel and Haken in 1976: no more than 4 colors are ever required for any planar map.',
      },
    },
    {
      id: 'math_e_9',
      difficulty: 'extremo',
      pt: {
        question: '[Probabilidade Avançada] No problema do colecionador de cupons com n itens distintos, qual é a ordem assintótica do número esperado de tentativas para obter a coleção completa?',
        options: ['O(n)', 'O(n ln n)', 'O(n²)', 'O(2^n)'],
        correctIndex: 1,
        explanation: 'O valor esperado E[T] = n × Hₙ, onde Hₙ é o n-ésimo número harmônico, logo o comportamento assintótico é n ln(n).',
      },
      en: {
        question: '[Advanced Probability] In the coupon collector problem with n distinct coupons, what is the asymptotic expected number of trials to collect all n items?',
        options: ['O(n)', 'O(n ln n)', 'O(n²)', 'O(2^n)'],
        correctIndex: 1,
        explanation: 'The expectation is E[T] = n × Hₙ. Since Hₙ ≈ ln(n), the asymptotic expectation is O(n ln n).',
      },
    },
    {
      id: 'math_e_10',
      difficulty: 'extremo',
      pt: {
        question: '[Teorema de Fermat / Euler] Qual é o menor inteiro positivo n tal que 2ⁿ ≡ 1 (mod 17)?',
        options: ['4', '8', '16', '32'],
        correctIndex: 1,
        explanation: 'Calculando potências de 2 mod 17: 2⁴ = 16 ≡ -1. Elevando ao quadrado: (2⁴)² = 2⁸ ≡ (-1)² = 1 (mod 17). Logo, n = 8.',
      },
      en: {
        question: '[Euler / Fermat Order] What is the smallest positive integer n such that 2ⁿ ≡ 1 (mod 17)?',
        options: ['4', '8', '16', '32'],
        correctIndex: 1,
        explanation: '2⁴ = 16 ≡ -1 (mod 17). Squaring both sides: (2⁴)² = 2⁸ ≡ (-1)² = 1 (mod 17). Thus, the multiplicative order is 8.',
      },
    },
  ],
};

// ==========================================
// PERSISTÊNCIA ATÔMICA E ESTADO
// ==========================================

function getQuestionsData() {
  const data = readJson(QUESTIONS_FILE, null);
  if (!data || !data.questions) {
    const fresh = {
      meta: {
        totalQuestions: 40,
        counts: { facil: 10, medio: 10, dificil: 10, extremo: 10 },
        lastGeneratedAt: Date.now(),
      },
      questions: INITIAL_SEED_QUESTIONS,
    };
    writeJsonAtomic(QUESTIONS_FILE, fresh);
    return fresh;
  }
  return data;
}

function getRankingData() {
  return readJson(RANKING_FILE, { players: {} });
}

function getStateData() {
  return readJson(STATE_FILE, { correctSinceLastGen: 0, totalGlobalCorrect: 0 });
}

function saveStateData(state) {
  writeJsonAtomic(STATE_FILE, state);
}

/**
 * Retorna as estatísticas do grimório para exibição no embed.
 */
function getGrimoireStats() {
  const data = getQuestionsData();
  const facil = data.questions.facil?.length || 0;
  const medio = data.questions.medio?.length || 0;
  const dificil = data.questions.dificil?.length || 0;
  const extremo = data.questions.extremo?.length || 0;
  const total = facil + medio + dificil + extremo;

  return {
    total,
    facil,
    medio,
    dificil,
    extremo,
  };
}

/**
 * Determina o nível de dificuldade com base na sequência atual de acertos (streak).
 */
function getDifficultyForStreak(streak) {
  if (streak >= 13) return 'extremo';
  if (streak >= 8) return 'dificil';
  if (streak >= 4) return 'medio';
  return 'facil';
}

/**
 * Obtém uma pergunta aleatória do nível correspondente.
 */
function getRandomQuestion(difficulty, excludeIds = []) {
  const data = getQuestionsData();
  const pool = data.questions[difficulty] || data.questions.facil;
  const available = pool.filter((q) => !excludeIds.includes(q.id));

  const finalPool = available.length > 0 ? available : pool;
  const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
  return chosen;
}

/**
 * Registra a resposta do usuário e atualiza streaks e ranking global.
 */
async function recordUserAnswer({ userId, username, isCorrect, currentStreak }) {
  const state = getStateData();
  const ranking = getRankingData();

  if (!ranking.players[userId]) {
    ranking.players[userId] = {
      userId,
      username,
      highestStreak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      highestDifficultyReached: 'facil',
      updatedAt: Date.now(),
    };
  }

  const player = ranking.players[userId];
  player.username = username || player.username;
  player.totalAttempts += 1;

  let newStreak = 0;
  if (isCorrect) {
    newStreak = currentStreak + 1;
    player.totalCorrect += 1;
    if (newStreak > player.highestStreak) {
      player.highestStreak = newStreak;
    }

    const currentDiff = getDifficultyForStreak(newStreak);
    const diffRanks = { facil: 1, medio: 2, dificil: 3, extremo: 4 };
    if ((diffRanks[currentDiff] || 1) > (diffRanks[player.highestDifficultyReached] || 1)) {
      player.highestDifficultyReached = currentDiff;
    }

    state.totalGlobalCorrect = (state.totalGlobalCorrect || 0) + 1;
    state.correctSinceLastGen = (state.correctSinceLastGen || 0) + 1;

    // A cada 10 acertos acumulados globalmente, gera 10 novas perguntas no banco
    if (state.correctSinceLastGen >= 10) {
      state.correctSinceLastGen = 0;
      saveStateData(state);
      // Disparo em background sem travar a resposta do usuário
      generateBatchQuestions(10).catch((err) => {
        console.error('[ArcaneMath] Erro na geração automática de questões:', err.message);
      });
    } else {
      saveStateData(state);
    }
  } else {
    newStreak = 0;
  }

  player.updatedAt = Date.now();
  writeJsonAtomic(RANKING_FILE, ranking);

  return {
    newStreak,
    highestStreak: player.highestStreak,
    totalCorrect: player.totalCorrect,
  };
}

/**
 * Retorna o top ranking dos maiores matemáticos arcanos.
 */
function getMathRanking(limit = 10) {
  const ranking = getRankingData();
  const list = Object.values(ranking.players || {});

  list.sort((a, b) => {
    if (b.highestStreak !== a.highestStreak) {
      return b.highestStreak - a.highestStreak;
    }
    return b.totalCorrect - a.totalCorrect;
  });

  return list.slice(0, limit);
}

// ==========================================
// GERADOR PROCEDURAL DE FALLBACK GARANTIDO
// ==========================================

function generateProceduralQuestion(diff) {
  const id = `math_proc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  if (diff === 'facil') {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 15) + 3;
    const ans = a * b;
    const wrongs = [ans + b, ans - a, ans + 10, ans - 5].filter((w) => w !== ans);
    const options = [ans, wrongs[0], wrongs[1], wrongs[2]].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(ans);

    return {
      id,
      difficulty: 'facil',
      pt: {
        question: `Um feitiço de duplicação multiplica ${a} gemas por ${b}. Qual é o total final de gemas obtidas?`,
        options: options.map((v) => `${v} gemas`),
        correctIndex,
        explanation: `Multiplicação direta: ${a} × ${b} = ${ans}.`,
      },
      en: {
        question: `A replication spell multiplies ${a} gems by ${b}. What is the final total of gems obtained?`,
        options: options.map((v) => `${v} gems`),
        correctIndex,
        explanation: `Direct multiplication: ${a} × ${b} = ${ans}.`,
      },
    };
  }

  if (diff === 'medio') {
    const r = Math.floor(Math.random() * 8) + 2;
    const n = Math.floor(Math.random() * 4) + 2;
    const ans = Math.pow(r, 2) + n * 10;
    const wrongs = [ans - 10, ans + 10, ans + 20, ans - 15];
    const options = [ans, wrongs[0], wrongs[1], wrongs[2]].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(ans);

    return {
      id,
      difficulty: 'medio',
      pt: {
        question: `Calcule o valor rúnico da expressão arcana: (${r})² + (${n} × 10).`,
        options: options.map((v) => String(v)),
        correctIndex,
        explanation: `(${r})² = ${Math.pow(r, 2)} e (${n} × 10) = ${n * 10}. Soma = ${ans}.`,
      },
      en: {
        question: `Calculate the runic value of the arcane expression: (${r})² + (${n} × 10).`,
        options: options.map((v) => String(v)),
        correctIndex,
        explanation: `(${r})² = ${Math.pow(r, 2)} and (${n} × 10) = ${n * 10}. Sum = ${ans}.`,
      },
    };
  }

  if (diff === 'dificil') {
    const p = Math.floor(Math.random() * 5) + 3;
    const q = p + 2;
    const ans = (p * q) - (p + q);
    const wrongs = [ans + p, ans - q, ans + 4, ans - 3];
    const options = [ans, wrongs[0], wrongs[1], wrongs[2]].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(ans);

    return {
      id,
      difficulty: 'dificil',
      pt: {
        question: `Se a e b são as raízes inteiras ${p} e ${q}, qual é o valor numérico de (a × b) - (a + b)?`,
        options: options.map((v) => String(v)),
        correctIndex,
        explanation: `a × b = ${p * q} e a + b = ${p + q}. Logo: ${p * q} - ${p + q} = ${ans}.`,
      },
      en: {
        question: `If a and b are integer roots ${p} and ${q}, what is the numerical value of (a × b) - (a + b)?`,
        options: options.map((v) => String(v)),
        correctIndex,
        explanation: `a × b = ${p * q} and a + b = ${p + q}. Therefore: ${p * q} - ${p + q} = ${ans}.`,
      },
    };
  }

  // Extremo
  const primes = [13, 17, 19, 23, 29, 31];
  const pChoice = primes[Math.floor(Math.random() * primes.length)];
  const ans = (pChoice - 1) / 2;
  const wrongs = [pChoice - 1, pChoice + 1, Math.floor(pChoice / 3), ans + 2];
  const options = [ans, wrongs[0], wrongs[1], wrongs[2]].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(ans);

  return {
    id,
    difficulty: 'extremo',
    pt: {
      question: `[Olimpíada] Pelo critério de Euler, quantos resíduos quadráticos existem no corpo primo Z/${pChoice}Z para os inteiros não nulos?`,
      options: options.map((v) => `${v} resíduos`),
      correctIndex,
      explanation: `Para o número primo ímpar ${pChoice}, existem exatamente (${pChoice} - 1) / 2 = ${ans} resíduos quadráticos.`,
    },
    en: {
      question: `[Olympiad] By Euler's criterion, how many non-zero quadratic residues exist in the finite field Z/${pChoice}Z?`,
      options: options.map((v) => `${v} residues`),
      correctIndex,
      explanation: `For odd prime ${pChoice}, exactly (${pChoice} - 1) / 2 = ${ans} non-zero quadratic residues exist.`,
    },
  };
}

// ==========================================
// INTEGRAÇÃO COM GROQ API & EXPANSÃO DO BANCO
// ==========================================

async function generateBatchQuestions(count = 10) {
  const apiKey = process.env.GROQ_API_KEY;
  const questionsToAdd = [];

  const difficultiesToMake = ['facil', 'medio', 'dificil', 'extremo'];

  if (apiKey) {
    try {
      const prompt = `Você é um grande mestre matemático e oráculo arcano do Discord.
Gere estritamente um JSON com exatamente ${count} questões matemáticas desafiadoras e divertidas divididas entre as 4 dificuldades:
- "facil" (aritmética, porcentagem, proporções mágicas rápidas)
- "medio" (álgebra, geometria, equações, combinatória básica)
- "dificil" (cálculo preliminar, matrizes, probabilidades, logaritmos)
- "extremo" (estilo Olimpíadas Mundiais de Matemática, IMO, Putnam, Teoria dos Números)

REGRAS ESTREITAS:
1. Retorne APENAS um objeto JSON com o formato:
{
  "questions": [
    {
      "difficulty": "facil" | "medio" | "dificil" | "extremo",
      "pt": {
        "question": "Enunciado em português",
        "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
        "correctIndex": 0,
        "explanation": "Explicação matemática clara e concisa"
      },
      "en": {
        "question": "Question statement in English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Clear mathematical explanation"
      }
    }
  ]
}
2. Cada pergunta deve ter exatamente 4 opções ("A", "B", "C", "D") e "correctIndex" deve ser um número inteiro de 0 a 3 indicando a opção correta.
3. Não use blocos de código markdown nem texto fora do JSON.`;

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 2800,
          response_format: { type: 'json_object' },
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'You are an expert mathematical competition author. Output valid JSON strictly matching the user schema.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.questions)) {
            for (const q of parsed.questions) {
              if (q.pt?.question && Array.isArray(q.pt.options) && q.pt.options.length === 4) {
                const diff = difficultiesToMake.includes(q.difficulty) ? q.difficulty : 'medio';
                questionsToAdd.push({
                  id: `math_groq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  difficulty: diff,
                  pt: q.pt,
                  en: q.en || q.pt,
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[ArcaneMath] Groq API falhou, acionando gerador procedural de fallback:', err.message);
    }
  }

  // Preenche com o gerador procedural se Groq gerou menos do que o desejado
  while (questionsToAdd.length < count) {
    const diff = difficultiesToMake[questionsToAdd.length % difficultiesToMake.length];
    questionsToAdd.push(generateProceduralQuestion(diff));
  }

  // Insere no banco atômico
  const data = getQuestionsData();
  for (const q of questionsToAdd) {
    if (!data.questions[q.difficulty]) {
      data.questions[q.difficulty] = [];
    }
    data.questions[q.difficulty].push(q);
  }

  data.meta.totalQuestions = (data.questions.facil?.length || 0) +
    (data.questions.medio?.length || 0) +
    (data.questions.dificil?.length || 0) +
    (data.questions.extremo?.length || 0);

  data.meta.counts = {
    facil: data.questions.facil?.length || 0,
    medio: data.questions.medio?.length || 0,
    dificil: data.questions.dificil?.length || 0,
    extremo: data.questions.extremo?.length || 0,
  };
  data.meta.lastGeneratedAt = Date.now();

  writeJsonAtomic(QUESTIONS_FILE, data);
  console.log(`✨ [ArcaneMath] Grimório expandido! +${questionsToAdd.length} novas questões salvas (Total: ${data.meta.totalQuestions}).`);
  return questionsToAdd;
}

module.exports = {
  getGrimoireStats,
  getDifficultyForStreak,
  getRandomQuestion,
  recordUserAnswer,
  getMathRanking,
  generateBatchQuestions,
};
