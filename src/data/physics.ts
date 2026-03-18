import { Topic } from './types'

export const physicsQuestions: Topic[] = [
  {
    id: 'kinematics_001',
    title: 'Projectile Motion from Building',
    titleHi: 'इमारत से प्रक्षेप्य गति',
    icon: '🎯',
    color: '#FF6B6B',
    exam: 'JEE Mains',
    subject: 'Physics',
    difficulty: 'Easy',
    chapter: 'Kinematics',
    diagram: {
      type: 'projectile',
      params: {
        u: { label: 'Initial velocity (u)', min: 5, max: 50, step: 1, value: 20, unit: ' m/s' },
        theta: { label: 'Angle (θ)', min: 0, max: 60, step: 5, value: 0, unit: '°' },
        H: { label: 'Building height (H)', min: 5, max: 80, step: 5, value: 45, unit: ' m' },
      },
    },
    steps: [
      {
        label: 'Problem Setup',
        text: 'A ball is thrown horizontally from the top of a building of height 45 m with initial velocity 20 m/s',
        speech: 'Chaliye shuru karte hain! Ek building hai, height 45 meter, aur usse ek ball ko horizontally throw karte hain velocity 20 m/s ke saath. Hamein trajectory aur impact time nikalna hai.'
      },
      {
        label: 'Find Time of Flight',
        math: 'h = \\frac{1}{2}gt^2',
        math2: '45 = \\frac{1}{2} \\times 10 \\times t^2',
        speech: 'Sabse pehle vertical motion dekho. Free fall hoga height h = 45 meter. Time of flight nikalne ke liye formula use karo: h equals half g t squared. 45 equals 5 times t squared.'
      },
      {
        label: 'Calculate Time',
        math: 't^2 = 9',
        math2: 't = 3 \\text{ seconds}',
        speech: 'T squared equals 9, toh t equals 3 seconds. Ye bahut important calculation hai!'
      },
      {
        label: 'Find Horizontal Distance',
        math: 'x = u \\times t',
        math2: 'x = 20 \\times 3 = 60 \\text{ m}',
        speech: 'Ab horizontal distance nikalo. Initial horizontal velocity 20 m/s aur time 3 seconds. X equals u into t, toh 20 into 3 equals 60 meters.'
      },
      {
        label: 'Find Final Vertical Velocity',
        math: 'v_y = gt',
        math2: 'v_y = 10 \\times 3 = 30 \\text{ m/s}',
        speech: 'Vertical velocity nikalne ke liye v_y equals g times t. 10 into 3 equals 30 m/s downward.'
      },
      {
        label: 'Final Answer',
        text: 'Horizontal distance = 60 m, Time = 3 s, Final vertical velocity = 30 m/s',
        math: 'v_{final} = \\sqrt{v_x^2 + v_y^2} = \\sqrt{20^2 + 30^2} = \\sqrt{1300} \\approx 36.06 \\text{ m/s}',
        speech: 'Final answer mil gaya! Horizontal distance 60 meters, time of flight 3 seconds, aur final speed approximately 36 m/s hai. Ye ek typical JEE mains question hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'newtons_laws_001',
    title: 'Atwood Machine with Pulley',
    titleHi: 'अटवुड मशीन पुली के साथ',
    icon: '⚙️',
    color: '#4ECDC4',
    exam: 'JEE Mains',
    subject: 'Physics',
    difficulty: 'Medium',
    chapter: 'Newton\'s Laws of Motion',
    diagram: {
      type: 'atwood',
      params: {
        m1: { label: 'Mass m₁ (heavier)', min: 1, max: 20, step: 0.5, value: 5, unit: ' kg' },
        m2: { label: 'Mass m₂ (lighter)', min: 1, max: 20, step: 0.5, value: 3, unit: ' kg' },
      },
    },
    steps: [
      {
        label: 'Problem Setup',
        text: 'Two blocks of mass m₁ = 5 kg and m₂ = 3 kg are connected by a light string over a frictionless pulley',
        speech: 'Atwood machine ka classic question hai! Ek heavy block 5 kg ka aur ek light block 3 kg ka. Dono pulley se connected hain. Hamein acceleration aur tension nikalna hai.'
      },
      {
        label: 'Apply Newton\'s Second Law',
        math: '(m_1 - m_2)g = (m_1 + m_2)a',
        text: 'For the system: heavier mass accelerates downward',
        speech: 'Dono blocks ke liye equations likho. Pehla block neeche aayega kyunki zyada heavy hai. Newton\'s second law lagao: m₁ minus m₂ times g equals m₁ plus m₂ times a.'
      },
      {
        label: 'Calculate Acceleration',
        math: 'a = \\frac{(m_1 - m_2)g}{m_1 + m_2}',
        math2: 'a = \\frac{(5 - 3) \\times 10}{5 + 3} = \\frac{20}{8} = 2.5 \\text{ m/s}^2',
        speech: 'Values dalo! 5 minus 3 equals 2, times 10 equals 20. 5 plus 3 equals 8. Toh 20 divide by 8 equals 2.5 m/s square. Acceleration nikla!'
      },
      {
        label: 'Find Tension in String',
        math: 'T = m_2(g + a)',
        math2: 'T = 3 \\times (10 + 2.5) = 3 \\times 12.5 = 37.5 \\text{ N}',
        speech: 'Tension nikalne ke liye lighter mass use karo. T equals m₂ times g plus a. 3 into 12.5 equals 37.5 Newton. Ye bahut important hai JEE ke liye!'
      },
      {
        label: 'Verification',
        math: 'T = m_1(g - a) = 5 \\times (10 - 2.5) = 37.5 \\text{ N}',
        speech: 'Double check karo! Heavy mass wale equation se bhi same tension aata hai. 5 into 7.5 equals 37.5 Newton. Perfect match!'
      },
      {
        label: 'Final Answer',
        text: 'Acceleration = 2.5 m/s², Tension = 37.5 N',
        speech: 'Final answer hai: acceleration 2.5 m per second squared, tension 37.5 Newton. Ye classic Atwood machine problem completely solve ho gaya!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'work_energy_001',
    title: 'Spring-Block Collision',
    titleHi: 'स्प्रिंग-ब्लॉक टकराव',
    icon: '💥',
    color: '#95E1D3',
    exam: 'JEE Advanced',
    subject: 'Physics',
    difficulty: 'Medium',
    chapter: 'Work Energy Theorem',
    steps: [
      {
        label: 'Problem Setup',
        text: 'A block of mass 2 kg moving at 10 m/s collides with a spring of constant k = 500 N/m. Find maximum compression.',
        speech: 'JEE Advanced ka interesting problem! Ek block 2 kg mass ka, speed 10 m/s se spring se collide kar raha hai. Spring constant 500 N/m hai. Maximum compression nikalna hai.'
      },
      {
        label: 'Apply Energy Conservation',
        math: 'KE_{initial} = PE_{spring}',
        math2: '\\frac{1}{2}mv^2 = \\frac{1}{2}kx_{max}^2',
        speech: 'Sabse pehle energy conservation use karo. Block ki kinetic energy completely spring ke potential energy mein convert hogi. Half m v squared equals half k x max squared.'
      },
      {
        label: 'Substitute Values',
        math: '\\frac{1}{2} \\times 2 \\times (10)^2 = \\frac{1}{2} \\times 500 \\times x_{max}^2',
        math2: '100 = 250 \\times x_{max}^2',
        speech: 'Values dalo! Half times 2 equals 1, 1 times 100 equals 100. Dusri side half times 500 equals 250. Toh 100 equals 250 times x max squared.'
      },
      {
        label: 'Solve for Maximum Compression',
        math: 'x_{max}^2 = \\frac{100}{250} = 0.4',
        math2: 'x_{max} = \\sqrt{0.4} \\approx 0.632 \\text{ m}',
        speech: 'X max squared equals 100 divide by 250 equals 0.4. Square root lo! X max equals approximately 0.632 meter ya 63.2 centimeter. Ye bahut important JEE Advanced concept hai!'
      },
      {
        label: 'Alternative: Using Work-Energy Theorem',
        math: 'W_{spring} = -\\Delta KE',
        math2: '-\\frac{1}{2}kx_{max}^2 = 0 - \\frac{1}{2}mv^2',
        speech: 'Work-energy theorem se bhi verify kar sakte ho. Spring ka work negative hai, aur block ki kinetic energy zero ho jaati hai at maximum compression.'
      },
      {
        label: 'Final Answer',
        text: 'Maximum compression = 0.632 m or 63.2 cm',
        math: 'x_{max} = \\sqrt{\\frac{mv^2}{k}} = \\sqrt{\\frac{2 \\times 100}{500}} = 0.632 \\text{ m}',
        speech: 'Final answer mil gaya! Maximum compression 0.632 meter hai. Ye classic spring-block collision problem JEE Advanced mein regularly aata hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'rotational_motion_001',
    title: 'Rolling Without Slipping on Incline',
    titleHi: 'झुके हुए तल पर बिना फिसले लुढ़कना',
    icon: '🔄',
    color: '#F8B195',
    exam: 'JEE Advanced',
    subject: 'Physics',
    difficulty: 'Hard',
    chapter: 'Rotational Motion',
    steps: [
      {
        label: 'Problem Setup',
        text: 'A solid sphere of mass M and radius R rolls without slipping down an incline of angle θ = 30°. Find acceleration.',
        speech: 'Ye bahut tough JEE Advanced problem hai! Ek solid sphere angle 30 degree ke incline par roll kar raha hai, without slipping. Hamein acceleration nikalna hai.'
      },
      {
        label: 'Identify Rolling Constraint',
        math: 'v = \\omega R \\quad \\text{(no slipping)}',
        math2: 'a = \\alpha R',
        speech: 'Rolling without slipping ka matlab v equals omega R. Iska differentiate karo, toh a equals alpha R. Ye constraint use karni hai!'
      },
      {
        label: 'Apply Equations of Motion',
        math: 'Mg\\sin\\theta - f = Ma',
        math2: 'fR = I\\alpha = \\frac{2}{5}MR^2 \\times \\frac{a}{R}',
        speech: 'Translational motion ke liye: Mg sin theta minus friction equals Ma. Rotational motion ke liye: tau equals I alpha. Solid sphere ka moment of inertia hai 2/5 MR squared.'
      },
      {
        label: 'Solve for Friction',
        math: 'fR = \\frac{2}{5}MRa',
        math2: 'f = \\frac{2}{5}Ma',
        speech: 'Friction nikalne ke liye dusri equation se: f equals 2/5 Ma. Ab isko pehli equation mein dalo.'
      },
      {
        label: 'Find Acceleration',
        math: 'Mg\\sin\\theta - \\frac{2}{5}Ma = Ma',
        math2: 'Mg\\sin\\theta = Ma + \\frac{2}{5}Ma = \\frac{7}{5}Ma',
        math3: 'a = \\frac{5g\\sin\\theta}{7}',
        speech: 'Mg sin theta equals Ma plus 2/5 Ma equals 7/5 Ma. Toh a equals 5g sin theta by 7. Angle 30 degree dalo!'
      },
      {
        label: 'Final Answer',
        math: 'a = \\frac{5 \\times 10 \\times \\sin(30°)}{7} = \\frac{5 \\times 10 \\times 0.5}{7} = \\frac{25}{7} \\approx 3.57 \\text{ m/s}^2',
        text: 'Acceleration = 25/7 m/s² ≈ 3.57 m/s²',
        speech: 'Final answer! Acceleration 25 divide by 7 meter per second squared, approximately 3.57 m/s square. Ye rolling without slipping ki core concept hai. JEE Advanced mein definitely aata hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'electrostatics_001',
    title: 'Gauss Law for Charged Sphere',
    titleHi: 'आवेशित गोले के लिए गॉस नियम',
    icon: '⚡',
    color: '#FFE66D',
    exam: 'JEE Advanced',
    subject: 'Physics',
    difficulty: 'Medium',
    chapter: 'Electrostatics',
    steps: [
      {
        label: 'Problem Setup',
        text: 'A uniformly charged sphere of radius R has total charge Q. Find electric field at distance r = 2R from center.',
        speech: 'Gauss law ka important application! Ek uniformly charged sphere hai, radius R, total charge Q. Hamein electric field nikalna hai distance 2R par center se.'
      },
      {
        label: 'Apply Gauss Law',
        math: '\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enclosed}}{\\epsilon_0}',
        speech: 'Sabse pehle Gauss law likho. E dot dA surface ke upar integrate karo equals Q enclosed by epsilon zero.'
      },
      {
        label: 'Identify Enclosed Charge',
        text: 'Since r = 2R > R, the point is outside the sphere. Therefore, Q_enclosed = Q (total charge)',
        speech: 'Distance 2R sphere ke radius se zyada hai, toh point sphere ke bahar hai. Enclosed charge pure Q ke barabar hoga. Sphere ke andar saara charge include hota hai.'
      },
      {
        label: 'Construct Gaussian Surface',
        math: '\\oint E \\, dA = E \\times 4\\pi r^2',
        math2: 'E \\times 4\\pi (2R)^2 = \\frac{Q}{\\epsilon_0}',
        speech: 'Gaussian surface banao radius 2R ka. Surface area equals 4 pi r squared. Toh E times 4 pi times 4R squared equals Q by epsilon zero.'
      },
      {
        label: 'Calculate Electric Field',
        math: 'E \\times 16\\pi R^2 = \\frac{Q}{\\epsilon_0}',
        math2: 'E = \\frac{Q}{16\\pi\\epsilon_0 R^2}',
        speech: 'Simplify karo! E equals Q by 16 pi epsilon zero R squared. Ya isko Coulomb form mein likho: E equals kQ by 4r squared, jahan r equals 2R.'
      },
      {
        label: 'Final Answer',
        math: 'E = \\frac{kQ}{(2R)^2} = \\frac{kQ}{4R^2}',
        text: 'Electric field at 2R = kQ/4R²',
        speech: 'Final answer! Electric field at distance 2R equals kQ by 4R squared. Ye Coulomb force ka direct application hai. JEE Advanced mein Gauss law questions bahut important hain!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'current_electricity_001',
    title: 'Wheatstone Bridge Analysis',
    titleHi: 'व्हीटस्टोन सेतु विश्लेषण',
    icon: '🌉',
    color: '#F38181',
    exam: 'JEE Mains',
    subject: 'Physics',
    difficulty: 'Easy',
    chapter: 'Current Electricity',
    steps: [
      {
        label: 'Problem Setup',
        text: 'In a Wheatstone bridge: P = 4Ω, Q = 6Ω, R = 8Ω. Find S for balanced condition.',
        speech: 'Wheatstone bridge ka basic question! P = 4 ohm, Q = 6 ohm, R = 8 ohm hai. Bridge ko balanced condition mein rukne ke liye S nikalna hai.'
      },
      {
        label: 'Recall Balance Condition',
        math: '\\frac{P}{Q} = \\frac{R}{S}',
        speech: 'Sabse pehle balance condition yaad karo. P by Q equals R by S. Jab galvanometer mein koi current nahi aata, tab bridge balanced hai.'
      },
      {
        label: 'Rearrange Formula',
        math: 'S = \\frac{R \\times Q}{P}',
        speech: 'Formula rearrange karo. S equals R into Q by P. Cross multiply karo! R times Q equals P times S.'
      },
      {
        label: 'Substitute Values',
        math: 'S = \\frac{8 \\times 6}{4}',
        speech: 'Values dalo! 8 times 6 equals 48. 48 divide by 4 equals 12. Toh S equals 12 ohm.'
      },
      {
        label: 'Verification',
        math: '\\frac{4}{6} = \\frac{8}{12}',
        math2: '\\frac{2}{3} = \\frac{2}{3}',
        speech: 'Double check karo! P by Q equals 4 by 6 equals 2 by 3. R by S equals 8 by 12 equals 2 by 3. Perfect match! Bridge balanced hai.'
      },
      {
        label: 'Final Answer',
        text: 'S = 12 Ω',
        speech: 'Final answer hai! Unknown resistance S equals 12 ohm. Wheatstone bridge ka ye fundamental application hai. JEE mains mein hamesha ek question aata hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'ray_optics_001',
    title: 'Lens Combination for Image Formation',
    titleHi: 'प्रतिबिंब बनाने के लिए लेंस संयोजन',
    icon: '🔍',
    color: '#A8E6CF',
    exam: 'JEE Mains',
    subject: 'Physics',
    difficulty: 'Medium',
    chapter: 'Ray Optics',
    diagram: {
      type: 'lens',
      params: {
        f1: { label: 'Convex f₁', min: 10, max: 50, step: 5, value: 20, unit: ' cm' },
        f2: { label: 'Concave f₂', min: -80, max: -10, step: 5, value: -40, unit: ' cm' },
        d: { label: 'Separation (d)', min: 5, max: 30, step: 1, value: 10, unit: ' cm' },
        u1: { label: 'Object distance (u)', min: -60, max: -15, step: 5, value: -30, unit: ' cm' },
      },
    },
    steps: [
      {
        label: 'Problem Setup',
        text: 'Two converging lenses with f₁ = 15 cm and f₂ = 10 cm are separated by d = 20 cm. Object at 30 cm from first lens. Find final image position.',
        speech: 'Lens combination ka typical JEE question! Pehla lens focal length 15 cm, dusra lens focal length 10 cm. Distance dono ke beech 20 cm hai. Object 30 cm par pehle lens se.'
      },
      {
        label: 'Image by First Lens',
        math: '\\frac{1}{f_1} = \\frac{1}{v_1} + \\frac{1}{u_1}',
        math2: '\\frac{1}{15} = \\frac{1}{v_1} + \\frac{1}{-30}',
        speech: 'Sabse pehle pehle lens se image banao. Lens formula use karo: 1 by f equals 1 by v plus 1 by u. Object distance u₁ equals -30 cm (convention ke according).'
      },
      {
        label: 'Calculate v₁',
        math: '\\frac{1}{v_1} = \\frac{1}{15} + \\frac{1}{30} = \\frac{2 + 1}{30} = \\frac{3}{30}',
        math2: 'v_1 = 10 \\text{ cm}',
        speech: 'Simplify karo! 1 by 15 plus 1 by 30. LCM 30 hai. 2 by 30 plus 1 by 30 equals 3 by 30 equals 1 by 10. Toh v₁ equals 10 cm.'
      },
      {
        label: 'Object for Second Lens',
        text: 'Image from first lens acts as object for second lens. Distance = 20 - 10 = 10 cm (virtual object)',
        math: 'u_2 = -(20 - 10) = -10 \\text{ cm}',
        speech: 'Ab pehle lens se jo image bana, wo dusre lens ke liye object ban jaata hai. Dono lens ke beech distance 20 cm hai. Image 10 cm par bana. Toh object distance for second lens equals negative 10 cm.'
      },
      {
        label: 'Image by Second Lens',
        math: '\\frac{1}{10} = \\frac{1}{v_2} + \\frac{1}{-10}',
        math2: '\\frac{1}{v_2} = \\frac{1}{10} + \\frac{1}{10} = \\frac{2}{10}',
        math3: 'v_2 = 5 \\text{ cm}',
        speech: 'Dusre lens ke liye lens formula lagao! 1 by 10 equals 1 by v₂ plus 1 by -10. Toh 1 by v₂ equals 1 by 10 plus 1 by 10. V₂ equals 5 cm. Final image 5 cm par ban gaya!'
      },
      {
        label: 'Final Answer',
        text: 'Final image position = 5 cm from second lens (on opposite side of object)',
        math: 'm = m_1 \\times m_2 = \\frac{v_1}{u_1} \\times \\frac{v_2}{u_2} = \\frac{10}{-30} \\times \\frac{5}{-10} = \\frac{50}{300} = \\frac{1}{6}',
        speech: 'Final answer! Image pehle lens se 10 cm par bana, dusre lens se 5 cm par. Magnification calculate karo: m equals m₁ times m₂. Composite magnification 1 by 6 hai. JEE mains mein ye standard problem hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'shm_001',
    title: 'Simple Pendulum Time Period',
    titleHi: 'साधारण पेंडुलम की समयावधि',
    icon: '⏱️',
    color: '#FFB6C1',
    exam: 'NEET',
    subject: 'Physics',
    difficulty: 'Easy',
    chapter: 'Simple Harmonic Motion',
    diagram: {
      type: 'pendulum',
      params: {
        L: { label: 'Length (L)', min: 0.2, max: 3, step: 0.1, value: 1, unit: ' m' },
        theta: { label: 'Angle (θ)', min: 1, max: 15, step: 1, value: 5, unit: '°' },
        m: { label: 'Mass (m)', min: 0.05, max: 0.5, step: 0.05, value: 0.1, unit: ' kg' },
      },
    },
    steps: [
      {
        label: 'Problem Setup',
        text: 'A simple pendulum has length 1 m. Find its time period. (Use g = 10 m/s²)',
        speech: 'NEET ka basic SHM question! Simple pendulum ki length 1 meter hai. Hamein time period nikalna hai. Acceleration due to gravity 10 m/s hai.'
      },
      {
        label: 'Recall Time Period Formula',
        math: 'T = 2\\pi\\sqrt{\\frac{L}{g}}',
        speech: 'Sabse pehle formula yaad karo. Simple pendulum ka time period T equals 2 pi square root of L by g. Ye formula bahut important hai NEET mein!'
      },
      {
        label: 'Identify Parameters',
        text: 'L = 1 m, g = 10 m/s²',
        speech: 'Length L equals 1 meter. Gravity g equals 10 m per second square. Ab values dalo formula mein.'
      },
      {
        label: 'Substitute and Calculate',
        math: 'T = 2\\pi\\sqrt{\\frac{1}{10}} = 2\\pi\\sqrt{0.1}',
        math2: 'T = 2\\pi \\times 0.316 \\approx 2 \\times 3.14 \\times 0.316',
        speech: 'Values dalo! 2 pi square root of 1 by 10. Square root of 0.1 approximately 0.316 hai. 2 into 3.14 into 0.316.'
      },
      {
        label: 'Final Calculation',
        math: 'T = 6.28 \\times 0.316 \\approx 2 \\text{ seconds}',
        speech: 'Calculate karo! Approximately 2 seconds aata hai. Ye standard NEET question hai.'
      },
      {
        label: 'Final Answer',
        text: 'Time period T ≈ 2 seconds',
        speech: 'Final answer! Simple pendulum ki time period approximately 2 seconds hai. Ye one meter length wala pendulum 2 second mein ek complete oscillation karta hai. NEET mein hamesha ye formula use hota hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'thermodynamics_001',
    title: 'Carnot Engine Efficiency',
    titleHi: 'कार्नोट इंजन की दक्षता',
    icon: '🔥',
    color: '#FFD700',
    exam: 'NEET',
    subject: 'Physics',
    difficulty: 'Medium',
    chapter: 'Thermodynamics',
    steps: [
      {
        label: 'Problem Setup',
        text: 'A Carnot engine operates between temperature reservoirs: T_hot = 600 K and T_cold = 300 K. Calculate efficiency.',
        speech: 'Thermodynamics ka important question! Carnot engine kaam kar raha hai do temperature reservoirs ke beech. Hot temperature 600 Kelvin, cold temperature 300 Kelvin. Efficiency nikalni hai.'
      },
      {
        label: 'Recall Carnot Efficiency Formula',
        math: '\\eta = 1 - \\frac{T_c}{T_h}',
        speech: 'Sabse pehle Carnot engine ki efficiency ka formula yaad karo. Eta equals 1 minus T cold by T hot. Ye maximum efficiency hai kaisi bhi engine ki!'
      },
      {
        label: 'Identify Temperatures',
        text: 'T_hot = 600 K (hot reservoir), T_cold = 300 K (cold reservoir)',
        math: '\\eta = 1 - \\frac{300}{600}',
        speech: 'Temperatures identify karo! Hot reservoir 600 Kelvin, cold reservoir 300 Kelvin. Isko formula mein dalo.'
      },
      {
        label: 'Simplify the Fraction',
        math: '\\eta = 1 - \\frac{1}{2} = \\frac{1}{2}',
        speech: '300 divide by 600 equals half. 1 minus half equals half. Toh efficiency half hai!'
      },
      {
        label: 'Convert to Percentage',
        math: '\\eta = 0.5 = 50\\%',
        text: 'Efficiency = 50%',
        speech: 'Half equals 0.5, ya 50 percent. Ye matlab Carnot engine 50 percent efficiently work kar raha hai. Ye maximum theoretical efficiency hai!'
      },
      {
        label: 'Final Answer',
        text: 'Carnot engine efficiency = 50%',
        speech: 'Final answer! Efficiency 50 percent hai. Matlab 100 Joule heat input se 50 Joule useful work milta hai. Baaki 50 Joule cold reservoir ko waste hota hai. NEET mein Carnot engine fundamental topic hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'modern_physics_001',
    title: 'Photoelectric Effect Threshold Frequency',
    titleHi: 'प्रकाश वैद्युत प्रभाव: सीमा आवृत्ति',
    icon: '💡',
    color: '#FF00FF',
    exam: 'JEE Advanced',
    subject: 'Physics',
    difficulty: 'Hard',
    chapter: 'Modern Physics',
    steps: [
      {
        label: 'Problem Setup',
        text: 'A metal has work function W = 2.2 eV. Light of frequency ν = 1.5 × 10¹⁵ Hz is incident. Find maximum kinetic energy of photoelectrons. (h = 6.63 × 10⁻³⁴ J·s)',
        speech: 'Photoelectric effect ka JEE Advanced question! Metal ka work function 2.2 electron volt hai. Light frequency 1.5 into 10 power 15 Hertz. Hamein maximum kinetic energy nikalni hai.'
      },
      {
        label: 'Recall Einstein\'s Photoelectric Equation',
        math: 'h\\nu = W + KE_{max}',
        speech: 'Sabse pehle Einstein ka photoelectric equation likho. h nu equals W plus KE maximum. H Planck constant, nu frequency, W work function, KE maximum kinetic energy.'
      },
      {
        label: 'Calculate Photon Energy',
        math: 'E_{photon} = h\\nu = 6.63 \\times 10^{-34} \\times 1.5 \\times 10^{15}',
        math2: 'E_{photon} = 9.945 \\times 10^{-19} \\text{ J}',
        speech: 'Photon energy calculate karo! H equals 6.63 into 10 power -34 Joule second. Nu equals 1.5 into 10 power 15 Hertz. Multiply karo!'
      },
      {
        label: 'Convert to Electron Volts',
        math: 'E_{photon} = \\frac{9.945 \\times 10^{-19}}{1.6 \\times 10^{-19}} \\approx 6.22 \\text{ eV}',
        speech: 'Joule ko electron volt mein convert karo! Divide by 1.6 into 10 power -19. Approximately 6.22 electron volt aata hai.'
      },
      {
        label: 'Find Maximum Kinetic Energy',
        math: 'KE_{max} = E_{photon} - W',
        math2: 'KE_{max} = 6.22 - 2.2 = 4.02 \\text{ eV}',
        speech: 'KE maximum equals photon energy minus work function. 6.22 minus 2.2 equals 4.02 electron volt. Ye photoelectrons ki maximum kinetic energy hai!'
      },
      {
        label: 'Final Answer',
        text: 'Maximum kinetic energy of photoelectrons = 4.02 eV',
        math: 'v_{max} = \\sqrt{\\frac{2 \\times KE_{max}}{m_e}}',
        speech: 'Final answer! Maximum kinetic energy 4.02 electron volt. Agar maximum velocity chahiye toh KE equals half m e into v square. JEE Advanced mein photoelectric effect bilkul important hai! Einstein ka equations bar bar poocha jaata hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  }
]
