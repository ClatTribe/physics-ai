import { Topic } from './types'

export const mathQuestions: Topic[] = [
  {
    id: 'math-001-quadratic',
    title: 'Quadratic Equations - Sum and Product of Roots',
    titleHi: 'द्विघात समीकरण - मूलों का योग और गुणनफल',
    icon: '📐',
    color: '#f44336',
    exam: 'JEE Mains',
    subject: 'Mathematics',
    difficulty: 'Easy',
    chapter: 'Quadratic Equations',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Find the sum and product of roots of the equation: x² - 5x + 6 = 0',
        speech: 'Dekho, humara quadratic equation hai x² - 5x + 6 = 0. Isme humne sum aur product of roots nikalna hai. Maths ka maza lete hain!',
        highlight: true
      },
      {
        label: 'General Form',
        math: 'ax^2 + bx + c = 0',
        speech: 'Standard form mein likha jaata hai ax² + bx + c = 0. Humara case mein a = 1, b = -5, aur c = 6 hai.',
        highlight: true
      },
      {
        label: 'Formula for Sum of Roots',
        math: '\\text{Sum of roots} = -\\frac{b}{a} = -\\frac{(-5)}{1} = 5',
        speech: 'Sum of roots ka formula hota hai minus b by a. Toh hum likhe -(-5)/1 jo hai 5. Bahut simple na!'
      },
      {
        label: 'Formula for Product of Roots',
        math: '\\text{Product of roots} = \\frac{c}{a} = \\frac{6}{1} = 6',
        speech: 'Ab product of roots nikalne ke liye formula hota hai c by a. Toh c/a = 6/1 = 6. Yeh bhi ho gaya!'
      },
      {
        label: 'Verification',
        math: '(x-2)(x-3) = 0 \\Rightarrow x = 2 \\text{ or } 3',
        speech: 'Verify karne ke liye factorize karte hain. x² - 5x + 6 ko likhe (x-2)(x-3). Toh roots hain 2 aur 3. Sum = 2+3 = 5, Product = 2×3 = 6. Perfect match!'
      },
      {
        label: 'Final Answer',
        math: '\\text{Sum} = 5, \\text{Product} = 6',
        speech: 'Toh humara final answer hai sum of roots = 5 aur product of roots = 6. Ye JEE Mains mein guaranteed aata hai!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-002-ap-gp',
    title: 'Sequences & Series - Sum of AP/GP',
    titleHi: 'अनुक्रम और श्रेणी - AP/GP का योग',
    icon: '∑',
    color: '#e91e63',
    exam: 'JEE Mains',
    subject: 'Mathematics',
    difficulty: 'Medium',
    chapter: 'Sequences and Series',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Find the sum of the first 10 terms of the AP: 2, 5, 8, 11, ...',
        speech: 'Bhaiyon, ek arithmetic progression hai: 2, 5, 8, 11, ... Isme humne first 10 terms ka sum nikalna hai. Dekho, har term mein 3 ka difference hai.',
        highlight: true
      },
      {
        label: 'Identify AP Parameters',
        math: 'a = 2, d = 5 - 2 = 3, n = 10',
        speech: 'First term a = 2, common difference d = 3, aur number of terms n = 10. AP ka structure samajh gaye?'
      },
      {
        label: 'nth Term Formula',
        math: 'a_n = a + (n-1)d = 2 + (10-1) \\times 3 = 2 + 27 = 29',
        speech: 'nth term nikalne ke liye formula use karte hain: a_n = a + (n-1)d. Toh a_10 = 2 + 9×3 = 29.'
      },
      {
        label: 'Sum Formula',
        math: 'S_n = \\frac{n}{2}(a + a_n) = \\frac{10}{2}(2 + 29) = 5 \\times 31 = 155',
        speech: 'Sum of n terms ka formula hota hai S_n = n/2 × (first term + last term). Toh S_10 = 10/2 × (2 + 29) = 5 × 31.'
      },
      {
        label: 'Alternative Method',
        math: 'S_n = \\frac{n}{2}[2a + (n-1)d] = \\frac{10}{2}[2(2) + 9(3)] = 5[4 + 27] = 5 \\times 31 = 155',
        speech: 'Ya phir dusra formula use kar sakte hain: S_n = n/2 × [2a + (n-1)d]. Dono se same answer milta hai!'
      },
      {
        label: 'Final Answer',
        math: 'S_{10} = 155',
        speech: 'Toh pehle 10 terms ka sum = 155. Bahut easy question tha na! Sum of AP always important hota hai.',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-003-cramer-rule',
    title: 'Matrices & Determinants - Cramer\'s Rule',
    titleHi: 'आव्यूह और सारणिक - क्रेमर का नियम',
    icon: '📊',
    color: '#9c27b0',
    exam: 'JEE Mains',
    subject: 'Mathematics',
    difficulty: 'Medium',
    chapter: 'Matrices and Determinants',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Solve using Cramer\'s Rule: 2x + 3y = 8 and 3x + 2y = 7',
        speech: 'Dekho, humara system of equations hai 2x + 3y = 8 aur 3x + 2y = 7. Isko Cramer\'s rule se solve karenge.',
        highlight: true
      },
      {
        label: 'Write in Matrix Form',
        math: '\\begin{bmatrix} 2 & 3 \\\\ 3 & 2 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 8 \\\\ 7 \\end{bmatrix}',
        speech: 'Matrix form mein likha jaata hai. A = [[2, 3], [3, 2]] aur B = [8, 7]. Ab determinant calculate karenge.'
      },
      {
        label: 'Calculate Determinant of A',
        math: '\\Delta = \\begin{vmatrix} 2 & 3 \\\\ 3 & 2 \\end{vmatrix} = 2(2) - 3(3) = 4 - 9 = -5',
        speech: 'Determinant nikalne ke liye formula: ad - bc. Toh 2×2 - 3×3 = 4 - 9 = -5. Ye main determinant hai.'
      },
      {
        label: 'Calculate Δx and Δy',
        math: '\\Delta_x = \\begin{vmatrix} 8 & 3 \\\\ 7 & 2 \\end{vmatrix} = 8(2) - 3(7) = 16 - 21 = -5',
        math2: '\\Delta_y = \\begin{vmatrix} 2 & 8 \\\\ 3 & 7 \\end{vmatrix} = 2(7) - 8(3) = 14 - 24 = -10',
        speech: 'Δx mein first column replace karte hain B se. Δy mein second column replace karte hain. Δx = -5, Δy = -10.'
      },
      {
        label: 'Apply Cramer\'s Rule',
        math: 'x = \\frac{\\Delta_x}{\\Delta} = \\frac{-5}{-5} = 1',
        math2: 'y = \\frac{\\Delta_y}{\\Delta} = \\frac{-10}{-5} = 2',
        speech: 'Cramer\'s rule ke hisaab se x = Δx/Δ = 1 aur y = Δy/Δ = 2. Solution mil gaya!'
      },
      {
        label: 'Final Answer',
        math: 'x = 1, y = 2',
        speech: 'Verification: 2(1) + 3(2) = 8 ✓ aur 3(1) + 2(2) = 7 ✓. Cramer\'s rule mein determinant concept bahut important hai!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-004-limits',
    title: 'Limits - L\'Hôpital\'s Rule',
    titleHi: 'सीमा - लॉपिटल का नियम',
    icon: '∫',
    color: '#673ab7',
    exam: 'JEE Mains',
    subject: 'Mathematics',
    difficulty: 'Easy',
    chapter: 'Limits',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Evaluate: lim(x→2) (x² - 4)/(x - 2)',
        speech: 'Bhaiyon, humara limit hai x tends to 2 of (x² - 4)/(x - 2). Direct substitution mein 0/0 form aayega, toh L\'Hôpital\'s rule use karenge.',
        highlight: true
      },
      {
        label: 'Check Indeterminate Form',
        math: '\\text{At } x = 2: \\frac{2^2 - 4}{2 - 2} = \\frac{0}{0}',
        speech: 'Direct substitute karne se 0/0 form aata hai, jo indeterminate hai. Toh L\'Hôpital\'s rule apply kar sakte hain.'
      },
      {
        label: 'L\'Hôpital\'s Rule',
        math: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{\\frac{d}{dx}(x^2 - 4)}{\\frac{d}{dx}(x - 2)}',
        speech: 'L\'Hôpital\'s rule mein numerator aur denominator dono ko differentiate karte hain alag-alag.'
      },
      {
        label: 'Differentiate',
        math: '= \\lim_{x \\to 2} \\frac{2x}{1}',
        speech: 'Numerator ka derivative: 2x. Denominator ka derivative: 1. Toh limit ban jaata hai 2x/1.'
      },
      {
        label: 'Substitute Limit',
        math: '= \\frac{2(2)}{1} = \\frac{4}{1} = 4',
        speech: 'Ab x = 2 substitute karte hain: 2(2)/1 = 4. Answer mil gaya!'
      },
      {
        label: 'Final Answer',
        math: '\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = 4',
        speech: 'Verification se: (x-2)(x+2)/(x-2) = x+2 = 4 when x=2. L\'Hôpital\'s rule bahut useful hai indeterminate forms ke liye!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-005-maxima-minima',
    title: 'Differentiation - Maxima & Minima Application',
    titleHi: 'अवकलन - उच्चतम और न्यूनतम अनुप्रयोग',
    icon: '📈',
    color: '#3f51b5',
    exam: 'JEE Advanced',
    subject: 'Mathematics',
    difficulty: 'Medium',
    chapter: 'Differentiation',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Find the maximum value of: f(x) = 3x⁴ - 4x³ - 12x² + 5',
        speech: 'Dekho, ek function hai f(x) = 3x⁴ - 4x³ - 12x² + 5. Iska maximum value nikalna hai. Differentiate karo pehle!',
        highlight: true
      },
      {
        label: 'First Derivative',
        math: 'f\'(x) = 12x^3 - 12x^2 - 24x = 12x(x^2 - x - 2)',
        speech: 'f(x) ko differentiate karte hain: f\'(x) = 12x³ - 12x² - 24x. Factor karte hain: 12x(x² - x - 2).'
      },
      {
        label: 'Find Critical Points',
        math: 'f\'(x) = 0 \\Rightarrow 12x(x^2 - x - 2) = 0',
        math2: 'x^2 - x - 2 = (x-2)(x+1) = 0',
        math3: 'x = 0, x = 2, x = -1',
        speech: 'Critical points ke liye f\'(x) = 0 set karte hain. Toh x = 0, x = 2, x = -1. Teeno points check karenge!'
      },
      {
        label: 'Second Derivative Test',
        math: 'f\'\'(x) = 36x^2 - 24x - 24',
        speech: 'Second derivative test se determine karenge ki kaun maxima hai aur kaun minima. f\'\'(x) = 36x² - 24x - 24.'
      },
      {
        label: 'Evaluate at Critical Points',
        math: 'f(0) = 5',
        math2: 'f(2) = 3(16) - 4(8) - 12(4) + 5 = 48 - 32 - 48 + 5 = -27',
        math3: 'f(-1) = 3(1) - 4(-1) - 12(1) + 5 = 3 + 4 - 12 + 5 = 0',
        speech: 'Sabhi critical points par function ki value calculate karte hain. f(0) = 5, f(2) = -27, f(-1) = 0.'
      },
      {
        label: 'Final Answer',
        math: '\\text{Maximum value} = 5 \\text{ at } x = 0',
        speech: 'Sabse badi value 5 hai jo x = 0 par hai. Toh maximum value of function = 5. Maxima-minima problems bahut important hain JEE Advanced mein!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-006-integration-parts',
    title: 'Integration - Integration by Parts (Definite)',
    titleHi: 'समाकलन - भागों द्वारा समाकलन (निश्चित)',
    icon: '∫',
    color: '#2196f3',
    exam: 'JEE Advanced',
    subject: 'Mathematics',
    difficulty: 'Hard',
    chapter: 'Integration',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Evaluate: ∫₀¹ x·eˣ dx',
        speech: 'Maths ka maza lete hain! Humara definite integral hai ∫₀¹ x·eˣ dx. Integration by parts use karenge kyunki product hai.',
        highlight: true
      },
      {
        label: 'Integration by Parts Formula',
        math: '\\int u \\, dv = uv - \\int v \\, du',
        speech: 'Integration by parts ka formula: ∫u dv = uv - ∫v du. Humne u aur dv select karna hai smartly.'
      },
      {
        label: 'Choose u and dv',
        math: 'u = x, \\quad dv = e^x \\, dx',
        math2: 'du = dx, \\quad v = e^x',
        speech: 'u = x (kyunki differentiate karte hain easy) aur dv = eˣ dx. Toh du = dx aur v = eˣ.'
      },
      {
        label: 'Apply Formula',
        math: '\\int x e^x \\, dx = x e^x - \\int e^x \\, dx = x e^x - e^x = e^x(x - 1)',
        speech: 'Formula lagao: ∫x·eˣ dx = x·eˣ - ∫eˣ dx = x·eˣ - eˣ = eˣ(x - 1). Antiderivative mil gaya!'
      },
      {
        label: 'Apply Limits',
        math: '\\left[ e^x(x-1) \\right]_0^1 = e^1(1-1) - e^0(0-1)',
        math2: '= e(0) - 1(-1) = 0 + 1 = 1',
        speech: 'Ab limits apply karte hain 0 se 1 tak. Upper limit: e¹(1-1) = 0. Lower limit: e⁰(0-1) = -1. Difference = 0 - (-1) = 1.'
      },
      {
        label: 'Final Answer',
        math: '\\int_0^1 x e^x \\, dx = 1',
        speech: 'Toh humara answer hai 1. Integration by parts bilkul zaroori hai JEE Advanced mein. Ye ekdum popular question hai!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-007-differential-ode',
    title: 'Differential Equations - First Order Linear ODE',
    titleHi: 'अवकल समीकरण - प्रथम कोटि रैखिक ODE',
    icon: '🔢',
    color: '#009688',
    exam: 'JEE Advanced',
    subject: 'Mathematics',
    difficulty: 'Hard',
    chapter: 'Differential Equations',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Solve: dy/dx + 2y = 4, with y(0) = 1',
        speech: 'Bhaiyon, ek first-order linear differential equation hai dy/dx + 2y = 4 with initial condition y(0) = 1. Integrating factor use karenge!',
        highlight: true
      },
      {
        label: 'Identify Standard Form',
        math: '\\frac{dy}{dx} + P(x)y = Q(x)',
        math2: 'P(x) = 2, \\quad Q(x) = 4',
        speech: 'Standard form mein P(x) = 2 aur Q(x) = 4. Integrating factor method se solve karenge.'
      },
      {
        label: 'Find Integrating Factor',
        math: 'I.F. = e^{\\int P(x) \\, dx} = e^{\\int 2 \\, dx} = e^{2x}',
        speech: 'Integrating factor = e^(∫P dx) = e^(∫2 dx) = e^(2x). Yeh magical factor hai jo equation ko easy kar deta hai!'
      },
      {
        label: 'Multiply by Integrating Factor',
        math: 'e^{2x} \\frac{dy}{dx} + 2e^{2x}y = 4e^{2x}',
        math2: '\\frac{d}{dx}(e^{2x} y) = 4e^{2x}',
        speech: 'Pure equation ko e^(2x) se multiply karte hain. Left side ban jata hai d/dx(e^(2x)·y).'
      },
      {
        label: 'Integrate Both Sides',
        math: 'e^{2x} y = \\int 4e^{2x} \\, dx = 4 \\cdot \\frac{e^{2x}}{2} + C = 2e^{2x} + C',
        math2: 'y = 2 + Ce^{-2x}',
        speech: 'Dono sides integrate karte hain. Right side mein ∫4e^(2x) dx = 2e^(2x) + C. Toh y = 2 + Ce^(-2x).'
      },
      {
        label: 'Apply Initial Condition',
        math: 'y(0) = 1 \\Rightarrow 1 = 2 + Ce^0 \\Rightarrow 1 = 2 + C \\Rightarrow C = -1',
        math2: '\\text{Solution: } y = 2 - e^{-2x}',
        speech: 'Initial condition y(0) = 1 lagao: 1 = 2 + C, toh C = -1. Final solution: y = 2 - e^(-2x). Differential equations bahut important hai!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-008-bayes-theorem',
    title: 'Probability - Bayes\' Theorem',
    titleHi: 'प्रायिकता - बेयस प्रमेय',
    icon: '🎲',
    color: '#4caf50',
    exam: 'JEE Mains',
    subject: 'Mathematics',
    difficulty: 'Medium',
    chapter: 'Probability',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A bag has 3 red and 2 blue balls. Two balls drawn without replacement. Find P(1st red | 2nd red)',
        speech: 'Dekho, ek bag mein 3 red aur 2 blue balls hain. Do balls nikale jate hain without replacement. Humne P(1st red | 2nd red) nikalna hai using Bayes\' theorem!',
        highlight: true
      },
      {
        label: 'Bayes\' Theorem',
        math: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}',
        speech: 'Bayes\' theorem kehta hai P(A|B) = P(B|A)·P(A) / P(B). A = 1st red, B = 2nd red.'
      },
      {
        label: 'Calculate P(1st Red)',
        math: 'P(\\text{1st Red}) = \\frac{3}{5}',
        math2: 'P(\\text{1st Blue}) = \\frac{2}{5}',
        speech: 'First ball red hone ki probability = 3/5. First ball blue hone ki = 2/5. Easy hai!'
      },
      {
        label: 'Calculate P(2nd Red | 1st Red)',
        math: 'P(\\text{2nd Red}|\\text{1st Red}) = \\frac{2}{4} = \\frac{1}{2}',
        math2: 'P(\\text{2nd Red}|\\text{1st Blue}) = \\frac{3}{4}',
        speech: 'Agar 1st red hai, toh 4 balls baaki hain aur 2 red hain. P = 2/4. Agar 1st blue hai, toh 3 red baaki hain. P = 3/4.'
      },
      {
        label: 'Calculate P(2nd Red) using Law of Total Probability',
        math: 'P(\\text{2nd Red}) = P(\\text{2nd Red}|\\text{1st Red}) \\cdot P(\\text{1st Red}) + P(\\text{2nd Red}|\\text{1st Blue}) \\cdot P(\\text{1st Blue})',
        math2: '= \\frac{1}{2} \\cdot \\frac{3}{5} + \\frac{3}{4} \\cdot \\frac{2}{5} = \\frac{3}{10} + \\frac{6}{20} = \\frac{3}{10} + \\frac{3}{10} = \\frac{6}{10} = \\frac{3}{5}',
        speech: 'Law of total probability se: P(2nd Red) = 1/2 × 3/5 + 3/4 × 2/5 = 3/10 + 3/10 = 3/5.'
      },
      {
        label: 'Apply Bayes\' Theorem',
        math: 'P(\\text{1st Red}|\\text{2nd Red}) = \\frac{P(\\text{2nd Red}|\\text{1st Red}) \\cdot P(\\text{1st Red})}{P(\\text{2nd Red})}',
        math2: '= \\frac{\\frac{1}{2} \\cdot \\frac{3}{5}}{\\frac{3}{5}} = \\frac{1}{2}',
        speech: 'Bayes theorem apply karte hain: P(1st Red|2nd Red) = (1/2 × 3/5) / (3/5) = 1/2. Answer ready ho gaya!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-009-distance-point-line',
    title: 'Coordinate Geometry - Distance Between Point and Line',
    titleHi: 'निर्देशांक ज्यामिति - बिंदु और रेखा के बीच दूरी',
    icon: '📐',
    color: '#ff9800',
    exam: 'JEE Mains',
    subject: 'Mathematics',
    difficulty: 'Easy',
    chapter: 'Coordinate Geometry',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Find the distance from point (3, 4) to the line 3x - 4y + 5 = 0',
        speech: 'Maths ka maza lete hain! Point (3, 4) se line 3x - 4y + 5 = 0 tak ki distance nikalni hai. Formula use karenge!',
        highlight: true
      },
      {
        label: 'Distance Formula',
        math: 'd = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}',
        speech: 'Distance formula: d = |ax₀ + by₀ + c| / √(a² + b²). Line ax + by + c = 0 aur point (x₀, y₀) se hai.'
      },
      {
        label: 'Identify Parameters',
        math: 'a = 3, b = -4, c = 5',
        math2: '(x_0, y_0) = (3, 4)',
        speech: 'Line equation mein a = 3, b = -4, c = 5. Point ke coordinates x₀ = 3, y₀ = 4.'
      },
      {
        label: 'Substitute in Numerator',
        math: '|ax_0 + by_0 + c| = |3(3) + (-4)(4) + 5| = |9 - 16 + 5| = |-2| = 2',
        speech: 'Numerator: |3×3 + (-4)×4 + 5| = |9 - 16 + 5| = |-2| = 2. Easy calculation!'
      },
      {
        label: 'Calculate Denominator',
        math: '\\sqrt{a^2 + b^2} = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5',
        speech: 'Denominator: √(3² + (-4)²) = √(9 + 16) = √25 = 5. Pythagoras theorem ka use!'
      },
      {
        label: 'Final Answer',
        math: 'd = \\frac{2}{5} = 0.4',
        speech: 'Distance = 2/5 = 0.4 units. Simple na! Point to line distance formula bahut useful hai geometry problems mein. JEE Mains mein pakka aata hai!',
        isAnswer: true,
        highlight: true
      }
    ]
  },

  {
    id: 'math-010-skew-lines',
    title: 'Vectors & 3D - Shortest Distance Between Skew Lines',
    titleHi: 'सदिश और 3D - तिरछी रेखाओं के बीच न्यूनतम दूरी',
    icon: '✏️',
    color: '#795548',
    exam: 'JEE Advanced',
    subject: 'Mathematics',
    difficulty: 'Medium',
    chapter: 'Vectors and 3D Geometry',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Find the shortest distance between lines: L₁: r⃗ = (1,0,0) + t(1,1,1) and L₂: r⃗ = (0,1,0) + s(0,1,1)',
        speech: 'Dekho, humara ek complex problem hai! Do skew lines hain aur humne inke beech minimum distance nikalni hai. 3D geometry mein ye bahut important hai!',
        highlight: true
      },
      {
        label: 'Identify Line Parameters',
        math: '\\text{L}_1: a_1 = (1,0,0), b_1 = (1,1,1)',
        math2: '\\text{L}_2: a_2 = (0,1,0), b_2 = (0,1,1)',
        speech: 'Line 1 point: (1,0,0), direction: (1,1,1). Line 2 point: (0,1,0), direction: (0,1,1). Ye parameters samajh lo pehle!'
      },
      {
        label: 'Calculate Position Vector Difference',
        math: 'a_2 - a_1 = (0,1,0) - (1,0,0) = (-1, 1, 0)',
        speech: 'Dono lines ke starting points mein difference: (0,1,0) - (1,0,0) = (-1, 1, 0).'
      },
      {
        label: 'Cross Product b₁ × b₂',
        math: 'b_1 \\times b_2 = \\begin{vmatrix} i & j & k \\\\ 1 & 1 & 1 \\\\ 0 & 1 & 1 \\end{vmatrix} = (1-1)i - (1-0)j + (1-0)k = (0, -1, 1)',
        speech: 'Cross product nikaal lo: b₁ × b₂ = (0, -1, 1). Ye direction perpendicular hota hai dono lines ke.',
        highlight: true
      },
      {
        label: 'Calculate Magnitude',
        math: '|b_1 \\times b_2| = \\sqrt{0^2 + (-1)^2 + 1^2} = \\sqrt{2}',
        speech: 'Magnitude = √(0² + 1² + 1²) = √2. Ye denominator mein jayega!'
      },
      {
        label: 'Apply Shortest Distance Formula',
        math: 'd = \\frac{|(a_2 - a_1) \\cdot (b_1 \\times b_2)|}{|b_1 \\times b_2|}',
        math2: '= \\frac{|(-1, 1, 0) \\cdot (0, -1, 1)|}{\\sqrt{2}} = \\frac{|0 - 1 + 0|}{\\sqrt{2}} = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}',
        speech: 'Formula: d = |(a₂-a₁)·(b₁×b₂)| / |b₁×b₂|. Dot product: (-1)×0 + 1×(-1) + 0×1 = -1. Distance = 1/√2 = √2/2!'
      },
      {
        label: 'Final Answer',
        math: 'd = \\frac{\\sqrt{2}}{2} \\approx 0.707',
        speech: 'Shortest distance between skew lines = √2/2 units. Ye bahut interesting topic hai na! 3D geometry aur vectors bilkul zaroori hai JEE Advanced ke liye. Ye ekdum guaranteed aata hai!',
        isAnswer: true,
        highlight: true
      }
    ]
  }
]
