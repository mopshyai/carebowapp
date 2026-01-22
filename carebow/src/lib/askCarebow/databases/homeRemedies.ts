/**
 * Home Remedies Database (Gharelu Nuskhe)
 * India-specific traditional home remedies
 *
 * Layer 5: Guidance Generation from Ask CareBow specification
 */

// ============================================
// TYPES
// ============================================

export type RemedyEffectiveness = 'high' | 'moderate' | 'low';
export type EvidenceLevel = 'well-researched' | 'traditional' | 'Ayurvedic' | 'anecdotal';

export interface Contraindication {
  condition: string;
  reason?: string;
}

export interface HomeRemedy {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  howTo: string;
  timing: string;
  effectiveness: RemedyEffectiveness;
  evidenceLevel: EvidenceLevel;
  contraindications: string[];
  suitableFor: string[];
  safetyNote?: string;
  importantNote?: string;
}

export interface ConditionRemedies {
  id: string;
  name: string;
  hindiName: string;
  remedies: HomeRemedy[];
  lifestyleAdvice: string[];
  warningSignsToWatch: string[];
}

// ============================================
// HOME REMEDIES DATABASE
// ============================================

export const HOME_REMEDIES_DB: Record<string, ConditionRemedies> = {
  // ============================================
  // DIGESTIVE ISSUES
  // ============================================
  acidity: {
    id: 'acidity',
    name: 'Acidity / Heartburn',
    hindiName: 'Acidity / Seene mein jalan',
    remedies: [
      {
        id: 'cold_milk',
        name: 'Cold Milk',
        hindiName: 'Thanda Doodh',
        description: 'Milk contains calcium which helps neutralize stomach acid and provides instant relief.',
        howTo: 'Drink a glass of cold milk (without sugar). Sip slowly for best results.',
        timing: 'When you feel acidity starting or after a heavy meal',
        effectiveness: 'high',
        evidenceLevel: 'traditional',
        contraindications: ['lactose_intolerance', 'milk_allergy'],
        suitableFor: ['all_ages'],
      },
      {
        id: 'jeera_water',
        name: 'Jeera (Cumin) Water',
        hindiName: 'Jeera Paani',
        description: 'Cumin helps stimulate digestive enzymes and neutralizes acids in the stomach.',
        howTo: 'Boil 1 tsp cumin seeds in 1 glass water for 5 minutes. Strain and drink warm or at room temperature. Can add a pinch of rock salt.',
        timing: 'After meals or when symptoms occur',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: [],
        suitableFor: ['all_ages', 'elderly_friendly', 'diabetic_friendly'],
      },
      {
        id: 'fennel_seeds',
        name: 'Fennel Seeds (Saunf)',
        hindiName: 'Saunf',
        description: 'Fennel has natural antacid properties and helps with digestion and gas relief.',
        howTo: 'Chew 1/2 teaspoon of fennel seeds slowly after meals, or make fennel tea by boiling seeds in water.',
        timing: 'After meals or when symptoms occur',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['pregnancy_high_amounts'],
        suitableFor: ['all_ages', 'elderly_friendly', 'diabetic_friendly'],
      },
      {
        id: 'banana',
        name: 'Banana',
        hindiName: 'Kela',
        description: 'Bananas are natural antacids. They coat the stomach lining and reduce irritation.',
        howTo: 'Eat a ripe banana when experiencing acidity. Overripe bananas work best.',
        timing: 'During symptoms or as prevention after spicy food',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['diabetes_monitor_sugar'],
        suitableFor: ['all_ages'],
      },
      {
        id: 'ajwain',
        name: 'Ajwain (Carom Seeds)',
        hindiName: 'Ajwain',
        description: 'Ajwain has anti-acidic properties and helps with gas, bloating, and acidity.',
        howTo: 'Chew 1/2 tsp ajwain with a pinch of black salt, or boil in water and drink the strained liquid.',
        timing: 'After meals or during symptoms',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['pregnancy', 'bleeding_disorders'],
        suitableFor: ['adults', 'elderly_friendly'],
      },
      {
        id: 'coconut_water',
        name: 'Coconut Water',
        hindiName: 'Nariyal Paani',
        description: 'Coconut water is alkaline and helps neutralize acid while keeping you hydrated.',
        howTo: 'Drink fresh coconut water. Best consumed at room temperature.',
        timing: 'Anytime, especially in morning or when symptoms occur',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['kidney_disease_consult'],
        suitableFor: ['all_ages', 'diabetic_friendly'],
      },
    ],
    lifestyleAdvice: [
      'Eat smaller, more frequent meals instead of large meals',
      'Don\'t lie down immediately after eating (wait 2-3 hours)',
      'Avoid spicy, fried, and oily foods',
      'Reduce tea, coffee, and carbonated drinks',
      'Sleep with head slightly elevated',
      'Manage stress - it increases acid production',
      'Avoid eating late at night',
    ],
    warningSignsToWatch: [
      'Pain spreading to arm, neck, or jaw (could be cardiac)',
      'Difficulty swallowing that persists',
      'Unintentional weight loss',
      'Vomiting blood or dark material',
      'Black, tarry stools',
      'Severe pain that doesn\'t improve with antacids',
    ],
  },

  gas_bloating: {
    id: 'gas_bloating',
    name: 'Gas & Bloating',
    hindiName: 'Gas / Pet mein bharipan',
    remedies: [
      {
        id: 'ajwain_water',
        name: 'Ajwain Water',
        hindiName: 'Ajwain Paani',
        description: 'Ajwain is excellent for gas relief and improves digestion by stimulating digestive enzymes.',
        howTo: 'Boil 1 tsp ajwain in 2 cups water until reduced to half. Add a pinch of black salt. Drink warm.',
        timing: 'After meals or during discomfort',
        effectiveness: 'high',
        evidenceLevel: 'traditional',
        contraindications: ['pregnancy'],
        suitableFor: ['adults', 'elderly_friendly'],
      },
      {
        id: 'ginger_tea',
        name: 'Ginger Tea (Adrak Chai)',
        hindiName: 'Adrak Ki Chai',
        description: 'Ginger helps relax intestinal muscles, reduces inflammation, and promotes gas expulsion.',
        howTo: 'Grate 1 inch fresh ginger, boil in water for 5-7 minutes. Strain and add honey if desired.',
        timing: 'After meals or when bloated',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['bleeding_disorders', 'gallstones', 'blood_thinners'],
        suitableFor: ['all_ages'],
      },
      {
        id: 'hing_water',
        name: 'Hing (Asafoetida) Water',
        hindiName: 'Hing Ka Paani',
        description: 'Hing is a powerful digestive aid that reduces gas and bloating quickly.',
        howTo: 'Dissolve a small pinch (less than 1/4 tsp) of hing in warm water. Mix well and drink slowly.',
        timing: 'During acute bloating or after heavy meals',
        effectiveness: 'high',
        evidenceLevel: 'traditional',
        contraindications: ['pregnancy', 'blood_pressure_medications'],
        suitableFor: ['adults'],
        safetyNote: 'Use only a small pinch - too much can cause stomach upset.',
      },
      {
        id: 'warm_lemon_water',
        name: 'Warm Water with Lemon',
        hindiName: 'Nimbu Paani (garam)',
        description: 'Stimulates digestive juices and helps relieve bloating naturally.',
        howTo: 'Mix juice of half lemon in a glass of warm water. Drink slowly.',
        timing: 'Morning on empty stomach or when symptoms occur',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['gastric_ulcers', 'severe_acidity'],
        suitableFor: ['all_ages', 'diabetic_friendly'],
      },
      {
        id: 'pudina_tea',
        name: 'Mint Tea (Pudina)',
        hindiName: 'Pudina Ki Chai',
        description: 'Peppermint relaxes digestive muscles and helps expel gas.',
        howTo: 'Boil fresh or dried mint leaves in water for 5 minutes. Strain and drink warm.',
        timing: 'After meals or during discomfort',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['acid_reflux_may_worsen', 'gallstones'],
        suitableFor: ['adults', 'children_over_6'],
      },
    ],
    lifestyleAdvice: [
      'Eat slowly and chew food thoroughly',
      'Avoid talking while eating',
      'Walk for 10-15 minutes after meals',
      'Avoid carbonated drinks and chewing gum',
      'Identify gas-producing foods (beans, cabbage, onions) and limit them',
      'Stay hydrated throughout the day',
      'Don\'t skip meals - irregular eating causes gas',
    ],
    warningSignsToWatch: [
      'Severe abdominal pain',
      'Bloating with vomiting',
      'Blood in stool',
      'Unexplained weight loss',
      'Persistent symptoms despite home remedies',
    ],
  },

  constipation: {
    id: 'constipation',
    name: 'Constipation',
    hindiName: 'Kabz',
    remedies: [
      {
        id: 'triphala',
        name: 'Triphala',
        hindiName: 'Triphala',
        description: 'A time-tested Ayurvedic blend of three fruits that gently cleanses the digestive system.',
        howTo: 'Mix 1/2 tsp triphala powder in warm water. Drink before bed.',
        timing: 'Bedtime, at least 2 hours after dinner',
        effectiveness: 'high',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['pregnancy', 'diarrhea', 'children_under_12'],
        suitableFor: ['adults', 'elderly_friendly'],
      },
      {
        id: 'isabgol',
        name: 'Isabgol (Psyllium Husk)',
        hindiName: 'Isabgol',
        description: 'Natural fiber that adds bulk to stool and promotes healthy bowel movement.',
        howTo: 'Mix 1-2 tsp isabgol in a glass of warm water or milk. Drink immediately before it thickens. Follow with another glass of water.',
        timing: 'Bedtime, with plenty of water',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: ['intestinal_obstruction', 'difficulty_swallowing', 'appendicitis'],
        suitableFor: ['adults', 'elderly_friendly', 'diabetic_friendly'],
        importantNote: 'Must drink plenty of water when taking isabgol.',
      },
      {
        id: 'warm_honey_water',
        name: 'Warm Water with Honey',
        hindiName: 'Shahad wala garam paani',
        description: 'Gentle stimulation for the digestive system and natural lubrication.',
        howTo: 'Add 1-2 tsp honey to a glass of lukewarm water. Drink first thing in the morning.',
        timing: 'Morning, empty stomach',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['diabetes_monitor_sugar', 'infants_under_1'],
        suitableFor: ['adults', 'elderly_friendly'],
      },
      {
        id: 'ghee_milk',
        name: 'Ghee with Milk',
        hindiName: 'Ghee wala doodh',
        description: 'Lubricates the intestines and softens stool naturally.',
        howTo: 'Add 1-2 tsp pure ghee to warm milk. Drink before bed.',
        timing: 'Bedtime',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['lactose_intolerance', 'high_cholesterol_monitor'],
        suitableFor: ['all_ages', 'elderly_friendly'],
      },
      {
        id: 'papaya',
        name: 'Papaya',
        hindiName: 'Papita',
        description: 'Contains papain enzyme that aids digestion and promotes regularity.',
        howTo: 'Eat 1-2 cups of ripe papaya in the morning or as evening snack.',
        timing: 'Morning preferred, on empty or light stomach',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['pregnancy_raw_papaya', 'latex_allergy'],
        suitableFor: ['all_ages', 'diabetic_friendly_moderate'],
      },
      {
        id: 'castor_oil',
        name: 'Castor Oil',
        hindiName: 'Arandi Ka Tel',
        description: 'Natural laxative that stimulates bowel movements.',
        howTo: 'Take 1-2 tsp castor oil with warm water or milk on empty stomach.',
        timing: 'Morning, empty stomach. Expect results in 6-8 hours.',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: ['pregnancy', 'intestinal_obstruction', 'abdominal_pain', 'regular_use'],
        suitableFor: ['adults'],
        safetyNote: 'Use only occasionally. Not for regular or long-term use.',
      },
    ],
    lifestyleAdvice: [
      'Drink 8-10 glasses of water daily',
      'Include fiber-rich foods (fruits, vegetables, whole grains)',
      'Don\'t ignore the urge to go - respond promptly',
      'Exercise regularly - even a 20-minute walk helps',
      'Establish a regular bathroom routine',
      'Limit processed foods and refined flour (maida)',
      'Include prunes (sukhe aloo bukhare) in your diet',
    ],
    warningSignsToWatch: [
      'Blood in stool',
      'Severe abdominal pain',
      'Constipation lasting more than 2 weeks',
      'Unexplained weight loss',
      'Alternating constipation and diarrhea',
      'No bowel movement for more than 4 days',
    ],
  },

  // ============================================
  // RESPIRATORY ISSUES
  // ============================================
  common_cold: {
    id: 'common_cold',
    name: 'Common Cold',
    hindiName: 'Sardi / Jukaam',
    remedies: [
      {
        id: 'kadha',
        name: 'Kadha (Traditional Decoction)',
        hindiName: 'Kadha',
        description: 'Traditional immunity-boosting drink with multiple healing herbs.',
        howTo: 'Boil together: 1 cup water, 1/2 inch ginger (grated), 4-5 tulsi leaves, 2-3 peppercorns, 1/4 tsp turmeric, 1 small cinnamon stick. Simmer for 10 minutes. Strain and add honey when lukewarm.',
        timing: '2-3 times daily when unwell',
        effectiveness: 'high',
        evidenceLevel: 'traditional',
        contraindications: ['pregnancy_high_amounts', 'blood_thinners'],
        suitableFor: ['adults', 'children_over_5_modified'],
      },
      {
        id: 'haldi_doodh',
        name: 'Golden Milk (Haldi Doodh)',
        hindiName: 'Haldi Doodh',
        description: 'Turmeric milk is anti-inflammatory and helps with cold symptoms and immunity.',
        howTo: 'Warm 1 cup milk with 1/2 tsp turmeric and a pinch of black pepper. Add honey if desired. Drink warm.',
        timing: 'Bedtime, once daily',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['lactose_intolerance', 'gallbladder_issues'],
        suitableFor: ['all_ages', 'elderly_friendly'],
      },
      {
        id: 'steam_inhalation',
        name: 'Steam Inhalation',
        hindiName: 'Bhaap lena',
        description: 'Helps clear nasal congestion and soothes irritated airways.',
        howTo: 'Boil water in a large bowl. Add 2-3 drops eucalyptus oil or Vicks. Cover head with towel and inhale steam for 5-10 minutes. Keep eyes closed.',
        timing: '2-3 times daily, especially before bed',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: ['asthma_caution', 'children_need_supervision'],
        suitableFor: ['adults', 'elderly_with_care'],
        safetyNote: 'Keep face at safe distance to avoid burns. Not recommended for young children without supervision.',
      },
      {
        id: 'honey_ginger',
        name: 'Honey Ginger',
        hindiName: 'Shahad Adrak',
        description: 'Soothes throat irritation and helps with cough and cold symptoms.',
        howTo: 'Mix 1 tsp honey with 1/2 tsp fresh ginger juice. Take directly or add to warm water.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['diabetes_monitor', 'infants_under_1_no_honey'],
        suitableFor: ['adults', 'children_over_1'],
      },
      {
        id: 'tulsi_tea',
        name: 'Tulsi Tea',
        hindiName: 'Tulsi Ki Chai',
        description: 'Holy basil has antimicrobial and immune-boosting properties.',
        howTo: 'Boil 5-6 fresh tulsi leaves in water for 5 minutes. Strain and drink. Can add honey.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['pregnancy_high_amounts', 'blood_thinners', 'surgery_stop_2_weeks_before'],
        suitableFor: ['all_ages', 'elderly_friendly', 'diabetic_friendly'],
      },
      {
        id: 'garlic_soup',
        name: 'Garlic Soup',
        hindiName: 'Lahsun Ka Soup',
        description: 'Garlic has antimicrobial properties and helps fight infections.',
        howTo: 'Crush 3-4 garlic cloves, add to vegetable soup or warm water with salt and pepper.',
        timing: 'Once daily when unwell',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['bleeding_disorders', 'surgery_stop_before'],
        suitableFor: ['adults', 'elderly_friendly'],
      },
    ],
    lifestyleAdvice: [
      'Rest is essential - don\'t push through illness',
      'Stay hydrated with warm fluids (soup, water, herbal tea)',
      'Gargle with warm salt water for sore throat',
      'Keep the room ventilated but avoid direct cold drafts',
      'Wash hands frequently to prevent spreading',
      'Avoid cold foods and drinks',
      'Get adequate sleep (8+ hours)',
    ],
    warningSignsToWatch: [
      'Fever lasting more than 3 days',
      'Difficulty breathing or shortness of breath',
      'Chest pain when breathing or coughing',
      'Symptoms worsening instead of improving after a week',
      'Confusion or extreme weakness (especially in elderly)',
      'Severe headache with stiff neck',
    ],
  },

  cough: {
    id: 'cough',
    name: 'Cough',
    hindiName: 'Khansi',
    remedies: [
      {
        id: 'honey_black_pepper',
        name: 'Honey with Black Pepper',
        hindiName: 'Shahad aur Kali Mirch',
        description: 'Honey soothes throat, black pepper has expectorant properties that help clear mucus.',
        howTo: 'Mix 1 tbsp honey with a pinch of crushed black pepper. Take directly and let it coat your throat slowly.',
        timing: '3-4 times daily, especially before bed',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: ['infants_under_1', 'diabetes_moderate'],
        suitableFor: ['adults', 'children_over_1'],
      },
      {
        id: 'mulethi_tea',
        name: 'Mulethi (Licorice) Tea',
        hindiName: 'Mulethi Ki Chai',
        description: 'Licorice root soothes throat irritation and reduces cough reflex.',
        howTo: 'Boil 1 small piece of mulethi in water for 10 minutes. Strain and drink warm.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['hypertension', 'heart_disease', 'pregnancy', 'kidney_disease'],
        suitableFor: ['adults_without_contraindications'],
        importantNote: 'Do not use if you have high blood pressure or heart conditions.',
      },
      {
        id: 'ginger_tulsi_honey',
        name: 'Ginger-Tulsi-Honey Mix',
        hindiName: 'Adrak-Tulsi-Shahad',
        description: 'Combines multiple cough-relieving ingredients for comprehensive relief.',
        howTo: 'Crush ginger and tulsi, extract juice (about 1/2 tsp each). Mix with 1 tsp honey. Take directly.',
        timing: '3-4 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['infants_under_1', 'bleeding_disorders'],
        suitableFor: ['adults', 'children_over_2'],
      },
      {
        id: 'salt_water_gargle',
        name: 'Warm Salt Water Gargle',
        hindiName: 'Namak ke paani se garare',
        description: 'Reduces throat irritation, clears mucus, and helps with post-nasal drip cough.',
        howTo: 'Dissolve 1/2 tsp salt in 1 cup warm water. Gargle thoroughly for 30 seconds, then spit out. Do not swallow.',
        timing: '3-4 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages_who_can_gargle'],
      },
      {
        id: 'betel_leaf_remedy',
        name: 'Betel Leaf (Paan) with Honey',
        hindiName: 'Paan ke Patte',
        description: 'Betel leaf has antimicrobial properties and helps soothe cough.',
        howTo: 'Crush 2-3 betel leaves, extract juice. Mix with 1 tsp honey.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['pregnancy'],
        suitableFor: ['adults'],
      },
    ],
    lifestyleAdvice: [
      'Stay hydrated - drink warm fluids frequently',
      'Use a humidifier to keep air moist',
      'Elevate your head while sleeping',
      'Avoid irritants like smoke, dust, strong perfumes',
      'Rest your voice if cough is straining throat',
      'Cover mouth when coughing to prevent spread',
    ],
    warningSignsToWatch: [
      'Coughing blood or blood-streaked mucus',
      'Shortness of breath or wheezing',
      'Cough lasting more than 3 weeks',
      'High fever (above 102°F) with cough',
      'Unexplained weight loss',
      'Night sweats with cough',
      'Chest pain when coughing',
    ],
  },

  // ============================================
  // PAIN MANAGEMENT
  // ============================================
  headache: {
    id: 'headache',
    name: 'Headache',
    hindiName: 'Sar Dard',
    remedies: [
      {
        id: 'peppermint_oil',
        name: 'Peppermint Oil',
        hindiName: 'Pudina Tel',
        description: 'Has cooling and muscle-relaxing properties that help relieve tension headaches.',
        howTo: 'Dilute 1-2 drops peppermint oil in 1 tsp carrier oil (coconut/almond). Apply to temples and forehead gently. Avoid eye area.',
        timing: 'When headache occurs, can reapply after 30 minutes',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['children_under_6', 'not_near_eyes', 'sensitive_skin'],
        suitableFor: ['adults', 'older_children'],
      },
      {
        id: 'ginger_tea_headache',
        name: 'Ginger Tea',
        hindiName: 'Adrak Ki Chai',
        description: 'Anti-inflammatory properties help with tension and migraine headaches.',
        howTo: 'Fresh ginger tea with a little honey. Sip slowly while warm.',
        timing: 'At onset of headache',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['bleeding_disorders', 'blood_thinners'],
        suitableFor: ['all_ages'],
      },
      {
        id: 'cold_compress',
        name: 'Cold Compress',
        hindiName: 'Thandi Patti',
        description: 'Constricts blood vessels and reduces pain, especially effective for migraines.',
        howTo: 'Apply ice pack wrapped in cloth or cold damp towel to forehead for 15-20 minutes.',
        timing: 'During headache, can repeat after 30-minute break',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
      {
        id: 'warm_compress_tension',
        name: 'Warm Compress (for Tension)',
        hindiName: 'Garam Patti',
        description: 'Relaxes tense muscles in neck and shoulders that cause tension headaches.',
        howTo: 'Apply warm towel or heating pad to back of neck and shoulders for 15-20 minutes.',
        timing: 'During tension headache',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
      {
        id: 'hydration',
        name: 'Stay Hydrated',
        hindiName: 'Paani Piyein',
        description: 'Dehydration is a very common headache trigger. Often headaches resolve with hydration.',
        howTo: 'Drink water, coconut water, or oral rehydration solution. Aim for 2-3 glasses.',
        timing: 'Immediately when headache starts',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
      {
        id: 'clove_paste',
        name: 'Clove Paste',
        hindiName: 'Laung Ka Lep',
        description: 'Cloves have pain-relieving and cooling properties.',
        howTo: 'Grind 2-3 cloves with a little water to make paste. Apply to forehead and temples.',
        timing: 'During headache, leave for 15-20 minutes',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['sensitive_skin'],
        suitableFor: ['adults'],
      },
    ],
    lifestyleAdvice: [
      'Maintain regular sleep schedule',
      'Stay hydrated throughout the day',
      'Reduce screen time and take regular breaks',
      'Practice stress management techniques',
      'Identify and avoid trigger foods (caffeine, alcohol, aged cheese)',
      'Exercise regularly but avoid sudden intense workouts',
      'Maintain good posture while working',
    ],
    warningSignsToWatch: [
      '"Worst headache of my life" - sudden, severe onset',
      'Headache with fever, stiff neck, or confusion',
      'Headache after head injury',
      'Headache with vision changes, double vision, or numbness',
      'Headache that wakes you from sleep',
      'New headache pattern after age 50',
      'Headache with weakness on one side',
    ],
  },

  body_ache: {
    id: 'body_ache',
    name: 'Body Ache / Muscle Pain',
    hindiName: 'Badan Dard',
    remedies: [
      {
        id: 'warm_oil_massage',
        name: 'Warm Oil Massage',
        hindiName: 'Garam Tel Malish',
        description: 'Improves blood circulation, relaxes muscles, and provides warmth to affected areas.',
        howTo: 'Warm mustard oil or sesame oil. Gently massage affected areas in circular motions for 10-15 minutes. Can leave oil on or wipe off after 30 minutes.',
        timing: 'Evening or before bed for best results',
        effectiveness: 'high',
        evidenceLevel: 'traditional',
        contraindications: ['skin_wounds', 'inflammation_acute', 'skin_allergy'],
        suitableFor: ['all_ages', 'elderly_friendly'],
      },
      {
        id: 'epsom_salt_bath',
        name: 'Epsom Salt Bath',
        hindiName: 'Sendha Namak Ka Snan',
        description: 'Magnesium in Epsom salt helps relax muscles and reduce inflammation.',
        howTo: 'Add 2 cups Epsom salt to warm bath water. Soak for 15-20 minutes. Rinse and rest.',
        timing: 'Evening, 1-2 times per week',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['diabetes_foot_soak_caution', 'heart_disease_hot_baths', 'open_wounds'],
        suitableFor: ['adults'],
      },
      {
        id: 'turmeric_paste',
        name: 'Turmeric Paste',
        hindiName: 'Haldi Ka Lep',
        description: 'Turmeric has powerful anti-inflammatory properties that help with pain.',
        howTo: 'Mix turmeric powder with warm water or mustard oil to make paste. Apply to affected area. Leave for 30 minutes, then wash off.',
        timing: 'Once daily',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['may_stain_skin_clothes'],
        suitableFor: ['all_ages'],
        safetyNote: 'Turmeric will stain skin temporarily and can stain clothes.',
      },
      {
        id: 'hot_water_bag',
        name: 'Hot Water Bag',
        hindiName: 'Garam Paani Ki Botal',
        description: 'Heat therapy increases blood flow and relaxes tight muscles.',
        howTo: 'Fill hot water bag with warm (not boiling) water. Wrap in cloth and apply to painful area for 15-20 minutes.',
        timing: 'As needed, multiple times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['acute_injury_first_48_hours', 'burns_risk'],
        suitableFor: ['all_ages'],
        safetyNote: 'Always wrap in cloth to prevent burns. Do not use on acute injuries.',
      },
      {
        id: 'rest_hydration',
        name: 'Rest and Hydration',
        hindiName: 'Aaram aur paani',
        description: 'Body needs rest to recover, and hydration helps flush out toxins and metabolic waste.',
        howTo: 'Rest adequately, drink warm fluids including herbal teas and soups.',
        timing: 'Ongoing until symptoms improve',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
    ],
    lifestyleAdvice: [
      'Stay active with gentle movement - complete rest can worsen stiffness',
      'Maintain good posture while sitting and standing',
      'Stretch regularly, especially before and after exercise',
      'Stay hydrated throughout the day',
      'Get adequate sleep - muscle repair happens during sleep',
      'Use proper lifting techniques',
    ],
    warningSignsToWatch: [
      'Body ache with high fever',
      'Muscle weakness or difficulty moving',
      'Dark urine with muscle pain (could indicate rhabdomyolysis)',
      'Pain in specific joint with swelling and redness',
      'Body ache lasting more than a week without improvement',
      'Unexplained weight loss with body ache',
    ],
  },

  // ============================================
  // FEVER
  // ============================================
  fever: {
    id: 'fever',
    name: 'Fever',
    hindiName: 'Bukhar',
    remedies: [
      {
        id: 'tulsi_ginger_kadha',
        name: 'Tulsi-Ginger Kadha',
        hindiName: 'Tulsi-Adrak Kadha',
        description: 'Traditional fever-reducing and immunity-boosting drink combining multiple healing herbs.',
        howTo: 'Boil 5-6 tulsi leaves, 1/2 inch grated ginger, and a pinch of black pepper in 2 cups water until reduced to 1 cup. Strain and add honey when lukewarm.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['infants_under_1'],
        suitableFor: ['adults', 'children_over_5_modified', 'elderly_friendly'],
      },
      {
        id: 'cool_sponging',
        name: 'Cool Sponging',
        hindiName: 'Thande paani se ponchna',
        description: 'Helps bring down body temperature naturally and safely.',
        howTo: 'Dip cloth in room temperature water (not ice cold). Wring out excess and sponge forehead, armpits, groin, and back of neck.',
        timing: 'Every 30 minutes if fever is high',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: ['shivering_stop_if_occurs'],
        suitableFor: ['all_ages'],
        safetyNote: 'Do NOT use ice cold water as it can cause shivering which raises body temperature.',
      },
      {
        id: 'coriander_tea',
        name: 'Coriander Tea',
        hindiName: 'Dhaniya Ki Chai',
        description: 'Helps reduce fever and flush out toxins from the body.',
        howTo: 'Boil 1 tbsp coriander seeds in 2 cups water until reduced to half. Strain and drink warm.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: [],
        suitableFor: ['all_ages', 'elderly_friendly', 'diabetic_friendly'],
      },
      {
        id: 'hydration_fever',
        name: 'Stay Hydrated',
        hindiName: 'Khoob paani piyein',
        description: 'Fever increases fluid loss. Hydration is critical to prevent dehydration and support recovery.',
        howTo: 'Drink water, ORS (Electral), coconut water, clear soups, and herbal teas frequently.',
        timing: 'Ongoing, every 30-60 minutes. Small sips if nauseous.',
        effectiveness: 'high',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
      {
        id: 'basil_seeds_water',
        name: 'Basil Seeds Water',
        hindiName: 'Sabja Paani',
        description: 'Basil seeds are cooling and help reduce body heat.',
        howTo: 'Soak 1 tsp basil seeds (sabja) in water for 15 minutes. Add to water or lemonade and drink.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['children_under_5_choking_risk'],
        suitableFor: ['adults', 'older_children'],
      },
    ],
    lifestyleAdvice: [
      'Rest is essential - fever is the body fighting infection',
      'Wear light, loose, breathable clothing',
      'Keep room ventilated but avoid direct cold drafts',
      'Eat light, easily digestible foods (khichdi, soup, dal water)',
      'Avoid heavy, oily, or spicy foods',
      'Monitor temperature every 4-6 hours',
    ],
    warningSignsToWatch: [
      'Fever above 103°F (39.4°C) not responding to treatment',
      'Fever lasting more than 3 days',
      'Fever with severe headache and stiff neck (possible meningitis)',
      'Fever with rash (especially non-blanching rash)',
      'Fever with difficulty breathing',
      'Fever with confusion or lethargy (especially in elderly)',
      'Signs of severe dehydration (very dark urine, dry mouth, dizziness)',
      'Any fever in infant under 3 months (seek immediate care)',
    ],
  },

  // ============================================
  // SKIN ISSUES
  // ============================================
  skin_rash: {
    id: 'skin_rash',
    name: 'Minor Skin Rash / Itching',
    hindiName: 'Khujli / Daane',
    remedies: [
      {
        id: 'neem_paste',
        name: 'Neem Paste',
        hindiName: 'Neem Ka Lep',
        description: 'Neem has antimicrobial, antifungal, and anti-inflammatory properties.',
        howTo: 'Grind fresh neem leaves with a little water to make paste. Apply to affected area.',
        timing: 'Leave for 20-30 minutes, then wash off. Apply 1-2 times daily.',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: [],
        suitableFor: ['all_ages', 'elderly_friendly'],
      },
      {
        id: 'aloe_vera',
        name: 'Aloe Vera Gel',
        hindiName: 'Aloe Vera',
        description: 'Soothing, cooling, and helps heal skin irritation. Has anti-inflammatory properties.',
        howTo: 'Extract fresh aloe vera gel from leaf or use pure store-bought gel. Apply directly to affected area.',
        timing: '2-3 times daily, can leave on',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
      {
        id: 'coconut_oil_skin',
        name: 'Coconut Oil',
        hindiName: 'Nariyal Tel',
        description: 'Moisturizes dry skin and has mild antimicrobial properties.',
        howTo: 'Apply virgin coconut oil to affected dry or itchy area. Massage gently.',
        timing: '2-3 times daily',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['fungal_infections_avoid', 'acne_prone_skin'],
        suitableFor: ['all_ages'],
        importantNote: 'Do not use for fungal infections as oil can worsen them.',
      },
      {
        id: 'oatmeal_bath',
        name: 'Oatmeal Bath',
        hindiName: 'Oatmeal Ka Snan',
        description: 'Colloidal oatmeal soothes itchy, irritated skin and reduces inflammation.',
        howTo: 'Grind 1 cup oatmeal to fine powder. Add to lukewarm bath water and soak for 15-20 minutes.',
        timing: 'Once daily or as needed',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
      {
        id: 'cold_compress_skin',
        name: 'Cold Compress',
        hindiName: 'Thandi Patti',
        description: 'Reduces itching and inflammation quickly.',
        howTo: 'Apply cold, damp cloth to itchy area for 10-15 minutes.',
        timing: 'As needed when itching is severe',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: [],
        suitableFor: ['all_ages'],
      },
    ],
    lifestyleAdvice: [
      'Avoid scratching - it can worsen irritation and cause infection',
      'Wear loose, cotton clothing',
      'Use mild, fragrance-free soap and detergent',
      'Keep affected area clean and dry',
      'Identify and avoid potential allergens or irritants',
      'Stay hydrated and moisturize regularly',
    ],
    warningSignsToWatch: [
      'Rash spreading rapidly',
      'Rash with fever',
      'Rash with difficulty breathing or swelling (allergic reaction - seek immediate help)',
      'Signs of infection (warmth, pus, red streaks, increasing pain)',
      'Rash that looks like bleeding under the skin (petechiae)',
      'Blisters or open sores',
    ],
  },

  // ============================================
  // SLEEP ISSUES
  // ============================================
  sleep_difficulty: {
    id: 'sleep_difficulty',
    name: 'Difficulty Sleeping',
    hindiName: 'Neend Na Aana',
    remedies: [
      {
        id: 'warm_milk_nutmeg',
        name: 'Warm Milk with Nutmeg',
        hindiName: 'Jaiphal wala Doodh',
        description: 'Nutmeg has natural sedative properties. Combined with warm milk, it promotes relaxation.',
        howTo: 'Add a tiny pinch of nutmeg powder (less than 1/8 tsp) to warm milk. Drink 30 minutes before bed.',
        timing: '30 minutes before bed',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['lactose_intolerance', 'nutmeg_large_amounts_toxic'],
        suitableFor: ['adults', 'elderly_friendly'],
        safetyNote: 'Use only a tiny pinch - large amounts of nutmeg can be harmful.',
      },
      {
        id: 'chamomile_tea',
        name: 'Chamomile Tea',
        hindiName: 'Chamomile Ki Chai',
        description: 'Calming herb that promotes relaxation and better sleep.',
        howTo: 'Steep chamomile tea bag or dried flowers in hot water for 5 minutes. Drink warm.',
        timing: '30-60 minutes before bed',
        effectiveness: 'moderate',
        evidenceLevel: 'well-researched',
        contraindications: ['ragweed_allergy'],
        suitableFor: ['adults', 'elderly_friendly'],
      },
      {
        id: 'ashwagandha',
        name: 'Ashwagandha',
        hindiName: 'Ashwagandha',
        description: 'Adaptogenic herb that reduces stress and anxiety, improving sleep quality.',
        howTo: 'Take 1/4 to 1/2 tsp ashwagandha powder in warm milk before bed.',
        timing: 'Before bed, consistently for 2-4 weeks for best results',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['pregnancy', 'thyroid_conditions', 'autoimmune_diseases'],
        suitableFor: ['adults'],
        importantNote: 'Consult doctor if you have thyroid conditions.',
      },
      {
        id: 'warm_foot_soak',
        name: 'Warm Foot Soak',
        hindiName: 'Pairo ko garam paani mein rakhna',
        description: 'Promotes relaxation and helps prepare body for sleep.',
        howTo: 'Soak feet in warm water with a pinch of salt or few drops of lavender oil for 15 minutes before bed.',
        timing: 'Before bed',
        effectiveness: 'moderate',
        evidenceLevel: 'traditional',
        contraindications: ['diabetic_neuropathy_check_water_temp'],
        suitableFor: ['all_ages', 'elderly_friendly'],
      },
      {
        id: 'brahmi',
        name: 'Brahmi',
        hindiName: 'Brahmi',
        description: 'Ayurvedic herb that calms the mind and reduces anxiety.',
        howTo: 'Take 1/4 tsp brahmi powder in warm water or milk at bedtime.',
        timing: 'Before bed',
        effectiveness: 'moderate',
        evidenceLevel: 'Ayurvedic',
        contraindications: ['pregnancy', 'thyroid_medications'],
        suitableFor: ['adults'],
      },
    ],
    lifestyleAdvice: [
      'Maintain consistent sleep and wake times, even on weekends',
      'Avoid screens (phone, TV, computer) 1 hour before bed',
      'Keep bedroom cool, dark, and quiet',
      'Avoid caffeine (tea, coffee) after 2 PM',
      'Don\'t nap during the day if having trouble sleeping at night',
      'Eat light dinner at least 2-3 hours before bed',
      'Practice gentle stretching, deep breathing, or meditation before bed',
      'Avoid alcohol before bed - it disrupts sleep quality',
    ],
    warningSignsToWatch: [
      'Sleep problems lasting more than 4 weeks',
      'Daytime sleepiness affecting work or driving',
      'Loud snoring with pauses in breathing (possible sleep apnea)',
      'Restless legs or involuntary movements during sleep',
      'Difficulty sleeping with mood changes or depression',
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Find remedies for a given symptom/condition
 */
export function findRemediesForCondition(conditionKey: string): ConditionRemedies | undefined {
  return HOME_REMEDIES_DB[conditionKey.toLowerCase()];
}

/**
 * Search remedies by symptom keywords
 */
export function searchRemediesBySymptom(symptom: string): ConditionRemedies[] {
  const normalizedSymptom = symptom.toLowerCase();
  const matches: ConditionRemedies[] = [];

  // Symptom to condition mapping
  const symptomMapping: Record<string, string[]> = {
    'acidity': ['acidity'],
    'heartburn': ['acidity'],
    'acid reflux': ['acidity'],
    'indigestion': ['acidity', 'gas_bloating'],
    'gas': ['gas_bloating'],
    'bloating': ['gas_bloating'],
    'constipation': ['constipation'],
    'kabz': ['constipation'],
    'cold': ['common_cold'],
    'cough': ['cough', 'common_cold'],
    'sore throat': ['common_cold', 'cough'],
    'fever': ['fever'],
    'headache': ['headache'],
    'body ache': ['body_ache'],
    'muscle pain': ['body_ache'],
    'rash': ['skin_rash'],
    'itching': ['skin_rash'],
    'sleep': ['sleep_difficulty'],
    'insomnia': ['sleep_difficulty'],
  };

  // Find matching conditions
  for (const [keyword, conditions] of Object.entries(symptomMapping)) {
    if (normalizedSymptom.includes(keyword)) {
      for (const conditionKey of conditions) {
        const condition = HOME_REMEDIES_DB[conditionKey];
        if (condition && !matches.find(m => m.id === condition.id)) {
          matches.push(condition);
        }
      }
    }
  }

  // Direct lookup if no keyword matches
  if (matches.length === 0) {
    for (const [key, condition] of Object.entries(HOME_REMEDIES_DB)) {
      if (
        condition.name.toLowerCase().includes(normalizedSymptom) ||
        condition.hindiName.toLowerCase().includes(normalizedSymptom)
      ) {
        matches.push(condition);
      }
    }
  }

  return matches;
}

/**
 * Filter remedies based on user profile (age, conditions, etc.)
 */
export function filterRemediesForProfile(
  remedies: HomeRemedy[],
  profile: {
    age?: number;
    isPregnant?: boolean;
    isDiabetic?: boolean;
    conditions?: string[];
    allergies?: string[];
  }
): HomeRemedy[] {
  return remedies.filter(remedy => {
    // Check contraindications
    for (const contraindication of remedy.contraindications) {
      if (contraindication.includes('pregnancy') && profile.isPregnant) {
        return false;
      }
      if (contraindication.includes('diabetes') && profile.isDiabetic) {
        // Allow but note monitoring needed
        if (contraindication.includes('monitor')) {
          continue; // Allow with caution
        }
        return false;
      }
      if (contraindication.includes('infant') && profile.age && profile.age < 1) {
        return false;
      }
      if (contraindication.includes('children_under') && profile.age) {
        const ageMatch = contraindication.match(/children_under_(\d+)/);
        if (ageMatch && profile.age < parseInt(ageMatch[1])) {
          return false;
        }
      }
    }

    // Check suitability
    if (profile.age) {
      if (profile.age >= 60 && !remedy.suitableFor.some(s => s.includes('elderly'))) {
        // Still allow if suitable for all_ages or adults
        if (!remedy.suitableFor.some(s => s === 'all_ages' || s === 'adults')) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Get top remedies for a condition (limited to avoid overwhelming)
 */
export function getTopRemedies(
  conditionKey: string,
  limit: number = 3,
  profile?: {
    age?: number;
    isPregnant?: boolean;
    isDiabetic?: boolean;
    conditions?: string[];
  }
): HomeRemedy[] {
  const condition = HOME_REMEDIES_DB[conditionKey];
  if (!condition) return [];

  let remedies = [...condition.remedies];

  // Sort by effectiveness
  remedies.sort((a, b) => {
    const order: Record<RemedyEffectiveness, number> = { high: 0, moderate: 1, low: 2 };
    return order[a.effectiveness] - order[b.effectiveness];
  });

  // Filter for profile if provided
  if (profile) {
    remedies = filterRemediesForProfile(remedies, profile);
  }

  return remedies.slice(0, limit);
}
