export interface Step {
  label: string
  text?: string
  math?: string
  math2?: string
  math3?: string
  speech: string        // Hinglish narration
  highlight?: boolean
  isAnswer?: boolean
}

export interface Topic {
  id: string
  title: string
  titleHi: string       // Hindi subtitle
  icon: string
  color: string
  exam: 'JEE' | 'NEET'
  steps: Step[]
}

export const topics: Topic[] = [
  {
    id: 'kinematics',
    title: 'Projectile Motion',
    titleHi: 'प्रक्षेप्य गति — JEE 2024 Pattern',
    icon: '🎯',
    color: '#6c63ff',
    exam: 'JEE',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A ball is thrown from the top of a building of height 20m at an angle of 30° above the horizontal with initial velocity 20 m/s. Find the time of flight, maximum height from ground, and horizontal range.',
        speech: 'Chaliye shuru karte hain ek classic JEE projectile motion problem se. Ek ball ko 20 meter oonchi building se 30 degree ke angle pe throw kiya gaya hai, initial velocity 20 meter per second ke saath. Humein time of flight, maximum height from ground, aur horizontal range nikalni hai. Toh sabse pehle components resolve karte hain.',
      },
      {
        label: 'Step 1 — Components Resolve करो',
        text: 'Resolve initial velocity into horizontal and vertical components:',
        math: 'u_x = u\\cos\\theta = 20\\cos 30° = 10\\sqrt{3} \\text{ m/s}',
        math2: 'u_y = u\\sin\\theta = 20\\sin 30° = 10 \\text{ m/s}',
        speech: 'Sabse pehle velocity ke components nikalte hain. Horizontal component u x equals u cos theta, yaani 20 times cos 30 degrees, jo hota hai 10 root 3 meters per second. Vertical component u y equals u sin theta, yaani 20 times sin 30, jo hai 10 meters per second. Ye bahut important step hai — JEE mein yahan se galti hoti hai.',
      },
      {
        label: 'Step 2 — Time of Flight',
        text: 'Using vertical displacement equation (taking upward +ve):',
        math: '-20 = 10t - \\frac{1}{2}(10)t^2',
        math2: '5t^2 - 10t - 20 = 0 \\implies t^2 - 2t - 4 = 0',
        speech: 'Ab time of flight ke liye. Ball 20 meter upar se giri hai, toh displacement minus 20 hai downward. Equation lagao: minus 20 equals u y t minus half g t squared. Simplify karo toh milta hai t squared minus 2t minus 4 equals zero. Ye ek quadratic equation hai.',
      },
      {
        label: 'Step 3 — Quadratic Solve करो',
        text: 'Taking the positive root:',
        math: 't = \\frac{2 + \\sqrt{4+16}}{2} = 1 + \\sqrt{5} \\approx 3.24 \\text{ s}',
        speech: 'Quadratic formula lagao — t equals 2 plus root 20, divided by 2. Yaani 1 plus root 5, approximately 3.24 seconds. Hamesha positive root lo — time negative nahi ho sakta! Ye ek common mistake hai JEE mein.',
        highlight: true,
      },
      {
        label: 'Step 4 — Maximum Height',
        text: 'At maximum height, vertical velocity = 0:',
        math: 't_{max} = \\frac{u_y}{g} = \\frac{10}{10} = 1\\text{ s}',
        math2: 'H_{above} = \\frac{u_y^2}{2g} = \\frac{100}{20} = 5\\text{ m}',
        math3: 'H_{total} = 20 + 5 = 25 \\text{ m from ground}',
        speech: 'Maximum height ke liye — jab vertical velocity zero ho jaati hai tab ball sabse upar hoti hai. t max equals u y by g equals 1 second. Height gained above building equals u y squared by 2g equals 5 meters. Total maximum height from ground equals 20 plus 5 equals 25 meters!',
      },
      {
        label: 'Step 5 — Horizontal Range',
        text: 'No horizontal acceleration:',
        math: 'R = u_x \\times t = 10\\sqrt{3} \\times 3.24 \\approx 56.1 \\text{ m}',
        speech: 'Finally horizontal range. Horizontally koi acceleration nahi hai, toh R equals u x times total time of flight. 10 root 3 times 3.24, approximately 56.1 meters. Simple!',
      },
      {
        label: 'Final Answer ✓',
        isAnswer: true,
        math: '\\boxed{t \\approx 3.24\\text{ s},\\; H_{max} = 25\\text{ m},\\; R \\approx 56.1\\text{ m}}',
        speech: 'Toh final answer hai — time of flight approximately 3.24 seconds, maximum height 25 meters from ground, aur horizontal range approximately 56.1 meters. Ye JEE ka ek very common pattern hai — hamesha building ki height add karna mat bhoolna! Koi doubt ho toh neeche type karo.',
      },
    ],
  },
  {
    id: 'newton',
    title: "Newton's Laws — Pulley System",
    titleHi: 'न्यूटन के नियम — पुली सिस्टम (JEE Advanced)',
    icon: '⚖️',
    color: '#ff9100',
    exam: 'JEE',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Two blocks of masses m₁ = 5 kg and m₂ = 3 kg are connected by a light inextensible string passing over a smooth pulley. Find the acceleration and tension. (g = 10 m/s²)',
        speech: 'Ab ek Atwood machine problem solve karte hain. Do blocks hain — m1 is 5 kg aur m2 is 3 kg. Dono ek light inextensible string se connected hain jo ek smooth pulley se guzarti hai. Humein acceleration aur tension nikalni hai.',
      },
      {
        label: 'Step 1 — Free Body Diagram बनाओ',
        text: 'For m₁ (heavier, moves down): mg↓, T↑\nFor m₂ (lighter, moves up): mg↓, T↑',
        speech: 'Sabse pehle free body diagram banao — ye JEE ka golden rule hai. m1 bhaari hai toh neeche jayega — uske upar tension T hai aur neeche weight m1 g. m2 halka hai toh upar jayega — uske upar tension T aur neeche weight m2 g. Dono blocks ki acceleration same hogi kyunki string inextensible hai.',
      },
      {
        label: 'Step 2 — Equations of Motion',
        text: "Newton's second law for each block:",
        math: 'm_1 g - T = m_1 a \\quad \\text{...(i)}',
        math2: 'T - m_2 g = m_2 a \\quad \\text{...(ii)}',
        speech: 'Newton ka second law lagao dono blocks pe. Block m1 ke liye jo neeche ja raha hai: m1 g minus T equals m1 a. Block m2 ke liye jo upar ja raha hai: T minus m2 g equals m2 a. Dono equations add karo toh T cancel ho jayega.',
      },
      {
        label: 'Step 3 — Acceleration निकालो',
        text: 'Adding equations (i) and (ii):',
        math: 'a = \\frac{(m_1 - m_2)g}{m_1 + m_2} = \\frac{(5-3) \\times 10}{5+3} = \\frac{20}{8} = 2.5 \\text{ m/s}^2',
        speech: 'Dono equations add karo — T cancel ho jaata hai. Milta hai: a equals m1 minus m2 into g, divided by m1 plus m2. Values dalo: 5 minus 3 into 10, divided by 8. That gives us 2.5 meters per second squared. Ye formula yaad rakhna — har saal JEE mein aata hai!',
        highlight: true,
      },
      {
        label: 'Step 4 — Tension निकालो',
        text: 'Substitute back:',
        math: 'T = m_2(g + a) = 3(10 + 2.5) = 37.5 \\text{ N}',
        math2: '\\text{Verify: } T = m_1(g-a) = 5(10-2.5) = 37.5 \\text{ N} \\; ✓',
        speech: 'Ab tension nikalte hain. Equation 2 mein a ki value dalo: T equals m2 times g plus a, yaani 3 times 12.5, equals 37.5 Newtons. Verify karo equation 1 se: 5 times 7.5 bhi 37.5 Newtons hi aata hai. Dono match kar rahe hain — perfect!',
      },
      {
        label: 'Final Answer ✓',
        isAnswer: true,
        math: '\\boxed{a = 2.5 \\text{ m/s}^2, \\quad T = 37.5 \\text{ N}}',
        speech: 'Final answer: acceleration 2.5 meters per second squared, tension 37.5 Newtons. Is formula ko yaad rakho — m1 minus m2 by m1 plus m2 into g. JEE mein lagbhag har saal ek pulley question aata hai. Koi doubt? Neeche pooch lo!',
      },
    ],
  },
  {
    id: 'electrostatics',
    title: "Gauss's Law — Electric Field",
    titleHi: 'गॉस का नियम — विद्युत क्षेत्र (JEE Advanced)',
    icon: '⚡',
    color: '#00e676',
    exam: 'JEE',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A solid non-conducting sphere of radius R has uniform volume charge density ρ. Find the electric field at (a) r < R (inside) and (b) r > R (outside) using Gauss\'s Law.',
        speech: 'Ye ek bahut important Gauss Law ka problem hai — JEE Advanced mein baar baar aata hai. Ek solid non-conducting sphere hai radius R ki, jismein uniformly charge distributed hai density rho ke saath. Electric field nikalna hai andar aur bahar dono jagah.',
      },
      {
        label: 'Step 1 — Total Charge',
        math: 'Q = \\rho \\cdot \\frac{4}{3}\\pi R^3',
        speech: 'Pehle total charge nikalo: Q equals rho times sphere ka volume, yaani rho times 4 by 3 pi R cube.',
      },
      {
        label: 'Step 2 — Inside (r < R)',
        text: 'Gaussian surface: concentric sphere of radius r',
        math: '\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enc}}{\\epsilon_0}',
        math2: 'E \\cdot 4\\pi r^2 = \\frac{\\rho \\cdot \\frac{4}{3}\\pi r^3}{\\epsilon_0}',
        speech: 'Andar ke liye Gaussian surface lo — ek concentric sphere radius r ki. Symmetry se E constant hai is surface pe. Gauss law lagao: E times 4 pi r squared equals enclosed charge divided by epsilon naught. Enclosed charge hoga rho times 4 by 3 pi r cube.',
      },
      {
        label: 'Step 3 — E Inside (Result)',
        math: 'E_{inside} = \\frac{\\rho \\, r}{3\\epsilon_0} \\quad (r < R)',
        speech: 'Simplify karo toh milta hai: E inside equals rho r by 3 epsilon naught. Dekho — E linearly increase hota hai r ke saath andar! Centre pe r equals zero, toh E bhi zero. Ye bahut important concept hai.',
        highlight: true,
      },
      {
        label: 'Step 4 — Outside (r > R)',
        math: 'E_{outside} = \\frac{\\rho R^3}{3\\epsilon_0 r^2} = \\frac{Q}{4\\pi\\epsilon_0 r^2} \\quad (r > R)',
        speech: 'Bahar ke liye — ab poora charge Q enclosed hai. E times 4 pi r squared equals Q by epsilon naught. Toh E outside equals rho R cube by 3 epsilon naught r squared. Ye exactly point charge jaisa behave karta hai! Bahar se dekho toh lagta hai saara charge centre pe hai.',
        highlight: true,
      },
      {
        label: 'Final Answer ✓',
        isAnswer: true,
        math: '\\boxed{E = \\begin{cases} \\dfrac{\\rho r}{3\\epsilon_0} & r < R \\\\[8pt] \\dfrac{\\rho R^3}{3\\epsilon_0 r^2} & r > R \\end{cases}}',
        speech: 'Final answer: Andar E equals rho r by 3 epsilon naught — linearly increases. Bahar E equals rho R cube by 3 epsilon naught r squared — inverse square law. r equals R pe dono expressions same value dete hain — ye continuity check karo hamesha JEE mein!',
      },
    ],
  },
  {
    id: 'shm',
    title: 'Simple Harmonic Motion',
    titleHi: 'सरल आवर्त गति — Simple Pendulum (NEET)',
    icon: '🔄',
    color: '#a855f7',
    exam: 'NEET',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A simple pendulum of length 1 m, bob mass 100 g, is displaced 5° and released. Find: (a) Time period, (b) Max velocity, (c) Max tension. (g = 10 m/s²)',
        speech: 'NEET ka favourite topic — Simple Harmonic Motion! Ek simple pendulum hai length 1 meter, bob ka mass 100 grams, 5 degree displace karke chhodha. Time period, maximum velocity aur maximum tension nikalno hai.',
      },
      {
        label: 'Step 1 — Time Period',
        math: 'T = 2\\pi\\sqrt{\\frac{L}{g}} = 2\\pi\\sqrt{\\frac{1}{10}} \\approx 2 \\text{ s}',
        speech: 'Time period ka formula hai T equals 2 pi root L by g. L is 1 meter, g is 10. Toh T approximately 2 seconds. Notice karo — ye mass pe depend nahi karta aur amplitude pe bhi nahi. Ye NEET ka key concept hai!',
      },
      {
        label: 'Step 2 — Maximum Velocity',
        text: 'Energy conservation at mean position:',
        math: 'v_{max} = \\sqrt{2gL(1-\\cos\\theta)}',
        math2: '= \\sqrt{2 \\times 10 \\times 1 \\times 0.0038} \\approx 0.276 \\text{ m/s}',
        speech: 'Maximum velocity mean position pe hoti hai. Energy conservation lagao — potential energy convert hoti hai kinetic mein. v max equals root 2gL into 1 minus cos 5 degrees. Calculate karo: approximately 0.276 meters per second. Mass cancel ho gaya!',
      },
      {
        label: 'Step 3 — Maximum Tension',
        text: 'At mean position (lowest point), centripetal force needed:',
        math: 'T_{max} = mg + \\frac{mv^2_{max}}{L} = m\\left(g + \\frac{v^2_{max}}{L}\\right)',
        math2: '= 0.1(10 + 0.076) \\approx 1.008 \\text{ N}',
        speech: 'Maximum tension lowest point pe hoti hai — yaad rakhna, extreme pe nahi! Yahan weight plus centripetal force chahiye. T max equals mg plus m v squared by L. Values dalo: 0.1 times 10.076, approximately 1.008 Newtons. Weight se thoda zyada hai tension.',
        highlight: true,
      },
      {
        label: 'Final Answer ✓',
        isAnswer: true,
        math: '\\boxed{T \\approx 2\\text{ s},\\; v_{max} \\approx 0.276\\text{ m/s},\\; T_{max} \\approx 1.008\\text{ N}}',
        speech: 'Final answers: Time period 2 seconds, max velocity 0.276 meters per second, max tension 1.008 Newtons. NEET tip: tension maximum mean position pe hoti hai, extreme pe minimum. Ye bahut baar NEET mein poocha gaya hai!',
      },
    ],
  },
  {
    id: 'thermo',
    title: 'Carnot Engine Efficiency',
    titleHi: 'कार्नो इंजन — ऊष्मागतिकी (NEET)',
    icon: '🔥',
    color: '#fbbf24',
    exam: 'NEET',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A Carnot engine operates between 600 K (hot) and 300 K (cold), absorbing 1000 J per cycle. Find efficiency, work done, heat rejected, and new efficiency if T_C increases to 400 K.',
        speech: 'Thermodynamics ka ek important problem. Carnot engine hai 600 Kelvin aur 300 Kelvin ke beech, 1000 Joules absorb karta hai per cycle. Efficiency, work done, heat rejected nikalna hai, aur agar cold reservoir 400 K ho jaaye toh new efficiency bhi.',
      },
      {
        label: 'Step 1 — Carnot Efficiency',
        math: '\\eta = 1 - \\frac{T_C}{T_H} = 1 - \\frac{300}{600} = 50\\%',
        speech: 'Carnot efficiency ka formula: eta equals 1 minus T cold by T hot. 1 minus 300 by 600 equals 0.5 yaani 50 percent. Ye maximum possible efficiency hai — koi bhi real engine isse zyada efficient nahi ho sakta! Temperature hamesha Kelvin mein lena.',
        highlight: true,
      },
      {
        label: 'Step 2 — Work Done',
        math: 'W = \\eta \\times Q_H = 0.5 \\times 1000 = 500 \\text{ J}',
        speech: 'Work done per cycle equals efficiency times heat absorbed. 0.5 times 1000 equals 500 Joules.',
      },
      {
        label: 'Step 3 — Heat Rejected',
        math: 'Q_C = Q_H - W = 1000 - 500 = 500 \\text{ J}',
        speech: 'First law of thermodynamics se: Q hot equals Work plus Q cold. Toh Q cold equals 1000 minus 500 equals 500 Joules. Half energy waste ho gayi as heat!',
      },
      {
        label: 'Step 4 — New Efficiency (T_C = 400K)',
        math: '\\eta_{new} = 1 - \\frac{400}{600} = \\frac{1}{3} \\approx 33.3\\%',
        math2: '\\Delta\\eta = 50\\% - 33.3\\% = 16.7\\% \\;\\text{decrease!}',
        speech: 'Agar cold reservoir 400 Kelvin ho jaaye: new efficiency 1 minus 400 by 600 equals one-third, yaani 33.3 percent. 16.7 percent ki significant decrease! Isliye power plants ko bahut thanda cold reservoir chahiye.',
        highlight: true,
      },
      {
        label: 'Final Answer ✓',
        isAnswer: true,
        math: '\\boxed{\\eta = 50\\%,\\; W = 500\\text{ J},\\; Q_C = 500\\text{ J},\\; \\eta_{new} \\approx 33.3\\%}',
        speech: 'Final answer: Efficiency 50 percent, work 500 Joules, heat rejected 500 Joules, aur new efficiency 33.3 percent. NEET key tip: temperature hamesha Kelvin mein dalo, Celsius mein nahi! Ye sabse common mistake hai.',
      },
    ],
  },
  {
    id: 'optics',
    title: 'Lens Combination',
    titleHi: 'लेंस संयोजन — किरण प्रकाशिकी (JEE Mains)',
    icon: '🔍',
    color: '#ff5252',
    exam: 'JEE',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A convex lens (f₁ = 20 cm) and concave lens (f₂ = −40 cm) are 10 cm apart. Object is 30 cm in front of convex lens. Find final image position.',
        speech: 'Optics ka ek classic lens combination problem. Convex lens focal length 20 cm, concave lens focal length minus 40 cm, 10 cm apart. Object convex lens se 30 cm pe hai. Final image kahan banega?',
      },
      {
        label: 'Step 1 — Image from Convex Lens',
        math: '\\frac{1}{v_1} - \\frac{1}{(-30)} = \\frac{1}{20}',
        math2: '\\frac{1}{v_1} = \\frac{1}{20} - \\frac{1}{30} = \\frac{1}{60}',
        math3: 'v_1 = +60 \\text{ cm (real image)}',
        speech: 'Pehle convex lens se image banao. Lens formula: 1 by v minus 1 by u equals 1 by f. u is minus 30, f is plus 20. Solve karo: v1 equals plus 60 cm. Ye ek real image hai convex lens ke 60 cm peeche.',
      },
      {
        label: 'Step 2 — Object for Concave Lens',
        text: 'Image from lens 1 is 60 cm behind it, but concave lens is only 10 cm away.',
        math: 'u_2 = +50 \\text{ cm (virtual object)}',
        speech: 'Ab ye image concave lens ke liye object banega. Concave lens 10 cm door hai, lekin image 60 cm pe ban rahi hai — toh ye concave lens ke 50 cm PEECHE hai. Ye virtual object hai, isliye u2 is plus 50.',
      },
      {
        label: 'Step 3 — Final Image',
        math: '\\frac{1}{v_2} - \\frac{1}{50} = \\frac{1}{-40}',
        math2: '\\frac{1}{v_2} = \\frac{1}{50} - \\frac{1}{40} = \\frac{-1}{200}',
        math3: 'v_2 = -200 \\text{ cm}',
        speech: 'Concave lens ka formula lagao: 1 by v minus 1 by 50 equals 1 by minus 40. Solve karo: v2 equals minus 200 cm. Negative sign matlab final image concave lens ke saamne hai — ye virtual image hai!',
        highlight: true,
      },
      {
        label: 'Final Answer ✓',
        isAnswer: true,
        math: '\\boxed{\\text{Virtual image, 200 cm in front of concave lens (190 cm from convex lens)}}',
        speech: 'Final image: virtual, concave lens se 200 cm saamne, yaani convex lens se 190 cm. JEE mein sign convention bahut carefully follow karo — ek sign galat aur poora answer galat! Practice karo aur sign convention ki habit banao.',
      },
    ],
  },
]
