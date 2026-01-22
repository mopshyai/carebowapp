/**
 * Ayurvedic & Traditional Remedies Database
 * Classical formulations and traditional practices from Ayurveda
 *
 * Layer 5: Guidance Generation from Ask CareBow specification
 */

// ============================================
// TYPES
// ============================================

export type FormulationType = 'churna' | 'kwath' | 'tablet' | 'syrup' | 'oil' | 'paste' | 'rasayana';

export interface AyurvedicFormulation {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  traditionalUse: string[];
  form: FormulationType;
  howToUse: string;
  bestFor: string[];
  contraindications: string[];
  note?: string;
  researchSupported: boolean;
}

export type Season = 'summer' | 'monsoon' | 'autumn' | 'winter' | 'spring';
export type SeasonHindi = 'Grishma' | 'Varsha' | 'Sharad' | 'Hemant' | 'Vasant';

export interface SeasonalRecommendation {
  season: Season;
  seasonHindi: SeasonHindi;
  indianMonths: string;
  recommendations: string[];
  foodsToFavor: string[];
  foodsToAvoid: string[];
  commonIssues: string[];
  preventiveMeasures: string[];
}

export interface LifestyleRecommendation {
  category: 'morning' | 'eating' | 'evening' | 'sleep' | 'exercise';
  practices: string[];
  hindiTerms?: Record<string, string>;
}

// ============================================
// CLASSICAL AYURVEDIC FORMULATIONS
// ============================================

export const AYURVEDIC_FORMULATIONS: Record<string, AyurvedicFormulation> = {
  triphala: {
    id: 'triphala',
    name: 'Triphala',
    hindiName: 'Triphala',
    description: 'A blend of three fruits - Amalaki (Indian Gooseberry), Bibhitaki, and Haritaki. One of the most well-researched Ayurvedic formulations.',
    traditionalUse: [
      'Digestive health and regularity',
      'Gentle colon cleansing',
      'Antioxidant and rejuvenation',
      'Eye health support',
      'Detoxification',
    ],
    form: 'churna',
    howToUse: 'Mix 1/2 to 1 tsp Triphala powder in warm water. Take at bedtime, at least 2 hours after dinner.',
    bestFor: ['constipation', 'digestion', 'general_wellness', 'detox', 'immunity'],
    contraindications: ['pregnancy', 'breastfeeding', 'diarrhea', 'children_under_12'],
    note: 'Well-researched Ayurvedic formulation with proven antioxidant properties. Safe for most adults when used appropriately.',
    researchSupported: true,
  },

  chyawanprash: {
    id: 'chyawanprash',
    name: 'Chyawanprash',
    hindiName: 'Chyawanprash',
    description: 'Traditional Ayurvedic immunity tonic with Amla as the primary ingredient along with many herbs and spices.',
    traditionalUse: [
      'Immunity boosting',
      'Respiratory health',
      'General vitality and energy',
      'Healthy aging',
      'Digestive support',
    ],
    form: 'rasayana',
    howToUse: 'Take 1-2 tsp daily with warm milk or water. Can be taken morning or evening.',
    bestFor: ['immunity', 'respiratory_health', 'energy', 'general_wellness', 'cold_prevention'],
    contraindications: ['diabetes_check_sugar_content'],
    note: 'Popular and generally safe immunity booster. Check sugar content if diabetic - sugar-free versions available.',
    researchSupported: true,
  },

  trikatu: {
    id: 'trikatu',
    name: 'Trikatu',
    hindiName: 'Trikatu',
    description: 'A warming blend of black pepper (Kali Mirch), long pepper (Pippali), and ginger (Sonth).',
    traditionalUse: [
      'Stimulating digestive fire (Agni)',
      'Respiratory congestion relief',
      'Metabolism support',
      'Cold and cough relief',
    ],
    form: 'churna',
    howToUse: 'Take 1/4 to 1/2 tsp with honey or warm water before meals.',
    bestFor: ['digestion', 'congestion', 'respiratory', 'metabolism', 'cold'],
    contraindications: ['gastritis', 'ulcers', 'pregnancy', 'pitta_constitution', 'acid_reflux'],
    note: 'Very heating in nature. Not for those with acidity or ulcer issues. Best in cold weather.',
    researchSupported: true,
  },

  ashwagandha: {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    hindiName: 'Ashwagandha',
    description: 'Powerful adaptogenic herb known as "Indian Ginseng" for stress relief and vitality.',
    traditionalUse: [
      'Stress and anxiety management',
      'Sleep improvement',
      'Strength and vitality',
      'Cognitive support',
      'Male reproductive health',
    ],
    form: 'churna',
    howToUse: 'Take 1/4 to 1/2 tsp powder with warm milk at bedtime. Capsules: 300-500mg twice daily.',
    bestFor: ['stress', 'sleep', 'weakness', 'fatigue', 'anxiety', 'stamina'],
    contraindications: ['pregnancy', 'thyroid_conditions_consult', 'autoimmune_diseases', 'surgery_stop_2_weeks_before'],
    note: 'One of the most researched Ayurvedic herbs. Consult doctor if you have thyroid conditions.',
    researchSupported: true,
  },

  giloy: {
    id: 'giloy',
    name: 'Giloy (Guduchi)',
    hindiName: 'Giloy / Guduchi',
    description: 'Known as "Amrita" (nectar of immortality), a powerful immunity-boosting herb.',
    traditionalUse: [
      'Immunity enhancement',
      'Fever management',
      'Detoxification',
      'Liver support',
      'Chronic infections',
    ],
    form: 'kwath',
    howToUse: 'Take 2-3 tbsp giloy juice or 1/2 tsp powder with water. Can also boil stem pieces to make kadha.',
    bestFor: ['fever', 'immunity', 'chronic_infections', 'liver_health', 'dengue_support'],
    contraindications: ['autoimmune_diseases', 'pregnancy', 'surgery_stop_2_weeks_before', 'diabetes_monitor_sugar'],
    note: 'Research supported for immunity. Became popular during COVID. Consult if on immunosuppressants.',
    researchSupported: true,
  },

  brahmi: {
    id: 'brahmi',
    name: 'Brahmi',
    hindiName: 'Brahmi',
    description: 'Brain tonic herb known for cognitive enhancement and calming properties.',
    traditionalUse: [
      'Memory and concentration',
      'Anxiety and stress relief',
      'Sleep support',
      'Mental clarity',
      'Nervous system support',
    ],
    form: 'churna',
    howToUse: 'Take 1/4 to 1/2 tsp powder with warm water or milk. Can also be applied as oil to scalp.',
    bestFor: ['memory', 'concentration', 'anxiety', 'stress', 'sleep', 'mental_clarity'],
    contraindications: ['pregnancy', 'thyroid_medications_may_interact'],
    note: 'Well-researched for cognitive benefits. May have mild sedative effect.',
    researchSupported: true,
  },

  shatavari: {
    id: 'shatavari',
    name: 'Shatavari',
    hindiName: 'Shatavari',
    description: 'Known as the "Queen of Herbs" for women\'s health and hormonal balance.',
    traditionalUse: [
      'Women\'s reproductive health',
      'Hormonal balance',
      'Lactation support',
      'Digestive soothing',
      'Vitality and stamina',
    ],
    form: 'churna',
    howToUse: 'Take 1/4 to 1/2 tsp powder with milk or warm water, twice daily.',
    bestFor: ['womens_health', 'hormonal_balance', 'lactation', 'acidity', 'weakness'],
    contraindications: ['hormone_sensitive_conditions', 'kidney_disease', 'estrogen_sensitive_cancers'],
    note: 'Traditional herb for women. Consult doctor if you have hormone-sensitive conditions.',
    researchSupported: true,
  },

  arjuna: {
    id: 'arjuna',
    name: 'Arjuna',
    hindiName: 'Arjun',
    description: 'Heart-healthy herb from the bark of Arjuna tree, used for cardiovascular support.',
    traditionalUse: [
      'Heart health support',
      'Blood pressure management',
      'Cholesterol support',
      'Cardiac muscle strength',
    ],
    form: 'churna',
    howToUse: 'Take 1/4 to 1/2 tsp powder with warm water or milk, twice daily. Best taken empty stomach.',
    bestFor: ['heart_health', 'blood_pressure', 'cholesterol', 'cardiac_support'],
    contraindications: ['heart_medications_consult', 'blood_thinners', 'low_blood_pressure'],
    note: 'Research supported for heart health. Must consult doctor if on heart medications.',
    researchSupported: true,
  },

  tulsi: {
    id: 'tulsi',
    name: 'Tulsi (Holy Basil)',
    hindiName: 'Tulsi',
    description: 'Sacred plant known as the "Queen of Herbs" with broad therapeutic benefits.',
    traditionalUse: [
      'Respiratory health',
      'Immunity boosting',
      'Stress adaptation',
      'Antimicrobial action',
      'Fever management',
    ],
    form: 'kwath',
    howToUse: 'Chew 5-6 fresh leaves daily, or make tea by boiling leaves. Can also take as drops or capsules.',
    bestFor: ['cold', 'cough', 'fever', 'immunity', 'stress', 'respiratory'],
    contraindications: ['pregnancy_high_amounts', 'blood_thinners', 'surgery_stop_2_weeks_before'],
    note: 'Very safe herb. Available fresh in most Indian households. Well-researched.',
    researchSupported: true,
  },

  haritaki: {
    id: 'haritaki',
    name: 'Haritaki',
    hindiName: 'Harad',
    description: 'One of the three fruits in Triphala, known as "King of Medicines" in Ayurveda.',
    traditionalUse: [
      'Digestive health',
      'Constipation relief',
      'Detoxification',
      'Eye health',
      'Anti-aging',
    ],
    form: 'churna',
    howToUse: 'Take 1/2 tsp powder with warm water at bedtime.',
    bestFor: ['constipation', 'digestion', 'detox', 'eye_health'],
    contraindications: ['pregnancy', 'diarrhea', 'dehydration', 'extreme_weakness'],
    note: 'Gentle yet effective for bowel regulation. Part of Triphala.',
    researchSupported: true,
  },

  neem: {
    id: 'neem',
    name: 'Neem',
    hindiName: 'Neem',
    description: 'Bitter herb known for blood purification and antimicrobial properties.',
    traditionalUse: [
      'Blood purification',
      'Skin health',
      'Antimicrobial action',
      'Dental health',
      'Fever management',
    ],
    form: 'tablet',
    howToUse: 'Take neem tablets as directed, or apply neem paste externally. Neem juice: 2 tbsp diluted in water.',
    bestFor: ['skin_issues', 'blood_purification', 'acne', 'infections', 'dental_health'],
    contraindications: ['pregnancy', 'trying_to_conceive', 'autoimmune_diseases', 'diabetes_monitor'],
    note: 'Very bitter but powerful. External use generally safe for all.',
    researchSupported: true,
  },

  amalaki: {
    id: 'amalaki',
    name: 'Amalaki (Amla)',
    hindiName: 'Amla',
    description: 'Indian Gooseberry, one of the richest sources of Vitamin C and a powerful rejuvenative.',
    traditionalUse: [
      'Immunity boosting',
      'Hair health',
      'Skin health',
      'Digestive support',
      'Anti-aging',
    ],
    form: 'churna',
    howToUse: 'Take 1/2 to 1 tsp powder with water or honey. Fresh juice: 2-3 tbsp. Can also eat fresh amla.',
    bestFor: ['immunity', 'hair_health', 'skin_health', 'vitamin_c', 'digestion', 'anti_aging'],
    contraindications: ['diarrhea_may_worsen'],
    note: 'Very safe and beneficial. One of the best sources of natural Vitamin C. Part of Triphala.',
    researchSupported: true,
  },
};

// ============================================
// SEASONAL RECOMMENDATIONS (RITUCHARYA)
// ============================================

export const SEASONAL_RECOMMENDATIONS: Record<Season, SeasonalRecommendation> = {
  summer: {
    season: 'summer',
    seasonHindi: 'Grishma',
    indianMonths: 'April - June (Vaishakh - Jyeshtha)',
    recommendations: [
      'Stay hydrated with cooling drinks - aam panna, nimbu paani, coconut water, buttermilk',
      'Include cooling foods - cucumber, watermelon, curd, khus sherbet',
      'Avoid excess spicy, sour, and salty foods that generate heat',
      'Rose water (gulab jal) in drinking water is cooling',
      'Apply sandalwood paste on forehead for cooling',
      'Wear light, loose cotton clothing in light colors',
      'Avoid excessive physical exertion during peak sun hours',
      'Sleep on terrace or cool room, afternoon rest (siesta) is recommended',
    ],
    foodsToFavor: [
      'Watermelon, muskmelon, cucumber',
      'Coconut water, sugarcane juice',
      'Buttermilk (chaas), lassi',
      'Mint, coriander',
      'Rice, sattu drink',
      'Gulkand (rose petal jam)',
    ],
    foodsToAvoid: [
      'Very spicy foods',
      'Excessive sour foods',
      'Heavy fried foods',
      'Excessive salt',
      'Alcohol',
      'Red meat',
    ],
    commonIssues: ['heat_stroke', 'dehydration', 'skin_rashes', 'prickly_heat', 'digestive_issues', 'sunburn'],
    preventiveMeasures: [
      'Drink 10-12 glasses of water daily',
      'Avoid going out between 11 AM - 4 PM',
      'Cover head when in sun',
      'Eat light, easily digestible meals',
      'Include sattu, bael sherbet in diet',
    ],
  },

  monsoon: {
    season: 'monsoon',
    seasonHindi: 'Varsha',
    indianMonths: 'July - September (Shravan - Bhadrapad)',
    recommendations: [
      'Drink only boiled/filtered water - waterborne diseases peak',
      'Include ginger, tulsi, and black pepper in diet for immunity',
      'Avoid raw salads and street food - contamination risk high',
      'Eat light, warm, freshly cooked meals only',
      'Keep surroundings dry to prevent fungal infections',
      'Use neem or turmeric for skin protection',
      'Dry feet thoroughly, especially between toes',
      'Fumigate home with neem leaves or dhoop',
    ],
    foodsToFavor: [
      'Warm soups and kadha',
      'Ginger, garlic, turmeric, pepper',
      'Honey (antibacterial)',
      'Light grains - old rice, jowar, bajra',
      'Moong dal (easy to digest)',
      'Bitter gourd (karela) for immunity',
    ],
    foodsToAvoid: [
      'Raw salads and uncooked vegetables',
      'Street food and cut fruits',
      'Heavy, oily, fried foods',
      'Curd at night (increases mucus)',
      'Leafy vegetables (may harbor worms)',
      'Cold drinks',
    ],
    commonIssues: ['digestive_infections', 'skin_fungal', 'fever', 'joint_pain_aggravation', 'dengue', 'malaria', 'typhoid', 'leptospirosis'],
    preventiveMeasures: [
      'Ensure no water stagnation around home (mosquito breeding)',
      'Use mosquito repellents and nets',
      'Wash hands frequently',
      'Avoid wading through dirty water',
      'Keep wounds covered and clean',
      'Boost immunity with kadha and giloy',
    ],
  },

  autumn: {
    season: 'autumn',
    seasonHindi: 'Sharad',
    indianMonths: 'September - November (Ashwin - Kartik)',
    recommendations: [
      'Gradually transition from monsoon diet to normal',
      'Include bitter foods (karela, methi, neem) to balance Pitta',
      'Moon bathing (chandrabindu) is traditionally recommended',
      'Light exercise, avoid excess exertion',
      'Apply sandalwood and camphor for cooling residual summer heat',
      'Medicated ghee (Ghrita) is beneficial',
      'Purgation therapy (Virechana) recommended in this season',
    ],
    foodsToFavor: [
      'Bitter vegetables - karela, methi',
      'Light, sweet, and bitter foods',
      'Ghee (in moderation)',
      'Sweet fruits',
      'Honey water',
      'Light grains - rice, wheat',
    ],
    foodsToAvoid: [
      'Heavy, oily foods',
      'Sour foods in excess',
      'Curd (especially at night)',
      'Alkaline foods in excess',
    ],
    commonIssues: ['pitta_imbalance', 'skin_issues', 'digestive_issues', 'fever', 'acidity'],
    preventiveMeasures: [
      'Pitta-balancing diet',
      'Moderate exercise',
      'Stay cool during day',
      'Include bitter and astringent tastes',
    ],
  },

  winter: {
    season: 'winter',
    seasonHindi: 'Hemant',
    indianMonths: 'November - February (Margashirsha - Magh)',
    recommendations: [
      'Include warming spices - ginger, black pepper, cinnamon, cloves',
      'Oil massage (Abhyanga) is highly beneficial and recommended daily',
      'Include ghee in diet - supports digestion and warmth',
      'Warm, nourishing foods and hot fluids',
      'Chyawanprash daily for immunity',
      'Sesame oil for massage and cooking',
      'Sun exposure is beneficial',
      'Exercise vigorously - digestive fire is strong',
    ],
    foodsToFavor: [
      'Ghee, butter, oils',
      'Warm milk with turmeric or nuts',
      'Nuts and dry fruits - almonds, walnuts, dates',
      'Jaggery (gur)',
      'Root vegetables',
      'Heavy grains - wheat, urad dal',
      'Warm spices - ginger, pepper, cinnamon',
      'Meat soups (for non-vegetarians)',
    ],
    foodsToAvoid: [
      'Cold foods and drinks',
      'Raw foods',
      'Light, dry foods',
      'Excessive fasting',
    ],
    commonIssues: ['cold', 'cough', 'joint_pain', 'dry_skin', 'flu', 'allergies', 'asthma_aggravation'],
    preventiveMeasures: [
      'Regular oil massage with warm sesame oil',
      'Keep body warm, especially chest and feet',
      'Take Chyawanprash daily',
      'Steam inhalation if congested',
      'Stay active and exercise regularly',
      'Sunbathe when possible',
    ],
  },

  spring: {
    season: 'spring',
    seasonHindi: 'Vasant',
    indianMonths: 'February - April (Phalgun - Chaitra)',
    recommendations: [
      'Light, dry foods to counter accumulated Kapha',
      'Include honey in diet (not heated)',
      'Reduce heavy, oily, sweet foods',
      'Increase physical activity - best season for exercise',
      'Neem and turmeric for blood purification',
      'Fasting or light eating beneficial',
      'Nasal cleansing (Nasya) recommended',
      'Time for panchakarma detox',
    ],
    foodsToFavor: [
      'Barley, millet, old rice',
      'Honey (unheated)',
      'Warm water with honey',
      'Bitter and pungent vegetables',
      'Light, dry, warm foods',
      'Ginger, pepper, garlic',
    ],
    foodsToAvoid: [
      'Heavy, oily foods',
      'Sweet and sour foods in excess',
      'Cold foods and drinks',
      'Dairy products in excess',
      'Day sleeping (increases Kapha)',
    ],
    commonIssues: ['allergies', 'respiratory_issues', 'sluggish_digestion', 'hay_fever', 'cold', 'kapha_imbalance'],
    preventiveMeasures: [
      'Exercise regularly and vigorously',
      'Avoid day sleeping',
      'Dry massage (Udvartana) beneficial',
      'Include honey and warm water',
      'Detox with Triphala',
      'Neem leaves for blood purification',
    ],
  },
};

// ============================================
// DAILY LIFESTYLE RECOMMENDATIONS (DINACHARYA)
// ============================================

export const LIFESTYLE_RECOMMENDATIONS: LifestyleRecommendation[] = [
  {
    category: 'morning',
    practices: [
      'Wake before sunrise (ideally around 5-6 AM) - Brahma Muhurta',
      'Drink 1-2 glasses of warm water first thing (Ushapan)',
      'Empty bowels and bladder - establish regular routine',
      'Tongue scraping (Jihwa Prakshalana) to remove overnight toxins',
      'Oil pulling (Gandusha) - swish sesame/coconut oil for 5-10 minutes',
      'Nasal drops (Nasya) - 2 drops of medicated oil in each nostril',
      'Self-massage with warm oil (Abhyanga) - even 5 minutes helps',
      'Exercise (Vyayama) - yoga, walking, or workout appropriate for your constitution',
      'Bathe with warm water',
      'Meditation and prayer (Dhyana)',
    ],
    hindiTerms: {
      'brahma_muhurta': 'Brahma Muhurta - Divine Hour',
      'ushapan': 'Ushapan - Morning Water',
      'abhyanga': 'Abhyanga - Oil Massage',
      'gandusha': 'Gandusha - Oil Pulling',
      'nasya': 'Nasya - Nasal Treatment',
    },
  },
  {
    category: 'eating',
    practices: [
      'Eat largest meal at lunch when digestive fire (Agni) is strongest',
      'Eat in a calm, quiet environment - not in front of TV or phone',
      'Chew food thoroughly - at least 32 times per bite',
      'Don\'t drink ice-cold water with meals - room temperature is best',
      'Leave 1/3 of stomach empty after meals',
      'Sit quietly for 5-10 minutes after eating before activity',
      'Don\'t exercise immediately after eating',
      'Include all 6 tastes in meals - sweet, sour, salty, pungent, bitter, astringent',
      'Avoid incompatible food combinations (Viruddha Ahara)',
      'Dinner should be lightest meal, eaten before sunset if possible',
    ],
    hindiTerms: {
      'agni': 'Agni - Digestive Fire',
      'viruddha_ahara': 'Viruddha Ahara - Incompatible Foods',
    },
  },
  {
    category: 'evening',
    practices: [
      'Light dinner before sunset or at least 2-3 hours before sleep',
      'Avoid heavy, difficult to digest foods at night',
      'Gentle walk of 100 steps (Shatpavli) after dinner',
      'Avoid intense mental work or screens in evening',
      'Wind down with calming activities - reading, light music',
      'Apply oil to feet before bed',
      'Avoid arguments, intense discussions at night',
    ],
    hindiTerms: {
      'shatpavli': 'Shatpavli - 100 Steps Walk',
    },
  },
  {
    category: 'sleep',
    practices: [
      'Aim to sleep by 10 PM - before Pitta time (10 PM - 2 AM)',
      'Apply warm oil to soles of feet before bed',
      'Sleep on left side to aid digestion',
      'Keep bedroom clean, dark, and calm',
      'Avoid daytime sleep (except in summer, for elderly, or when ill)',
      'Minimum 7-8 hours of sleep needed',
      'Avoid eating, reading, or watching TV in bed',
      'Wash feet before entering bed',
    ],
    hindiTerms: {
      'pitta_time': 'Pitta Kaal - 10 PM to 2 AM',
    },
  },
  {
    category: 'exercise',
    practices: [
      'Exercise according to your constitution (Prakriti)',
      'Best time for exercise is early morning',
      'Exercise to half capacity - when sweat appears on forehead and armpits',
      'Yoga and pranayama (breathing exercises) suitable for all',
      'Walking is the safest exercise for everyone',
      'Avoid exercise during acute illness or extreme weather',
      'Cool down properly after exercise',
      'Oil massage before exercise is beneficial',
    ],
    hindiTerms: {
      'prakriti': 'Prakriti - Body Constitution',
      'pranayama': 'Pranayama - Breathing Exercises',
    },
  },
];

// ============================================
// INCOMPATIBLE FOOD COMBINATIONS (VIRUDDHA AHARA)
// ============================================

export const INCOMPATIBLE_COMBINATIONS = [
  {
    combination: 'Milk + Sour fruits',
    foods: ['Milk with oranges, lemon, pineapple, or other sour fruits'],
    reason: 'Curdles milk, creates toxins, digestive issues',
  },
  {
    combination: 'Milk + Fish',
    foods: ['Any combination of milk and fish'],
    reason: 'Can cause skin disorders and digestive issues',
  },
  {
    combination: 'Honey + Hot water',
    foods: ['Heating honey or adding to very hot drinks'],
    reason: 'Creates toxins according to Ayurveda. Add honey only to lukewarm liquids.',
  },
  {
    combination: 'Milk + Banana',
    foods: ['Banana milkshake'],
    reason: 'Creates heaviness, dulls digestion, may cause cold',
    note: 'Very common combination but traditionally considered incompatible',
  },
  {
    combination: 'Curd at night',
    foods: ['Eating curd/yogurt after sunset'],
    reason: 'Increases Kapha, causes congestion and sluggish digestion',
  },
  {
    combination: 'Ghee + Honey in equal quantities',
    foods: ['Equal amounts of ghee and honey mixed'],
    reason: 'Considered toxic in equal quantities. Unequal amounts are fine.',
  },
  {
    combination: 'Cold water after meal',
    foods: ['Ice-cold drinks immediately after eating'],
    reason: 'Dampens digestive fire, causes improper digestion',
  },
  {
    combination: 'Radish + Milk',
    foods: ['Mooli with milk or milk products'],
    reason: 'Can cause skin disorders',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get formulations for a specific health concern
 */
export function getFormulationsForConcern(concern: string): AyurvedicFormulation[] {
  const normalizedConcern = concern.toLowerCase();
  return Object.values(AYURVEDIC_FORMULATIONS).filter(
    f => f.bestFor.some(b => b.toLowerCase().includes(normalizedConcern) ||
                            normalizedConcern.includes(b.toLowerCase()))
  );
}

/**
 * Get current season based on month
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11

  if (month >= 3 && month <= 5) return 'summer';      // April-June
  if (month >= 6 && month <= 8) return 'monsoon';     // July-September
  if (month === 9 || month === 10) return 'autumn';   // October-November
  if (month >= 11 || month <= 1) return 'winter';     // December-February
  return 'spring'; // February-April
}

/**
 * Get seasonal recommendations for current season
 */
export function getCurrentSeasonalRecommendations(): SeasonalRecommendation {
  return SEASONAL_RECOMMENDATIONS[getCurrentSeason()];
}

/**
 * Filter formulations based on contraindications
 */
export function filterFormulationsForProfile(
  formulations: AyurvedicFormulation[],
  profile: {
    isPregnant?: boolean;
    hasThyroid?: boolean;
    hasAutoimmune?: boolean;
    hasHeartCondition?: boolean;
    conditions?: string[];
  }
): AyurvedicFormulation[] {
  return formulations.filter(f => {
    for (const contraindication of f.contraindications) {
      if (contraindication.includes('pregnancy') && profile.isPregnant) return false;
      if (contraindication.includes('thyroid') && profile.hasThyroid) return false;
      if (contraindication.includes('autoimmune') && profile.hasAutoimmune) return false;
      if (contraindication.includes('heart') && profile.hasHeartCondition) return false;
    }
    return true;
  });
}

/**
 * Get lifestyle recommendations by category
 */
export function getLifestyleByCategory(category: LifestyleRecommendation['category']): LifestyleRecommendation | undefined {
  return LIFESTYLE_RECOMMENDATIONS.find(r => r.category === category);
}
