/**
 * OTC Suggestions Database (India-specific)
 * Over-the-counter medication suggestions with common Indian brands
 *
 * IMPORTANT: These are SUGGESTIONS, not prescriptions.
 * Always recommend consulting a pharmacist or doctor.
 *
 * Layer 5: Guidance Generation from Ask CareBow specification
 */

// ============================================
// TYPES
// ============================================

export interface OTCMedication {
  id: string;
  generic: string;
  commonBrands: string[];
  use: string;
  howToTake: string;
  adultDose: string;
  maxDose?: string;
  cautions: string[];
  forChildren?: string;
  elderlyConsideration?: string;
}

export interface OTCCategory {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  medications: OTCMedication[];
  generalCautions: string[];
}

// ============================================
// DISCLAIMER
// ============================================

export const OTC_DISCLAIMER = `
IMPORTANT: These are general OTC suggestions commonly available in India.
This is NOT a prescription. Always:
• Read the label carefully and follow dosage instructions
• Check for contraindications with your existing conditions
• Inform the pharmacist about other medications you take
• Consult a pharmacist or doctor if unsure
• Stop use and seek medical help if symptoms worsen
• Never exceed recommended dosages
`;

// ============================================
// ELDERLY CONSIDERATIONS
// ============================================

export const ELDERLY_OTC_CONSIDERATIONS = {
  note: 'For elderly patients (60+), extra caution is needed with OTC medications:',
  points: [
    'Start with lower doses when possible',
    'Drug interactions are more likely with multiple medications',
    'Kidney and liver function may be reduced, affecting drug clearance',
    'Side effects may be more pronounced',
    'Always review OTC medications with existing prescriptions',
    'When in doubt, always consult doctor or pharmacist',
  ],
};

// ============================================
// OTC DATABASE
// ============================================

export const OTC_DATABASE: Record<string, OTCCategory> = {
  // ============================================
  // FEVER & PAIN
  // ============================================
  fever_pain: {
    id: 'fever_pain',
    name: 'Fever & Pain Relief',
    hindiName: 'Bukhar aur Dard ki Dawa',
    description: 'Medications for fever, headache, body ache, and mild to moderate pain',
    medications: [
      {
        id: 'paracetamol',
        generic: 'Paracetamol (Acetaminophen)',
        commonBrands: ['Crocin', 'Dolo 650', 'Calpol', 'Pacimol', 'Metacin'],
        use: 'Fever, mild to moderate pain, headache, body ache',
        howToTake: 'Take with water. Can be taken with or without food.',
        adultDose: '500mg-650mg every 4-6 hours as needed',
        maxDose: 'Do not exceed 3000mg (3g) in 24 hours. 4000mg absolute maximum.',
        cautions: [
          'Do NOT exceed recommended dose - liver damage risk',
          'Avoid alcohol when taking paracetamol',
          'Check with doctor if liver disease present',
          'Many cold medicines contain paracetamol - don\'t double up',
          'Read labels of all medicines to avoid overdose',
        ],
        forChildren: 'Use age-appropriate formulation (syrup) with weight-based dosing. Follow package instructions.',
        elderlyConsideration: 'Safe but use lower end of dose range. Check liver function if prolonged use.',
      },
      {
        id: 'ibuprofen',
        generic: 'Ibuprofen',
        commonBrands: ['Brufen', 'Combiflam', 'Ibugesic'],
        use: 'Pain, inflammation, fever, headache, menstrual cramps, joint pain',
        howToTake: 'Take with food to reduce stomach irritation.',
        adultDose: '200-400mg every 6-8 hours as needed',
        maxDose: 'Do not exceed 1200mg in 24 hours without medical advice',
        cautions: [
          'Take with food - can cause stomach irritation',
          'Avoid if history of stomach ulcers or GI bleeding',
          'Avoid if kidney problems or heart disease',
          'Not recommended in pregnancy (especially 3rd trimester)',
          'May interact with blood thinners and BP medications',
        ],
        forChildren: 'Use pediatric formulation only. Not for children under 6 months.',
        elderlyConsideration: 'Higher risk of GI and kidney issues. Use lowest effective dose for shortest time.',
      },
    ],
    generalCautions: [
      'Do not combine multiple pain relievers without medical advice',
      'If pain persists more than 3 days, consult a doctor',
      'Fever above 103°F needs medical evaluation',
    ],
  },

  // ============================================
  // ACIDITY & DIGESTIVE
  // ============================================
  acidity: {
    id: 'acidity',
    name: 'Acidity & Digestive Issues',
    hindiName: 'Acidity aur Pet ki Dawa',
    description: 'Medications for acidity, heartburn, indigestion, and gas',
    medications: [
      {
        id: 'antacid',
        generic: 'Antacids (Aluminum/Magnesium hydroxide)',
        commonBrands: ['Digene', 'Gelusil', 'Mucaine Gel', 'Eno'],
        use: 'Quick relief from acidity, heartburn, indigestion',
        howToTake: 'Chew tablets or take liquid/gel form. Best taken 1 hour after meals or when symptoms occur.',
        adultDose: 'Follow package directions. Typically 1-2 tablets or 10-20ml',
        cautions: [
          'Don\'t use for more than 2 weeks without consulting doctor',
          'Can interfere with absorption of other medications (take 2 hours apart)',
          'Magnesium-based can cause diarrhea',
          'Aluminum-based can cause constipation',
          'Avoid if kidney problems',
        ],
        elderlyConsideration: 'Watch for drug interactions with other medications.',
      },
      {
        id: 'ranitidine',
        generic: 'Famotidine (H2 Blocker)',
        commonBrands: ['Famtac', 'Topcid', 'Famocid'],
        use: 'Acid reduction for longer relief, prevents heartburn',
        howToTake: 'Take 10-20mg once or twice daily, before meals or at bedtime',
        adultDose: '10-20mg once or twice daily',
        cautions: [
          'Consult doctor if symptoms persist more than 2 weeks',
          'May interact with certain medications',
          'Inform doctor if kidney disease',
        ],
        elderlyConsideration: 'Adjust dose if kidney function reduced.',
      },
      {
        id: 'omeprazole',
        generic: 'Omeprazole (PPI)',
        commonBrands: ['Omez', 'Ocid', 'Pantocid (Pantoprazole)'],
        use: 'Stronger acid suppression for persistent acidity, GERD symptoms',
        howToTake: 'Take 20mg once daily, 30 minutes before breakfast',
        adultDose: '20mg once daily',
        cautions: [
          'Not for immediate relief - takes time to work',
          'Don\'t use long-term without doctor supervision',
          'May reduce vitamin B12 and magnesium absorption with prolonged use',
          'Consult doctor if symptoms persist beyond 2 weeks',
        ],
        elderlyConsideration: 'Long-term use linked to bone fracture risk in elderly.',
      },
      {
        id: 'antiflatulent',
        generic: 'Simethicone (Anti-gas)',
        commonBrands: ['Gas-O-Fast', 'Cremaffin (with simethicone)', 'Flatuna'],
        use: 'Relief from gas, bloating, flatulence',
        howToTake: 'Take after meals or when symptoms occur',
        adultDose: '40-125mg after meals and at bedtime',
        cautions: [
          'Very safe medication',
          'Can be taken with other medications',
        ],
        forChildren: 'Safe for infants with colic. Use infant drops.',
        elderlyConsideration: 'Safe for elderly.',
      },
    ],
    generalCautions: [
      'If acidity persists more than 2 weeks, see a doctor',
      'Watch for warning signs: difficulty swallowing, blood in vomit/stool, unexplained weight loss',
    ],
  },

  // ============================================
  // COLD & COUGH
  // ============================================
  cold_cough: {
    id: 'cold_cough',
    name: 'Cold & Cough',
    hindiName: 'Sardi Khansi ki Dawa',
    description: 'Medications for cold, cough, congestion, and related symptoms',
    medications: [
      {
        id: 'antihistamine',
        generic: 'Cetirizine / Loratadine (Antihistamine)',
        commonBrands: ['Cetzine', 'Zyrtec', 'Alerid', 'Lorfast', 'Claritin'],
        use: 'Runny nose, sneezing, watery eyes, allergies',
        howToTake: 'Take once daily, preferably at bedtime for cetirizine',
        adultDose: 'Cetirizine: 10mg once daily. Loratadine: 10mg once daily',
        cautions: [
          'Cetirizine may cause drowsiness - avoid driving',
          'Loratadine is less sedating',
          'Avoid alcohol',
          'Use caution if liver or kidney disease',
        ],
        forChildren: 'Use pediatric syrup. Cetirizine: 2.5-5mg based on age.',
        elderlyConsideration: 'Start with lower dose. Loratadine preferred due to less sedation.',
      },
      {
        id: 'decongestant',
        generic: 'Phenylephrine / Pseudoephedrine',
        commonBrands: ['Sinarest', 'Otrivin nasal drops', 'Nasivion'],
        use: 'Nasal congestion, stuffy nose, sinus pressure',
        howToTake: 'Oral: as directed. Nasal drops: 2-3 drops in each nostril',
        adultDose: 'Follow package directions. Nasal drops: max 3 days use',
        cautions: [
          'Do NOT use if high blood pressure or heart disease',
          'Do NOT use nasal sprays for more than 3 days (rebound congestion)',
          'Can cause insomnia and nervousness',
          'Avoid before bedtime',
          'Not safe in pregnancy',
        ],
        elderlyConsideration: 'Avoid if heart disease or hypertension. Can raise blood pressure.',
      },
      {
        id: 'cough_suppressant',
        generic: 'Dextromethorphan (DXM)',
        commonBrands: ['Benadryl DR', 'Torex', 'Corex DX'],
        use: 'Dry, non-productive cough',
        howToTake: 'Take as directed on package',
        adultDose: '10-20mg every 4-6 hours (max 120mg/day)',
        cautions: [
          'NOT for productive (wet) cough - you need to expel mucus',
          'Do not use with MAO inhibitors',
          'May cause drowsiness',
          'Check for other ingredients in combination products',
        ],
        forChildren: 'Not recommended under 4 years. Use pediatric formulation for older children.',
        elderlyConsideration: 'Start with lower dose.',
      },
      {
        id: 'expectorant',
        generic: 'Guaifenesin (Expectorant)',
        commonBrands: ['Ascoril', 'Ambrodil', 'Mucinex'],
        use: 'Productive cough with mucus - helps thin and expel mucus',
        howToTake: 'Take with plenty of water to help thin mucus',
        adultDose: '200-400mg every 4 hours (max 2400mg/day)',
        cautions: [
          'Drink plenty of fluids when taking',
          'Safe medication with few interactions',
        ],
        forChildren: 'Use pediatric formulation.',
        elderlyConsideration: 'Safe. Ensure adequate hydration.',
      },
      {
        id: 'throat_lozenge',
        generic: 'Throat Lozenges',
        commonBrands: ['Strepsils', 'Vicks', 'Halls', 'Cofsils'],
        use: 'Sore throat relief, minor throat irritation',
        howToTake: 'Dissolve slowly in mouth. Do not chew.',
        adultDose: '1 lozenge every 2-3 hours as needed',
        cautions: [
          'Don\'t exceed recommended number per day',
          'Not for children under 5 (choking risk)',
          'Check sugar content if diabetic',
        ],
        elderlyConsideration: 'Safe. Check for sugar content.',
      },
    ],
    generalCautions: [
      'Cold medicines often contain multiple ingredients - read labels carefully',
      'Don\'t combine multiple cold medicines',
      'See doctor if symptoms last more than 7-10 days',
      'See doctor if high fever, difficulty breathing, or chest pain',
    ],
  },

  // ============================================
  // DIARRHEA & VOMITING
  // ============================================
  diarrhea: {
    id: 'diarrhea',
    name: 'Diarrhea & Vomiting',
    hindiName: 'Dast aur Ulti ki Dawa',
    description: 'Medications for diarrhea, vomiting, and related dehydration',
    medications: [
      {
        id: 'ors',
        generic: 'Oral Rehydration Salts (ORS)',
        commonBrands: ['Electral', 'ORS WHO', 'Enerzal', 'Glucon-D ORS'],
        use: 'Dehydration from diarrhea, vomiting, fever, heat',
        howToTake: 'Dissolve 1 packet in 1 liter of clean water. Sip frequently.',
        adultDose: 'Drink as much as needed to replace fluid loss',
        cautions: [
          'Dissolve in correct amount of water - too concentrated or diluted is less effective',
          'Use within 24 hours after mixing',
          'Most important treatment for diarrhea-related dehydration',
        ],
        forChildren: 'Critical for children with diarrhea. Give frequently in small sips.',
        elderlyConsideration: 'Very important. Elderly dehydrate quickly.',
      },
      {
        id: 'loperamide',
        generic: 'Loperamide',
        commonBrands: ['Eldoper', 'Imodium', 'Lopamide'],
        use: 'Diarrhea (non-infectious)',
        howToTake: 'Take after each loose stool',
        adultDose: '4mg initially, then 2mg after each loose stool (max 16mg/day)',
        cautions: [
          'Do NOT use if fever or blood in stool - may be infectious diarrhea',
          'Do NOT use in children under 2 years',
          'Do NOT use for more than 2 days without medical advice',
          'ORS is more important than stopping diarrhea',
          'Don\'t use if abdominal pain is severe',
        ],
        forChildren: 'Not recommended under 6 years without medical advice.',
        elderlyConsideration: 'Use with caution. ORS more important.',
      },
      {
        id: 'antiemetic',
        generic: 'Ondansetron (for nausea/vomiting)',
        commonBrands: ['Emeset', 'Ondem', 'Vomikind'],
        use: 'Nausea and vomiting',
        howToTake: 'Dissolve on tongue or swallow with water',
        adultDose: '4-8mg as needed (max 24mg/day)',
        cautions: [
          'Generally requires prescription in India',
          'Don\'t use routinely - find cause of vomiting',
          'See doctor if vomiting persists',
        ],
        elderlyConsideration: 'Safe but watch for constipation.',
      },
      {
        id: 'zinc',
        generic: 'Zinc Supplements',
        commonBrands: ['Zincovit', 'Zinc tablets'],
        use: 'Reduces duration and severity of diarrhea (especially in children)',
        howToTake: 'Take with water after meals',
        adultDose: '20mg once daily for 10-14 days during diarrhea',
        cautions: [
          'WHO-recommended for childhood diarrhea',
          'May cause nausea if taken on empty stomach',
        ],
        forChildren: '10-20mg daily for 10-14 days. Important addition to ORS.',
        elderlyConsideration: 'Safe and beneficial.',
      },
    ],
    generalCautions: [
      'ORS is the most important treatment - preventing dehydration is priority',
      'See doctor if: blood in stool, high fever, severe abdominal pain, diarrhea lasting more than 2 days',
      'Avoid dairy and oily foods during diarrhea',
      'BRAT diet helpful: Banana, Rice, Applesauce, Toast',
    ],
  },

  // ============================================
  // TOPICAL (Skin, Muscle Pain)
  // ============================================
  topical: {
    id: 'topical',
    name: 'Topical Applications',
    hindiName: 'Lagane ki Dawa',
    description: 'Creams, gels, and ointments for external use',
    medications: [
      {
        id: 'pain_gel',
        generic: 'Diclofenac Gel / Ibuprofen Gel',
        commonBrands: ['Volini', 'Moov', 'Iodex', 'Omnigel', 'Relispray'],
        use: 'Muscle pain, joint pain, sprains, sports injuries',
        howToTake: 'Apply small amount to affected area. Massage gently. Wash hands after.',
        adultDose: 'Apply 3-4 times daily as needed',
        cautions: [
          'Do NOT apply on broken skin, wounds, or rashes',
          'Avoid contact with eyes and mucous membranes',
          'Wash hands thoroughly after application',
          'Don\'t use with heating pads',
          'May cause skin irritation in some people',
        ],
        elderlyConsideration: 'Safe. Preferable to oral pain relievers in elderly.',
      },
      {
        id: 'antiseptic_cream',
        generic: 'Povidone-iodine / Antiseptic cream',
        commonBrands: ['Betadine cream', 'Dettol antiseptic cream', 'Soframycin', 'Neosporin'],
        use: 'Minor cuts, wounds, burns, skin infections',
        howToTake: 'Clean wound first. Apply thin layer. Cover with bandage if needed.',
        adultDose: 'Apply 1-3 times daily',
        cautions: [
          'For external use only',
          'Betadine: avoid if iodine allergy or thyroid problems',
          'Seek medical help for deep wounds or animal bites',
          'Watch for signs of infection: increasing redness, pus, fever',
        ],
        elderlyConsideration: 'Safe. Wounds heal slower in elderly - monitor closely.',
      },
      {
        id: 'antifungal',
        generic: 'Clotrimazole / Miconazole',
        commonBrands: ['Candid', 'Canesten', 'Ring Guard', 'Daktarin'],
        use: 'Fungal skin infections (ringworm, athlete\'s foot, jock itch)',
        howToTake: 'Clean and dry area. Apply thin layer twice daily.',
        adultDose: 'Apply twice daily for 2-4 weeks',
        cautions: [
          'Continue use for 1-2 weeks after symptoms resolve',
          'Keep affected area dry',
          'Don\'t use on open wounds',
          'See doctor if no improvement in 2 weeks',
        ],
        elderlyConsideration: 'Safe. May need longer treatment course.',
      },
      {
        id: 'hydrocortisone',
        generic: 'Hydrocortisone Cream (mild steroid)',
        commonBrands: ['Fourderm', 'Dermadew', 'HC Cream'],
        use: 'Mild skin irritation, itching, rashes, eczema, insect bites',
        howToTake: 'Apply thin layer to affected area twice daily',
        adultDose: 'Apply sparingly, twice daily for max 1 week',
        cautions: [
          'Do NOT use on face for prolonged periods',
          'Do NOT use on infected skin',
          'Do NOT use for more than 1 week without medical advice',
          'Overuse can thin skin',
        ],
        forChildren: 'Use sparingly and for shortest duration. Avoid face.',
        elderlyConsideration: 'Skin is thinner - use very sparingly.',
      },
    ],
    generalCautions: [
      'Always do patch test if using product for first time',
      'Discontinue if irritation, redness, or allergic reaction occurs',
      'Read labels for specific warnings',
    ],
  },

  // ============================================
  // ALLERGY
  // ============================================
  allergy: {
    id: 'allergy',
    name: 'Allergy Relief',
    hindiName: 'Allergy ki Dawa',
    description: 'Medications for allergic reactions, hay fever, skin allergies',
    medications: [
      {
        id: 'cetirizine',
        generic: 'Cetirizine',
        commonBrands: ['Cetzine', 'Alerid', 'Okacet'],
        use: 'Allergic rhinitis, hay fever, urticaria (hives), itching',
        howToTake: 'Take once daily, preferably at bedtime',
        adultDose: '10mg once daily',
        cautions: [
          'May cause drowsiness - avoid driving',
          'Avoid alcohol',
          'Safe for long-term use if needed',
        ],
        forChildren: 'Syrup available. 2.5-5mg based on age.',
        elderlyConsideration: 'Start with 5mg. Less drowsiness than older antihistamines.',
      },
      {
        id: 'loratadine',
        generic: 'Loratadine',
        commonBrands: ['Lorfast', 'Alaspan', 'Claritin'],
        use: 'Allergic rhinitis, hay fever, hives - non-drowsy option',
        howToTake: 'Take once daily, any time',
        adultDose: '10mg once daily',
        cautions: [
          'Non-drowsy - preferred for daytime use',
          'Safe for most people',
        ],
        forChildren: 'Syrup available for children over 2 years.',
        elderlyConsideration: 'Preferred over cetirizine due to less sedation.',
      },
      {
        id: 'calamine',
        generic: 'Calamine Lotion',
        commonBrands: ['Calamine lotion', 'Lacto Calamine'],
        use: 'Skin itching, rashes, insect bites, sunburn, chickenpox',
        howToTake: 'Apply to affected area. Let dry. Can reapply as needed.',
        adultDose: 'Apply as needed throughout the day',
        cautions: [
          'For external use only',
          'May dry skin with prolonged use',
          'Very safe',
        ],
        forChildren: 'Safe for children and infants.',
        elderlyConsideration: 'Safe. May dry already dry elderly skin.',
      },
    ],
    generalCautions: [
      'For severe allergic reactions (difficulty breathing, swelling of face/throat), seek emergency help immediately',
      'Identify and avoid allergens when possible',
      'See doctor if symptoms persist or worsen',
    ],
  },

  // ============================================
  // EYE CARE
  // ============================================
  eye_care: {
    id: 'eye_care',
    name: 'Eye Care',
    hindiName: 'Aankhon ki Dawa',
    description: 'Eye drops for common eye problems',
    medications: [
      {
        id: 'lubricant_drops',
        generic: 'Lubricating Eye Drops (Artificial Tears)',
        commonBrands: ['Refresh Tears', 'Systane', 'I-Tears', 'Genteal'],
        use: 'Dry eyes, eye strain, computer eye strain',
        howToTake: 'Instill 1-2 drops in each eye as needed',
        adultDose: '1-2 drops 3-4 times daily or as needed',
        cautions: [
          'Safe for frequent use',
          'Preservative-free preferred for frequent use',
          'Don\'t touch dropper tip to eye',
          'Discard 1 month after opening',
        ],
        elderlyConsideration: 'Very safe. Elderly often have dry eyes.',
      },
      {
        id: 'antihistamine_drops',
        generic: 'Olopatadine / Ketotifen Eye Drops',
        commonBrands: ['Pataday', 'Winolap', 'Ketasma'],
        use: 'Allergic conjunctivitis (itchy, watery eyes from allergies)',
        howToTake: 'Instill 1 drop in each affected eye twice daily',
        adultDose: '1 drop twice daily',
        cautions: [
          'Remove contact lenses before use',
          'Wait 10 minutes before reinserting contacts',
          'May cause temporary stinging',
        ],
        forChildren: 'Generally safe for children over 3 years.',
        elderlyConsideration: 'Safe for elderly.',
      },
    ],
    generalCautions: [
      'Never use someone else\'s eye drops',
      'See eye doctor for: eye pain, vision changes, discharge, injury',
      'Don\'t use redness-relief drops for more than 3 days',
      'Wash hands before applying eye drops',
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OTC suggestions for a symptom category
 */
export function getOTCForSymptom(symptom: string): OTCCategory | undefined {
  const mapping: Record<string, string> = {
    fever: 'fever_pain',
    pain: 'fever_pain',
    headache: 'fever_pain',
    acidity: 'acidity',
    heartburn: 'acidity',
    indigestion: 'acidity',
    gas: 'acidity',
    cold: 'cold_cough',
    cough: 'cold_cough',
    congestion: 'cold_cough',
    diarrhea: 'diarrhea',
    vomiting: 'diarrhea',
    nausea: 'diarrhea',
    muscle_pain: 'topical',
    joint_pain: 'topical',
    wound: 'topical',
    cut: 'topical',
    allergy: 'allergy',
    rash: 'allergy',
    itching: 'allergy',
    dry_eyes: 'eye_care',
    eye_strain: 'eye_care',
  };

  const categoryKey = mapping[symptom.toLowerCase()];
  return categoryKey ? OTC_DATABASE[categoryKey] : undefined;
}

/**
 * Filter OTC medications based on user profile
 */
export function filterOTCForProfile(
  medications: OTCMedication[],
  profile: {
    age?: number;
    isPregnant?: boolean;
    hasHeartDisease?: boolean;
    hasKidneyDisease?: boolean;
    hasLiverDisease?: boolean;
    isOnBloodThinners?: boolean;
  }
): OTCMedication[] {
  return medications.filter(med => {
    const cautionsText = med.cautions.join(' ').toLowerCase();

    if (profile.isPregnant && cautionsText.includes('pregnancy')) return false;
    if (profile.hasHeartDisease && cautionsText.includes('heart')) return false;
    if (profile.hasKidneyDisease && cautionsText.includes('kidney')) return false;
    if (profile.hasLiverDisease && cautionsText.includes('liver')) return false;
    if (profile.isOnBloodThinners && cautionsText.includes('blood thin')) return false;

    // Elderly considerations
    if (profile.age && profile.age >= 60) {
      // Still include but will show elderly consideration
    }

    return true;
  });
}

/**
 * Get priority OTC recommendations for a category
 */
export function getPriorityOTC(categoryKey: string, limit: number = 2): OTCMedication[] {
  const category = OTC_DATABASE[categoryKey];
  if (!category) return [];

  // Prioritize safer, more commonly used options
  return category.medications.slice(0, limit);
}

/**
 * Get OTC disclaimer formatted for display
 */
export function getFormattedDisclaimer(): string {
  return OTC_DISCLAIMER.trim();
}

/**
 * Check if user needs elderly considerations
 */
export function needsElderlyConsiderations(age?: number): boolean {
  return age !== undefined && age >= 60;
}
