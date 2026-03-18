import { Topic } from './types'

export const chemistryQuestions: Topic[] = [
  {
    id: 'chem-001',
    title: 'Mole Concept and Stoichiometry',
    titleHi: 'मोल संकल्पना और स्टोइकियोमेट्री',
    icon: '⚗️',
    color: '#e91e63',
    exam: 'JEE Mains',
    subject: 'Chemistry',
    difficulty: 'Easy',
    chapter: 'Mole Concept',
    steps: [
      {
        label: 'Problem Statement',
        text: 'How many moles of H₂O are produced when 2.3g of sodium (Na) reacts with water?',
        speech: 'Toh chaliye! 2.3 gram sodium pani ke saath react kar raha hai. Humein maloom karna hai kitne moles water bante hain. Pehle reaction likho aur phir moles nikalo.',
        highlight: true
      },
      {
        label: 'Reaction Balancing',
        math: '2\\text{Na} + 2\\text{H}_2\\text{O} \\rightarrow 2\\text{NaOH} + \\text{H}_2\\uparrow',
        speech: 'Reaction ko balance kiya. Dekho, 2 moles Na se 1 mole H₂ banta hai aur 2 moles NaOH bante hain. Hamara focus H₂O par hai.',
        highlight: false
      },
      {
        label: 'Molar Mass Calculation',
        math: '\\text{Molar mass of Na} = 23\\text{ g/mol}',
        speech: 'Na ka molar mass 23 gram per mole hai. Ye standard chemistry mein aata hai.',
        highlight: false
      },
      {
        label: 'Moles of Sodium',
        math: '\\text{Moles of Na} = \\frac{2.3}{23} = 0.1\\text{ mol}',
        speech: 'Toh 2.3 gram divided by 23 se humein 0.1 mole sodium milta hai. Seedha calculation!',
        highlight: false
      },
      {
        label: 'Stoichiometric Ratio',
        math: '\\text{From reaction: } 2\\text{ mol Na} \\rightarrow 2\\text{ mol H}_2\\text{O}\\text{ consumed}',
        speech: 'Reaction mein dekho, 2 mole Na ke liye 2 mole H₂O consume hota hai. Toh ratio 1:1 hai.',
        highlight: false
      },
      {
        label: 'Moles of Water Consumed',
        math: '\\text{Moles of H}_2\\text{O} = 0.1 \\times 1 = 0.1\\text{ mol}',
        speech: 'Stoichiometry se 0.1 mole Na ke liye 0.1 mole H₂O consume hoga.',
        highlight: false
      },
      {
        label: 'Final Answer',
        math: '\\boxed{0.1\\text{ moles of H}_2\\text{O are consumed}}',
        speech: 'Toh final answer hai 0.1 moles H₂O. Ye bahut easy calculation thi!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-002',
    title: 'Atomic Structure and Quantum Numbers',
    titleHi: 'परमाणु संरचना और क्वांटम संख्याएं',
    icon: '⚛️',
    color: '#00bcd4',
    exam: 'JEE Mains',
    subject: 'Chemistry',
    difficulty: 'Medium',
    chapter: 'Atomic Structure',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Which of the following quantum numbers is NOT valid? n=2, l=2, m=-1, s=+½',
        speech: 'Quantum numbers ka swaad lelo! Dekho kaun sa quantum number invalid hai. Sabke liye rules hote hain na!',
        highlight: true
      },
      {
        label: 'Principal Quantum Number Rule',
        math: 'n = 1, 2, 3, 4, ...\\text{ (any positive integer)}',
        speech: 'n yani principal quantum number 1, 2, 3 ya phir bada ho sakta hai. n=2 bilkul theek hai!',
        highlight: false
      },
      {
        label: 'Azimuthal Quantum Number Rule',
        math: 'l = 0, 1, 2, ...\\text{ up to } (n-1)',
        speech: 'l yani azimuthal quantum number! Ye 0 se lekar (n-1) tak hota hai. Agar n=2 hai toh l sirf 0 ya 1 ho sakta hai, 2 nahi!',
        highlight: true
      },
      {
        label: 'Magnetic Quantum Number Rule',
        math: 'm = -l, -(l-1), ..., -1, 0, 1, ..., (l-1), l',
        speech: 'Magnetic quantum number m log -l se lekar +l tak hota hai. Ye theek hai agar l valid hai.',
        highlight: false
      },
      {
        label: 'Spin Quantum Number Rule',
        math: 's = +\\frac{1}{2}\\text{ or } -\\frac{1}{2}',
        speech: 'Spin quantum number s sirf +½ ya -½ ho sakta hai. +½ bilkul valid hai!',
        highlight: false
      },
      {
        label: 'Validation Analysis',
        math: 'n=2: \\text{valid}; \\quad l=2: \\text{INVALID (l must be} < n\\text{)}; \\quad m=-1: \\text{valid}; \\quad s=+\\frac{1}{2}: \\text{valid}',
        speech: 'Toh dekho! n=2 theek hai, m=-1 theek hai, s=+½ theek hai. Lekin l=2 ek dum galat hai kyunki n=2 ke liye l sirf 0 ya 1 ho sakta hai!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{l=2\\text{ is NOT valid for } n=2}',
        speech: 'Answer simple hai - l=2 invalid hai! Ye NEET aur JEE mein bahut aata hai, rules yaad rakho!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-003',
    title: 'Chemical Equilibrium - Kp and Kc',
    titleHi: 'रासायनिक संतुलन - Kp और Kc',
    icon: '⚖️',
    color: '#ff5722',
    exam: 'JEE Mains',
    subject: 'Chemistry',
    difficulty: 'Medium',
    chapter: 'Chemical Equilibrium',
    steps: [
      {
        label: 'Problem Statement',
        text: 'For the reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), if Kc = 0.5 at 400K, calculate Kp.',
        speech: 'Nitrogen aur hydrogen se ammonia bante hain! Yeh reversible reaction hai. Kc diya hai aur Kp nikalna hai. Formula yaad hai na?',
        highlight: true
      },
      {
        label: 'Reaction Analysis',
        math: '\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)',
        speech: 'Dekho reaction! Gaseous reaction hai. Left side mein 1+3=4 moles, right side mein 2 moles hain.',
        highlight: false
      },
      {
        label: 'Calculate Δn (Change in moles)',
        math: '\\Delta n = n_{\\text{products}} - n_{\\text{reactants}} = 2 - (1+3) = -2',
        speech: 'Products ke moles minus reactants ke moles. Toh -2 milta hai. Ye important hai Kp ke liye!',
        highlight: false
      },
      {
        label: 'Kp and Kc Relationship',
        math: 'K_p = K_c(RT)^{\\Delta n}',
        speech: 'Yeh formula hai Kp nikalne ka! Kp barabar Kc multiply by (RT) ki power Δn.',
        highlight: true
      },
      {
        label: 'Substitute Values',
        math: 'K_p = 0.5 \\times (0.0821 \\times 400)^{-2}\\quad\\text{[R=0.0821, T=400K]}',
        speech: 'Kc = 0.5 diya hai, R = 0.0821, T = 400K, aur Δn = -2. Ab RT ka value nikalo: 0.0821 times 400 = 32.84',
        highlight: false
      },
      {
        label: 'Final Calculation',
        math: 'K_p = 0.5 \\times (32.84)^{-2} = 0.5 \\times \\frac{1}{1077.5} \\approx 4.64 \\times 10^{-4}',
        speech: 'Ab (32.84) ki square = 1077.5. Phir 1 divide by 1077.5 = 0.000928. Aur 0.5 multiply by ye = 0.000464. Scientific notation mein 4.64 × 10⁻⁴!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{K_p \\approx 4.64 \\times 10^{-4}}',
        speech: 'Toh answer hai 4.64 × 10⁻⁴! Ye important question hai equilibrium mein!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-004',
    title: 'Electrochemistry - Nernst Equation',
    titleHi: 'विद्युत रसायन - नर्नस्ट समीकरण',
    icon: '🔬',
    color: '#4caf50',
    exam: 'JEE Advanced',
    subject: 'Chemistry',
    difficulty: 'Medium',
    chapter: 'Electrochemistry',
    steps: [
      {
        label: 'Problem Statement',
        text: 'A galvanic cell has E° = 1.1V. At 25°C, if [Zn²⁺] = 0.01M and [Cu²⁺] = 1M, find the cell potential E using Nernst equation.',
        speech: 'Galvanic cell ka potential nikalna hai! Standard potential E° diya hai, concentrations bhi diye hain. Nernst equation use karna padega.',
        highlight: true
      },
      {
        label: 'Identify Reaction',
        math: '\\text{Zn} + \\text{Cu}^{2+} \\rightarrow \\text{Zn}^{2+} + \\text{Cu}\\quad;\\quad n = 2',
        speech: 'Zinc aur copper wala classic cell hai! Zn zero oxidation state se +2 ho raha hai, Cu +2 se 0 ho raha hai. Electrons ki sankhya = 2.',
        highlight: false
      },
      {
        label: 'Nernst Equation Formula',
        math: 'E_{\\text{cell}} = E^{\\circ}_{\\text{cell}} - \\frac{0.0592}{n}\\log Q\\quad\\text{(at 25°C)}',
        speech: 'Nernst equation! E cell barabar E standard minus 0.0592 by n log Q. Ye 25 degree celsius par valid hai.',
        highlight: true
      },
      {
        label: 'Calculate Reaction Quotient Q',
        math: 'Q = \\frac{[\\text{Zn}^{2+}]}{[\\text{Cu}^{2+}]} = \\frac{0.01}{1} = 0.01 = 10^{-2}',
        speech: 'Q nikalo! Products ki concentration by reactants. Zn^2+ divided by Cu^2+ = 0.01 by 1 = 0.01 = 10 ki power -2.',
        highlight: false
      },
      {
        label: 'Calculate Log Q',
        math: '\\log Q = \\log(10^{-2}) = -2',
        speech: 'Log lelo Q ka! Log of 10 ki power -2 = -2. Seedha calculation!',
        highlight: false
      },
      {
        label: 'Apply Nernst Equation',
        math: 'E_{\\text{cell}} = 1.1 - \\frac{0.0592}{2} \\times (-2) = 1.1 + 0.0592 = 1.1592\\text{ V}',
        speech: 'Ab substitute karo! 1.1 minus (0.0592 by 2) times (-2). Minus times minus = plus. Toh 0.0592 add hoga. Final answer 1.1592 volt!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{E_{\\text{cell}} \\approx 1.16\\text{ V}}',
        speech: 'Cell potential 1.16 volt! Ye Nernst equation ka classic use hai - battery mein current dete ho toh potential change hota hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-005',
    title: 'Chemical Kinetics - Half-Life',
    titleHi: 'रासायनिक गतिविज्ञान - अर्ध-जीवन',
    icon: '⏱️',
    color: '#9c27b0',
    exam: 'JEE Advanced',
    subject: 'Chemistry',
    difficulty: 'Hard',
    chapter: 'Chemical Kinetics',
    steps: [
      {
        label: 'Problem Statement',
        text: 'For a first-order reaction, the half-life is 30 minutes. Calculate the rate constant k.',
        speech: 'Half-life diya hai 30 minute! First order reaction mein half-life aur k ka acha relation hota hai. Ye hard question nahi, par important hai!',
        highlight: true
      },
      {
        label: 'First-Order Integrated Rate Law',
        math: '\\ln[A] = \\ln[A]_0 - kt\\quad\\text{or}\\quad\\ln\\frac{[A]_0}{[A]} = kt',
        speech: 'First order reaction ke liye integrated rate law. Natural log use hota hai. Ln [A]₀ minus ln [A] equals k times t.',
        highlight: false
      },
      {
        label: 'Half-Life Definition',
        math: 't_{1/2} = \\text{time when } [A] = \\frac{[A]_0}{2}',
        speech: 'Half-life ka matlab? Jab concentration original ke half ho jaye! [A] = [A]₀ by 2.',
        highlight: false
      },
      {
        label: 'Derive Half-Life Formula',
        math: '\\ln\\frac{[A]_0}{[A]_0/2} = k \\cdot t_{1/2}\\quad\\Rightarrow\\quad \\ln 2 = k \\cdot t_{1/2}',
        speech: 'Half-life par [A]₀ divided by ([A]₀ by 2) = 2. Ln 2 = k × t half-life. Ln 2 ka value 0.693 hai!',
        highlight: false
      },
      {
        label: 'First-Order Half-Life Formula',
        math: 't_{1/2} = \\frac{0.693}{k}\\quad\\Rightarrow\\quad k = \\frac{0.693}{t_{1/2}}',
        speech: 'Toh first order mein half-life formula ban gaya! k = 0.693 divided by t half-life. Ye sirf first order ke liye valid hai!',
        highlight: true
      },
      {
        label: 'Substitute Values',
        math: 'k = \\frac{0.693}{30\\text{ min}} = 0.0231\\text{ min}^{-1}\\quad\\text{or}\\quad k = \\frac{0.693}{1800\\text{ s}} = 3.85 \\times 10^{-4}\\text{ s}^{-1}',
        speech: 'Half-life 30 minute diya hai. Toh 0.693 divided by 30 = 0.0231 per minute. Agar seconds mein chahe toh 30 min = 1800 second, toh 3.85 × 10⁻⁴ per second!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{k = 0.0231\\text{ min}^{-1}\\text{ or } 3.85 \\times 10^{-4}\\text{ s}^{-1}}',
        speech: 'Answer! First order ke liye ye relation bahut important hai. Half-life concept samjho toh sab easy ho jayega!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-006',
    title: 'Solutions - Molarity and Dilution',
    titleHi: 'विलयन - मोलरिटा और तनुकरण',
    icon: '🧪',
    color: '#ff9800',
    exam: 'NEET',
    subject: 'Chemistry',
    difficulty: 'Easy',
    chapter: 'Solutions',
    steps: [
      {
        label: 'Problem Statement',
        text: '100 mL of 2M NaCl solution is diluted to 500 mL. Calculate the final molarity.',
        speech: 'Dilution ka bahut simple question! 100 mL solution liya, usme NaCl 2 molar concentration mein hai. 500 mL tak dilute kiya. Final molarity nikalni hai.',
        highlight: true
      },
      {
        label: 'Dilution Principle',
        math: 'M_1V_1 = M_2V_2\\quad\\text{(at constant temperature)}',
        speech: 'Dilution formula! Molarity 1 times volume 1 barabar molarity 2 times volume 2. Ye conservation rule hai!',
        highlight: true
      },
      {
        label: 'Identify Given Values',
        math: 'M_1 = 2\\text{ M},\\quad V_1 = 100\\text{ mL},\\quad V_2 = 500\\text{ mL},\\quad M_2 = ?',
        speech: 'Initial molarity 2, initial volume 100 mL, final volume 500 mL. Final molarity M₂ nikalna hai!',
        highlight: false
      },
      {
        label: 'Apply Formula',
        math: '2 \\times 100 = M_2 \\times 500',
        speech: 'Equation mein substitute karo! 2 times 100 equals M₂ times 500.',
        highlight: false
      },
      {
        label: 'Solve for M₂',
        math: 'M_2 = \\frac{2 \\times 100}{500} = \\frac{200}{500} = 0.4\\text{ M}',
        speech: 'M₂ equals 200 divided by 500 = 0.4 molar! Dilute hone se concentration kam hota hai na!',
        highlight: false
      },
      {
        label: 'Verification',
        math: '\\text{Moles remain same: } n = 2 \\times 0.1 = 0.2\\text{ mol}\\quad;\\quad\\text{Check: } 0.4 \\times 0.5 = 0.2\\text{ mol}\\checkmark',
        speech: 'Check karo! Moles initially 2 times 0.1 = 0.2 moles. Final mein bhi 0.4 times 0.5 = 0.2 moles! Sab theek hai!',
        highlight: false
      },
      {
        label: 'Final Answer',
        math: '\\boxed{M_2 = 0.4\\text{ M}}',
        speech: 'Final molarity 0.4 M! Ye NEET mein bahut aata hai. Dilution simple hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-007',
    title: 'Organic Chemistry - Inductive Effect',
    titleHi: 'कार्बनिक रसायन - प्रेरक प्रभाव',
    icon: '💎',
    color: '#2196f3',
    exam: 'JEE Mains',
    subject: 'Chemistry',
    difficulty: 'Medium',
    chapter: 'General Organic Chemistry',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Arrange the following acids in increasing order of acidity: CH₃COOH, ClCH₂COOH, Cl₂CHCOOH, Cl₃CCOOH',
        speech: 'Acidity order nikalna hai! Sab acetic acid ke derivatives hain. Chlorine atoms inductive effect se acidity change kar rahe hain. Challenge ye samjhna ki kaunsa zyada acidic hai!',
        highlight: true
      },
      {
        label: 'Understanding Inductive Effect',
        math: '\\text{Cl atom: Electronegative}\\quad\\rightarrow\\quad\\text{Withdraws electron density}\\quad\\rightarrow\\quad\\text{Stabilizes conjugate base A}^-',
        speech: 'Chlorine atoms bahut electronegative hote hain. Electron withdraw karte hain. Isse -COOH group electronegative ban jata hai aur H+ nikalna aasan ho jata hai!',
        highlight: false
      },
      {
        label: 'Effect of Single Chlorine',
        math: '\\text{CH}_3\\text{COOH} < \\text{ClCH}_2\\text{COOH}\\quad\\text{(one Cl withdraws electrons)}',
        speech: 'Ek chlorine add karo toh acidity badhta hai! ClCH₂COOH, CH₃COOH se zyada acidic hai kyunki chlorine electron withdraw karta hai.',
        highlight: false
      },
      {
        label: 'Effect of Multiple Chlorines',
        math: 'Cl_2\\text{CHCOOH} > \\text{ClCH}_2\\text{COOH}\\quad\\text{(two Cl withdraw more electrons)}',
        speech: 'Do chlorine atoms ho toh zyada electron withdrawal! Inductive effect cumulative hota hai. Dono chlorines milakar strong -I effect dete hain.',
        highlight: false
      },
      {
        label: 'Maximum Effect with Three Chlorines',
        math: 'Cl_3\\text{CCOOH} > Cl_2\\text{CHCOOH}\\quad\\text{(maximum electron withdrawal)}',
        speech: 'Tin chlorine atoms! Maximum inductive effect! Ye sab se zyada acidic hoga. Isko trichloroacetic acid kehte hain.',
        highlight: true
      },
      {
        label: 'Comparative Acidity Order',
        math: '\\text{Ka values (approximately):}\\quad\\text{CH}_3\\text{COOH} < \\text{ClCH}_2\\text{COOH} < Cl_2\\text{CHCOOH} < Cl_3\\text{CCOOH}',
        speech: 'Toh final order! CH₃COOH < ClCH₂COOH < Cl₂CHCOOH < Cl₃CCOOH. Chlorine atoms jitne zyada, acidity utni zyada!',
        highlight: false
      },
      {
        label: 'Final Answer',
        math: '\\boxed{\\text{CH}_3\\text{COOH} < \\text{ClCH}_2\\text{COOH} < Cl_2\\text{CHCOOH} < Cl_3\\text{CCOOH}}',
        speech: 'Ye NEET mein bahut aata hai! GOC mein inductive effect samjho toh sab clear ho jayega. Chlorine zyada toh acidic zyada!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-008',
    title: 'Organic Reactions - Aldol Condensation',
    titleHi: 'कार्बनिक प्रतिक्रियाएं - अल्डोल संघनन',
    icon: '🧬',
    color: '#795548',
    exam: 'JEE Advanced',
    subject: 'Chemistry',
    difficulty: 'Hard',
    chapter: 'Aldehydes and Ketones',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Write the aldol condensation product when acetaldehyde reacts with itself in basic medium. Show the complete mechanism.',
        speech: 'Aldol condensation! Acetaldehyde doone units milakar bada molecule bante hain! Mechanism likhnee padegi. Base medium mein reaction hota hai.',
        highlight: true
      },
      {
        label: 'Aldol Condensation Definition',
        text: 'Aldol condensation: Nucleophilic addition of enolate/carbanion to carbonyl group, followed by dehydration',
        speech: 'Aldol matlab carbanion carbon aur aldehyde carbon milte hain. Carbanion nucleophile hai, carbonyl electrophile. Base se carbanion ban jata hai.',
        highlight: false
      },
      {
        label: 'Step 1: Enolate Formation',
        math: '\\text{CH}_3\\text{CHO} + \\text{OH}^- \\rightarrow \\text{CH}_2=\\text{CHO}^-\\text{ (enolate)} + \\text{H}_2\\text{O}',
        speech: 'Base OH minus, acetaldehyde ke alpha hydrogen ko remove karta hai. Enolate ban jata hai - ye carbanion hai aur nucleophile bhi!',
        highlight: true
      },
      {
        label: 'Step 2: Nucleophilic Addition',
        math: '\\text{CH}_2=\\text{CHO}^- + \\text{CH}_3\\text{CHO} \\rightarrow \\text{CH}_2(\\text{OH})\\text{CH(CHO)CH}_3',
        speech: 'Enolate, dusre acetaldehyde ke carbonyl carbon par attack karta hai. Aldoxide intermediate ban jata hai!',
        highlight: false
      },
      {
        label: 'Step 3: Protonation',
        math: '\\text{CH}_2(\\text{O}^-)\\text{CH(CHO)CH}_3 + \\text{H}_2\\text{O} \\rightarrow \\text{CH}_2(\\text{OH})\\text{CH(CHO)CH}_3',
        speech: 'Aldoxide ko paani se proton milta hai. Alcohol ban jata hai. Ab ye aldol hai!',
        highlight: false
      },
      {
        label: 'Step 4: Dehydration',
        math: '\\text{CH}_2(\\text{OH})\\text{CH(CHO)CH}_3 \\xrightarrow{\\text{heat, -H}_2\\text{O}} \\text{CH}_3\\text{CH}=\\text{CH}\\text{CHO}',
        speech: 'Heat dete ho toh water nikal jayega. Unsaturated aldehyde ban jayega - Crotonaldehyde! Ye final product hai aldol condensation ka!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{\\text{Product: CH}_3\\text{CH}=\\text{CHCHO (Crotonaldehyde)}}\\quad\\text{or}\\quad\\boxed{\\text{(E)-But-2-enal}}',
        speech: 'Final product crotonaldehyde bolta hai! IUPAC name: (E)-But-2-enal. Ye advanced mechanism hai - JEE Advanced mein aata hai! Alpha-beta unsaturated carbonyl compounds ke reactions bahut puchte hain!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-009',
    title: 'Thermochemistry - Hess\'s Law',
    titleHi: 'थर्मोकेमिस्ट्री - हेस का नियम',
    icon: '🔥',
    color: '#607d8b',
    exam: 'NEET',
    subject: 'Chemistry',
    difficulty: 'Medium',
    chapter: 'Thermodynamics',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Using Hess\'s Law, find ΔH for: C(s) + CO₂(g) → 2CO(g), given: [1] C(s) + O₂(g) → CO₂(g), ΔH₁ = -393.5 kJ and [2] 2CO(g) + O₂(g) → 2CO₂(g), ΔH₂ = -566 kJ',
        speech: 'Hess\'s Law! Enthalpy nikalnee hai. Diye hue reactions ko manipulate karo aur required reaction ban jaye! Ye thermochemistry mein bahut important hai.',
        highlight: true
      },
      {
        label: 'Hess\'s Law Principle',
        text: 'The enthalpy change of a reaction is independent of the pathway taken. If a reaction occurs in steps, the sum of enthalpy changes equals the total change.',
        speech: 'Hess\'s law ka matlab? Reaction step-by-step hote ya seedha, enthalpy change same hota hai! Addition aur subtraction karke answer nikalo.',
        highlight: false
      },
      {
        label: 'Target Reaction',
        math: '\\text{C(s)} + \\text{CO}_2(g) \\rightarrow 2\\text{CO(g)}\\quad\\Delta H = ?',
        speech: 'Ye hamara target reaction hai. Isska enthalpy nikalna hai!',
        highlight: false
      },
      {
        label: 'Apply Given Equations',
        math: '\\begin{align}\\text{[1] C(s)} + \\text{O}_2(g) &\\rightarrow \\text{CO}_2(g)\\quad &\\Delta H_1 = -393.5\\text{ kJ}\\\\\\text{[2] } 2\\text{CO(g)} + \\text{O}_2(g) &\\rightarrow 2\\text{CO}_2(g)\\quad &\\Delta H_2 = -566\\text{ kJ}\\end{align}',
        speech: 'Do equations diye hain. Pehla: Carbon plus oxygen se CO₂ ban raha hai. Dusra: CO plus oxygen se CO₂ ban raha hai!',
        highlight: false
      },
      {
        label: 'Hess\'s Law Manipulation',
        math: '\\begin{align}\\text{[1] } &\\text{C(s)} + \\text{O}_2(g) \\rightarrow \\text{CO}_2(g)\\quad &\\Delta H_1 = -393.5\\\\\\text{[2] (reversed)} &2\\text{CO}_2(g) \\rightarrow 2\\text{CO(g)} + \\text{O}_2(g)\\quad &\\Delta H = +566\\end{align}',
        speech: 'Equation [2] ko reverse karo! Direction badal jayega toh sign bhi badal jayega. -566 ko +566 kar do!',
        highlight: true
      },
      {
        label: 'Add the Equations',
        math: '\\begin{align}&\\text{C(s)} + \\text{O}_2(g) + 2\\text{CO}_2(g) \\rightarrow \\text{CO}_2(g) + 2\\text{CO(g)} + \\text{O}_2(g)\\\\&\\text{Cancel: O}_2 \\text{ and one CO}_2\\\\&\\text{Result: C(s)} + \\text{CO}_2(g) \\rightarrow 2\\text{CO(g)}\\\\&\\Delta H = \\Delta H_1 + \\Delta H_2^{\\text{reversed}} = -393.5 + 566 = 172.5\\text{ kJ}\\end{align}',
        speech: 'Dono equations add karo! Common terms cancel ho jayenge. C plus CO₂ ko 2CO milta hai! Enthalpy -393.5 plus 566 = +172.5 kJ. Positive matlab endothermic!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{\\Delta H = +172.5\\text{ kJ (endothermic)}}',
        speech: 'Answer! +172.5 kilojoule. Ye endothermic reaction hai - heat leta hai. Hess\'s law bilkul theek kaam karta hai! NEET mein ye zaroor aata hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  },
  {
    id: 'chem-010',
    title: 'Coordination Chemistry - IUPAC Naming',
    titleHi: 'समन्वय रसायन - IUPAC नामकरण',
    icon: '⚗️',
    color: '#3f51b5',
    exam: 'JEE Mains',
    subject: 'Chemistry',
    difficulty: 'Easy',
    chapter: 'Coordination Compounds',
    steps: [
      {
        label: 'Problem Statement',
        text: 'Give the IUPAC name of: [Co(NH₃)₄Cl₂]⁺',
        speech: 'Coordination complex ka IUPAC name likhnee hai! Cobalt center mein hai, 4 ammonia ligands, 2 chloride ligands. Name step-by-step nikalna hai!',
        highlight: true
      },
      {
        label: 'Identify Central Metal Ion',
        math: '\\text{Central metal: Co (Cobalt)}\\quad\\text{Oxidation state: ?}',
        speech: 'Central atom cobalt hai. Oxidation state figure karna padega. Ammonia neutral ligand hai, chloride -1 ligand hai.',
        highlight: false
      },
      {
        label: 'Determine Oxidation State',
        math: 'x + 4(0) + 2(-1) = +1\\quad\\Rightarrow\\quad x = +3\\quad\\text{(Co is in +3 state)}',
        speech: 'Co ka oxidation state ek aur dono charge. Ammonia neutral, chloride minus-1. Toh Co plus-3 hona chahiye! Co³⁺!',
        highlight: false
      },
      {
        label: 'List Ligands Alphabetically',
        math: '\\text{Ligands: NH}_3\\text{ (ammonia) and Cl}^-\\text{ (chloride)}\\quad\\text{Alphabetical order: }\\text{ammonia, chlorido}',
        speech: 'IUPAC mein ligands ka alphabetical order hota hai! Ammonia pehle aayega, chlorido dusre. Chloride ko "chlorido" likha jayega!',
        highlight: true
      },
      {
        label: 'Count and Name Ligands',
        math: 'NH_3: \\text{tetra- (4 ligands)} \\quad ; \\quad Cl^-: \\text{di- (2 ligands)}',
        speech: '4 ammonia = tetraammine. 2 chloride = dichlorido. Numbers prefix mein!',
        highlight: false
      },
      {
        label: 'Write Complete IUPAC Name',
        math: '\\text{[Co(NH}_3\\text{)}_4\\text{Cl}_2\\text{]}^+ \\rightarrow \\text{tetraamminedichloridocobalt(III)}\\text{ (or add }^+\\text{ if mentioning charge)}',
        speech: 'IUPAC name: Tetraamminedichloridocobalt(III). Sab ligands pehle, phir metal ka naam aur oxidation state bracket mein! Ek line mein likho!',
        highlight: true
      },
      {
        label: 'Final Answer',
        math: '\\boxed{\\text{tetraamminedichloridocobalt(III) or [tetraamminedichloridocobalt(III)]}}',
        speech: 'Final name! Tetraamminedichloridocobalt(III). Ye easy tha lekin rules yaad rehne chahiye. IUPAC naming coordination chemistry mein standard hai!',
        highlight: true,
        isAnswer: true
      }
    ]
  }
]
