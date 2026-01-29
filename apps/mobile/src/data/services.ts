/**
 * CareBow Services Data
 * Single source of truth for all services and subscription plans
 *
 * TODO: Replace with API calls when backend is ready
 */

import { Service, ServiceCategory, SubscriptionPlan, Member } from './types';

// ============================================
// MOCK MEMBERS (until real user data exists)
// ============================================
export const mockMembers: Member[] = [
  { id: 'self', name: 'Self', relationship: 'self' },
  { id: 'baba', name: 'Baba', relationship: 'grandfather' },
  { id: 'mom', name: 'Mom', relationship: 'mother' },
  { id: 'dad', name: 'Dad', relationship: 'father' },
];

// ============================================
// DEFAULT TIME SLOTS
// ============================================
export const defaultTimeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00',
];

// ============================================
// COMMON BENEFITS (reusable across services)
// ============================================
const commonBenefits = {
  certifiedCare: {
    title: 'Certified Professional Care',
    description: 'All our caregivers are trained and certified professionals with extensive experience.',
  },
  backgroundVerified: {
    title: 'Background-Verified Staff',
    description: 'Every staff member undergoes thorough background verification for your peace of mind.',
  },
  friendly: {
    title: 'Friendly & Compassionate',
    description: 'Our team is selected for their warmth, patience, and genuine care.',
  },
  atHome: {
    title: 'At Home Service',
    description: 'All services are delivered at your doorstep, ensuring comfort and convenience.',
  },
  flexibleScheduling: {
    title: 'Flexible Scheduling',
    description: 'Choose times that work best for you with our flexible booking system.',
  },
  support247: {
    title: '24/7 Support Available',
    description: 'Our support team is available round the clock for any emergencies or queries.',
  },
};

// ============================================
// SERVICES DATA
// ============================================

const companionshipService: Service = {
  id: 'companionship',
  title: 'Companionship',
  categoryId: 'personal_companion',
  rating: 4.6,
  reviewCount: 22,
  image: 'companionship',
  shortTagline: 'Friendly companionship for your loved ones',
  description: 'Our companionship service provides meaningful social interaction and emotional support for seniors. Our trained companions engage in conversations, accompany on walks, assist with hobbies, and provide the human connection that enhances quality of life.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.backgroundVerified,
    commonBenefits.friendly,
    commonBenefits.atHome,
    commonBenefits.flexibleScheduling,
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'comp_4hr', label: '4 Hours', price: 20, durationMinutes: 240 },
      { id: 'comp_8hr', label: '8 Hours', price: 40, durationMinutes: 480 },
      { id: 'comp_12hr', label: '12 Hours', price: 60, originalPrice: 72, durationMinutes: 720, notes: '17% off' },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'duration',
    defaultDurationMinutes: 240,
    availableTimeSlots: defaultTimeSlots,
    leadTimeHours: 2,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Any specific activities or preferences for the companion session...',
  },
};

const transportService: Service = {
  id: 'dynamic_transportation',
  title: 'Dynamic Transportation',
  categoryId: 'personal_companion',
  rating: 4.5,
  reviewCount: 18,
  image: 'transport',
  shortTagline: 'Safe and comfortable transportation',
  description: 'Our transportation service ensures safe, comfortable, and reliable travel for seniors. Whether it\'s a doctor\'s appointment, shopping trip, or social visit, our trained drivers provide door-to-door service.',
  benefits: [
    commonBenefits.backgroundVerified,
    commonBenefits.friendly,
    commonBenefits.flexibleScheduling,
    {
      title: 'Convenient Pick-Up and Drop-Off',
      description: 'We provide safe and comfortable transportation to and from your destination.',
    },
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'hourly',
    hourlyRate: 15,
    minHours: 1,
    maxHours: 8,
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: defaultTimeSlots,
    leadTimeHours: 4,
    maxDaysAhead: 14,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Please specify pickup location, destination, and any special requirements...',
  },
};

const expertNurseService: Service = {
  id: 'home_nurse',
  title: 'Expert Home Stay Nurse',
  categoryId: 'health_care',
  rating: 4.8,
  reviewCount: 67,
  image: 'nurse',
  shortTagline: 'Professional nursing care at home',
  description: 'Our Expert Home Stay Nurse service provides qualified nursing professionals who deliver medical care in the comfort of your home. From medication management and vital sign monitoring to wound care and post-operative support.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.backgroundVerified,
    commonBenefits.support247,
    commonBenefits.atHome,
    {
      title: 'Medical Expertise',
      description: 'All nurses are registered professionals with specialized geriatric training.',
    },
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'nurse_home_12', label: 'Home Aid - 12 hrs/day, 30 days', price: 360, durationMinutes: 720, notes: 'Basic assistance' },
      { id: 'nurse_home_24', label: 'Home Aid - 24 hrs/day, 30 days', price: 450, durationMinutes: 1440, notes: 'Round-the-clock' },
      { id: 'nurse_basic_12', label: 'Basic Nursing - 12 hrs/day', price: 375, durationMinutes: 720 },
      { id: 'nurse_basic_24', label: 'Basic Nursing - 24 hrs/day', price: 550, originalPrice: 600, durationMinutes: 1440, notes: '8% off' },
      { id: 'nurse_advanced', label: 'Advanced Nursing - 12 hrs/day', price: 500, durationMinutes: 720, notes: 'Complex care' },
      { id: 'nurse_critical', label: 'Critical Care - 12 hrs/day', price: 750, durationMinutes: 720, notes: 'ICU-trained nurses' },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['06:00', '07:00', '08:00', '09:00', '18:00', '19:00', '20:00'],
    leadTimeHours: 24,
    maxDaysAhead: 60,
  },
  request: {
    enabled: true,
    required: true,
    placeholder: 'Please describe the patient condition, required care level, and any medical history we should know...',
  },
};

const culturaspireService: Service = {
  id: 'culturaspire',
  title: 'Culturaspire',
  categoryId: 'daily_care',
  rating: 4.5,
  reviewCount: 12,
  image: 'culture',
  shortTagline: 'Cultural activities and enrichment programs',
  description: 'Culturaspire brings enriching cultural experiences to seniors. From music sessions and art classes to book clubs and cultural discussions, we help seniors stay mentally active and socially engaged.',
  benefits: [
    {
      title: 'Personalized Programs',
      description: 'Activities tailored to individual interests and abilities.',
    },
    {
      title: 'Expert Facilitators',
      description: 'Led by trained professionals in arts, music, and cultural studies.',
    },
    commonBenefits.friendly,
    commonBenefits.atHome,
  ],
  fulfillment: {
    mode: 'on_request',
    requiresPayment: false,
    allowBookingFee: true,
  },
  pricing: {
    type: 'quote',
    bookingFee: 25,
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'duration',
    defaultDurationMinutes: 120,
    availableTimeSlots: defaultTimeSlots,
    leadTimeHours: 48,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: true,
    placeholder: 'Tell us about your interests - music, art, literature, languages, or other cultural activities you\'d like to explore...',
  },
};

const gourmetFoodService: Service = {
  id: 'gourmet_food',
  title: 'Gourmet Food Delivery',
  categoryId: 'daily_care',
  rating: 4.5,
  reviewCount: 31,
  image: 'food',
  shortTagline: 'Healthy, delicious meals delivered daily',
  description: 'Our gourmet food service provides nutritionally balanced, delicious meals tailored to senior dietary needs. Our expert nutritionists design menus that accommodate health conditions.',
  benefits: [
    {
      title: 'Customized Meal Plans',
      description: 'Meals designed around your specific health needs and taste preferences.',
    },
    {
      title: 'Fresh Daily Delivery',
      description: 'Freshly prepared meals delivered to your doorstep every day.',
    },
    {
      title: 'Expert Nutritionist Oversight',
      description: 'All menus are reviewed and approved by certified nutritionists.',
    },
    commonBenefits.flexibleScheduling,
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'daily',
    dailyRate: 25,
    minDays: 7,
    maxDays: 30,
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    timeMode: 'start_only',
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: true,
    placeholder: 'Please describe dietary requirements, allergies, preferred cuisine, and any health conditions...',
  },
};

const doctorVisitService: Service = {
  id: 'doctor_visit',
  title: 'Doctor Visit',
  categoryId: 'health_care',
  rating: 4.6,
  reviewCount: 89,
  image: 'doctor',
  shortTagline: 'Qualified doctors at your doorstep',
  description: 'Our Doctor Visit service brings qualified physicians to your home for consultations, check-ups, and follow-up visits. Skip the hassle of hospital queues.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    commonBenefits.flexibleScheduling,
    {
      title: 'Comprehensive Consultations',
      description: 'Thorough examinations with prescription and follow-up recommendations.',
    },
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'fixed',
    price: 50,
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    leadTimeHours: 4,
    maxDaysAhead: 14,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Describe symptoms or reason for consultation...',
  },
};

const labTestingService: Service = {
  id: 'lab_testing',
  title: 'Lab Testing',
  categoryId: 'health_care',
  rating: 4.5,
  reviewCount: 56,
  image: 'lab',
  shortTagline: 'Home sample collection & lab tests',
  description: 'Our lab testing service provides convenient home sample collection for a wide range of diagnostic tests. Our trained phlebotomists ensure comfortable sample collection.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    {
      title: 'Quick Results',
      description: 'Most test results available within 24-48 hours.',
    },
    {
      title: 'Digital Reports',
      description: 'Access your reports online or receive them via email.',
    },
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'lab_basic', label: 'Basic Health Panel', price: 45, notes: 'CBC, Sugar, Lipid' },
      { id: 'lab_comprehensive', label: 'Comprehensive Panel', price: 120, originalPrice: 150, notes: '20% off - 40+ parameters' },
      { id: 'lab_diabetes', label: 'Diabetes Panel', price: 35, notes: 'HbA1c, Fasting, PP' },
      { id: 'lab_thyroid', label: 'Thyroid Panel', price: 40, notes: 'T3, T4, TSH' },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'],
    leadTimeHours: 12,
    maxDaysAhead: 14,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Any specific tests required or doctor prescription details...',
  },
};

const physiotherapyService: Service = {
  id: 'physiotherapy',
  title: 'Physiotherapy',
  categoryId: 'health_care',
  rating: 4.7,
  reviewCount: 52,
  image: 'physio',
  shortTagline: 'Expert physiotherapy at home',
  description: 'Our physiotherapy service brings qualified therapists to your home for rehabilitation, pain management, and mobility improvement.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    {
      title: 'Customized Treatment Plans',
      description: 'Therapy programs tailored to your specific needs and goals.',
    },
    {
      title: 'Progress Tracking',
      description: 'Regular assessments to monitor improvement and adjust treatment.',
    },
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'physio_single', label: 'Single Session (45 min)', price: 45, durationMinutes: 45 },
      { id: 'physio_5pack', label: '5 Session Package', price: 200, originalPrice: 225, notes: '11% off' },
      { id: 'physio_10pack', label: '10 Session Package', price: 360, originalPrice: 450, notes: '20% off' },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: defaultTimeSlots,
    leadTimeHours: 12,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: true,
    placeholder: 'Please describe the condition requiring therapy, any previous treatments, and your goals...',
  },
};

const healthCheckService: Service = {
  id: 'healthcheck',
  title: 'HealthCheck Visit',
  categoryId: 'health_care',
  rating: 4.5,
  reviewCount: 41,
  image: 'healthcheck',
  shortTagline: 'Comprehensive health assessments at home',
  description: 'Our HealthCheck Visit service provides thorough health assessments conducted at your home. Our medical team evaluates vital signs, reviews medications, and provides recommendations.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    {
      title: 'Detailed Health Report',
      description: 'Receive a comprehensive report with findings and recommendations.',
    },
    {
      title: 'Care Plan Development',
      description: 'Personalized care recommendations based on assessment results.',
    },
  ],
  fulfillment: {
    mode: 'on_request',
    requiresPayment: false,
    allowBookingFee: false,
  },
  pricing: {
    type: 'quote',
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_end',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: true,
    placeholder: 'Please describe any specific health concerns, current medications, and areas to focus on...',
  },
};

const deepCleaningService: Service = {
  id: 'deep_cleaning',
  title: 'Comprehensive Deep-Cleaning',
  categoryId: 'daily_care',
  rating: 5.0,
  reviewCount: 45,
  image: 'cleaning',
  shortTagline: 'Thorough home cleaning services',
  description: 'Our deep-cleaning service goes beyond regular cleaning to ensure a spotless, hygienic living environment. We use senior-safe, eco-friendly products.',
  benefits: [
    {
      title: 'Eco-Friendly Products',
      description: 'We use only safe, non-toxic cleaning products suitable for seniors.',
    },
    commonBenefits.backgroundVerified,
    commonBenefits.atHome,
    commonBenefits.flexibleScheduling,
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'hourly',
    hourlyRate: 20,
    minHours: 2,
    maxHours: 8,
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'duration',
    defaultDurationMinutes: 180,
    availableTimeSlots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
    leadTimeHours: 24,
    maxDaysAhead: 14,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Any specific areas to focus on or special cleaning requirements...',
  },
};

const yogaService: Service = {
  id: 'yoga',
  title: 'Yoga and Meditation',
  categoryId: 'health_care',
  rating: 4.7,
  reviewCount: 34,
  image: 'yoga',
  shortTagline: 'Gentle yoga and meditation for seniors',
  description: 'Our yoga and meditation service offers gentle, age-appropriate practices designed specifically for seniors. Our certified instructors focus on improving flexibility, balance, and mental well-being.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    commonBenefits.flexibleScheduling,
    {
      title: 'Senior-Adapted Practices',
      description: 'All exercises are modified for safety and accessibility.',
    },
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'yoga_single', label: 'Single Session (1 hour)', price: 30, durationMinutes: 60 },
      { id: 'yoga_weekly', label: 'Weekly Package (4 sessions)', price: 100, originalPrice: 120, notes: '17% off' },
      { id: 'yoga_monthly', label: 'Monthly Package (12 sessions)', price: 270, originalPrice: 360, notes: '25% off' },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['06:00', '07:00', '08:00', '17:00', '18:00', '19:00'],
    leadTimeHours: 12,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Any physical limitations or specific focus areas (flexibility, stress relief, etc.)...',
  },
};

const barberService: Service = {
  id: 'athome_barber',
  title: 'AtHome Barber Services',
  categoryId: 'daily_care',
  rating: 4.5,
  reviewCount: 28,
  image: 'barber',
  shortTagline: 'Professional grooming at your doorstep',
  description: 'Our at-home barber service brings professional grooming right to your door. Our experienced barbers are trained to work with seniors.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.backgroundVerified,
    commonBenefits.atHome,
    commonBenefits.flexibleScheduling,
  ],
  fulfillment: {
    mode: 'checkout',
    requiresPayment: true,
  },
  pricing: {
    type: 'fixed',
    price: 35,
    originalPrice: 40,
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    leadTimeHours: 4,
    maxDaysAhead: 14,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Any specific grooming preferences or requirements...',
  },
};

// ============================================
// TRANSACTIONAL CARE SERVICE
// ============================================

const transactionalCareService: Service = {
  id: 'transactional_care',
  title: 'Transactional Care',
  categoryId: 'health_care',
  rating: 5.0,
  reviewCount: 18,
  image: 'transactional_care',
  shortTagline: 'On-demand medical assistance',
  description: 'Quick, one-time medical care services for immediate needs. Our trained professionals provide essential care support when you need it most.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.backgroundVerified,
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'trans_basic', label: 'Basic Visit', price: 25, durationMinutes: 60 },
      { id: 'trans_extended', label: 'Extended Care', price: 45, durationMinutes: 120 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: defaultTimeSlots,
    leadTimeHours: 2,
    maxDaysAhead: 7,
  },
};

// ============================================
// SPECIAL PACKAGES
// ============================================

const cardiacPackageService: Service = {
  id: 'cardiac_package',
  title: 'Cardiac Package',
  categoryId: 'special_packages',
  rating: 5.0,
  reviewCount: 24,
  image: 'cardiac_package',
  shortTagline: 'Comprehensive cardiac care package',
  description: 'Complete cardiac health monitoring and care package including ECG, heart health checkup, medication management, and regular follow-ups.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 199, originalPrice: 249 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const oncologyPackageService: Service = {
  id: 'oncology_package',
  title: 'Oncology Package',
  categoryId: 'special_packages',
  rating: 4.5,
  reviewCount: 12,
  image: 'oncology_package',
  shortTagline: 'Specialized oncology support care',
  description: 'Comprehensive oncology care package with specialized nursing, medication management, pain management support, and emotional care.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 299, originalPrice: 349 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const neuroPackageService: Service = {
  id: 'neuro_package',
  title: 'Neuro Package',
  categoryId: 'special_packages',
  rating: 4.5,
  reviewCount: 15,
  image: 'neuro_package',
  shortTagline: 'Neurological care and rehabilitation',
  description: 'Specialized neurological care package including cognitive assessments, rehabilitation exercises, and ongoing monitoring.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 249, originalPrice: 299 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const cardiacBasicService: Service = {
  id: 'cardiac_basic',
  title: 'Cardiac Basic',
  categoryId: 'special_packages',
  rating: 4.5,
  reviewCount: 32,
  image: 'cardiac_basic',
  shortTagline: 'Essential cardiac monitoring',
  description: 'Basic cardiac health monitoring package with ECG and vital signs tracking.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 79, originalPrice: 99 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    leadTimeHours: 12,
    maxDaysAhead: 14,
  },
};

const orthoPackageService: Service = {
  id: 'ortho_package',
  title: 'Ortho Package',
  categoryId: 'special_packages',
  rating: 4.5,
  reviewCount: 19,
  image: 'ortho_package',
  shortTagline: 'Orthopedic care and support',
  description: 'Complete orthopedic care package including mobility assessment, physiotherapy, and pain management.',
  benefits: [
    commonBenefits.certifiedCare,
    commonBenefits.atHome,
    commonBenefits.flexibleScheduling,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 179, originalPrice: 219 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

// ============================================
// MEDICAL DEVICES AT HOME
// ============================================

const oxygenConcentratorService: Service = {
  id: 'oxygen_concentrator',
  title: 'Oxygen Concentrator',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 28,
  image: 'oxygen_concentrator',
  shortTagline: 'Medical-grade oxygen therapy at home',
  description: 'Rent medical-grade oxygen concentrators for home use with setup assistance and 24/7 technical support.',
  benefits: [
    commonBenefits.atHome,
    commonBenefits.support247,
    { title: 'Installation Included', description: 'Professional setup and training included.' },
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'oxy_week', label: 'Weekly Rental', price: 50, durationMinutes: 10080 },
      { id: 'oxy_month', label: 'Monthly Rental', price: 150, originalPrice: 200, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const bpapService: Service = {
  id: 'bpap',
  title: 'BPAP',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 16,
  image: 'bpap',
  shortTagline: 'Bilevel positive airway pressure device',
  description: 'BPAP machine rental for respiratory support with professional setup and monitoring.',
  benefits: [
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'bpap_week', label: 'Weekly Rental', price: 75, durationMinutes: 10080 },
      { id: 'bpap_month', label: 'Monthly Rental', price: 200, originalPrice: 300, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const cpapService: Service = {
  id: 'cpap',
  title: 'CPAP',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 22,
  image: 'cpap',
  shortTagline: 'Continuous positive airway pressure device',
  description: 'CPAP machine rental for sleep apnea treatment with professional setup and support.',
  benefits: [
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'cpap_week', label: 'Weekly Rental', price: 60, durationMinutes: 10080 },
      { id: 'cpap_month', label: 'Monthly Rental', price: 180, originalPrice: 240, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const medicalCotSingleService: Service = {
  id: 'medical_cot_single',
  title: 'Medical Cot Single Function',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 14,
  image: 'medical_cot_single',
  shortTagline: 'Single-function hospital bed rental',
  description: 'Single-function medical cot for home care with adjustable head position.',
  benefits: [
    commonBenefits.atHome,
    { title: 'Delivery & Setup', description: 'Free delivery and professional setup included.' },
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'cot1_week', label: 'Weekly Rental', price: 40, durationMinutes: 10080 },
      { id: 'cot1_month', label: 'Monthly Rental', price: 120, originalPrice: 160, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 48,
    maxDaysAhead: 30,
  },
};

const medicalCotTwoService: Service = {
  id: 'medical_cot_two',
  title: 'Medical Cot Two Function',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 11,
  image: 'medical_cot_two',
  shortTagline: 'Two-function hospital bed rental',
  description: 'Two-function medical cot with adjustable head and leg positions for enhanced comfort.',
  benefits: [
    commonBenefits.atHome,
    { title: 'Delivery & Setup', description: 'Free delivery and professional setup included.' },
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'cot2_week', label: 'Weekly Rental', price: 55, durationMinutes: 10080 },
      { id: 'cot2_month', label: 'Monthly Rental', price: 160, originalPrice: 220, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 48,
    maxDaysAhead: 30,
  },
};

const alfaBedService: Service = {
  id: 'alfa_bed',
  title: 'Alfa Bed',
  categoryId: 'medical_devices',
  rating: 5.0,
  reviewCount: 9,
  image: 'alfa_bed',
  shortTagline: 'Premium multi-function hospital bed',
  description: 'Premium Alfa bed with multiple adjustable positions, side rails, and IV pole attachment.',
  benefits: [
    commonBenefits.atHome,
    commonBenefits.support247,
    { title: 'Premium Quality', description: 'Hospital-grade equipment for maximum comfort.' },
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'alfa_week', label: 'Weekly Rental', price: 80, durationMinutes: 10080 },
      { id: 'alfa_month', label: 'Monthly Rental', price: 250, originalPrice: 320, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 48,
    maxDaysAhead: 30,
  },
};

const cardiacMonitorService: Service = {
  id: 'cardiac_monitor',
  title: 'Cardiac Monitor',
  categoryId: 'medical_devices',
  rating: 5.0,
  reviewCount: 17,
  image: 'cardiac_monitor',
  shortTagline: 'Continuous cardiac monitoring device',
  description: 'Portable cardiac monitor for continuous heart rhythm monitoring at home.',
  benefits: [
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'cm_week', label: 'Weekly Rental', price: 45, durationMinutes: 10080 },
      { id: 'cm_month', label: 'Monthly Rental', price: 130, originalPrice: 180, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const syringePumpService: Service = {
  id: 'syringe_pump',
  title: 'Syringe Pump',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 8,
  image: 'syringe_pump',
  shortTagline: 'Precision medication delivery device',
  description: 'Medical syringe pump for precise medication administration at controlled rates.',
  benefits: [
    commonBenefits.atHome,
    commonBenefits.support247,
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: {
    type: 'packages',
    packages: [
      { id: 'sp_week', label: 'Weekly Rental', price: 35, durationMinutes: 10080 },
      { id: 'sp_month', label: 'Monthly Rental', price: 100, originalPrice: 140, durationMinutes: 43200 },
    ],
  },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 24,
    maxDaysAhead: 30,
  },
};

const medicineDeliveryService: Service = {
  id: 'medicine_delivery',
  title: 'Medicine Delivery',
  categoryId: 'medical_devices',
  rating: 4.5,
  reviewCount: 45,
  image: 'medicine_delivery',
  shortTagline: 'Doorstep medicine delivery service',
  description: 'Fast and reliable medicine delivery service. Upload prescription and get medicines delivered to your doorstep.',
  benefits: [
    commonBenefits.atHome,
    { title: 'Same Day Delivery', description: 'Orders before 2 PM delivered same day.' },
    { title: 'Prescription Upload', description: 'Easy prescription upload via app.' },
  ],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 5, notes: 'Delivery fee only. Medicine cost additional.' },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: false,
    leadTimeHours: 4,
    maxDaysAhead: 7,
  },
  request: {
    enabled: true,
    required: true,
    placeholder: 'List medicines needed or upload prescription...',
  },
};

// ============================================
// SERVICE CATEGORIES
// ============================================

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'personal_companion',
    title: 'Personal Companion',
    items: [companionshipService, transportService],
  },
  {
    id: 'daily_care',
    title: 'Daily Care Services',
    items: [gourmetFoodService, deepCleaningService, culturaspireService, barberService],
  },
  {
    id: 'health_care',
    title: 'Health Care',
    items: [
      yogaService,
      expertNurseService,
      transactionalCareService,
      physiotherapyService,
      doctorVisitService,
      labTestingService,
      healthCheckService,
    ],
  },
  {
    id: 'special_packages',
    title: 'Special Packages',
    items: [
      cardiacPackageService,
      oncologyPackageService,
      neuroPackageService,
      cardiacBasicService,
      orthoPackageService,
    ],
  },
  {
    id: 'medical_devices',
    title: 'Medical Devices at Home',
    items: [
      oxygenConcentratorService,
      bpapService,
      cpapService,
      medicalCotSingleService,
      medicalCotTwoService,
      alfaBedService,
      cardiacMonitorService,
      syringePumpService,
      medicineDeliveryService,
    ],
  },
];

// Flat list of all services for easy lookup
export const allServices: Service[] = serviceCategories.flatMap(cat => cat.items);

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    title: 'Monthly Plan',
    price: 30,
    periodLabel: '1 Month',
    rating: 4.5,
    image: 'one_month',
    benefits: [
      'Access to all basic services',
      'Priority booking',
      '24/7 customer support',
      'Free cancellation up to 24h before',
    ],
  },
  {
    id: 'half_yearly',
    title: 'Half Yearly Plan',
    price: 150,
    periodLabel: '6 Month',
    rating: 4.5,
    image: 'six_month',
    benefits: [
      'Everything in Monthly Plan',
      '15% discount on all services',
      'Free health checkup once',
      'Dedicated care coordinator',
    ],
  },
  {
    id: 'yearly',
    title: 'Yearly Plan',
    price: 300,
    periodLabel: '12 Month',
    rating: 4.5,
    image: 'twelve_month',
    benefits: [
      'Everything in Half Yearly Plan',
      '25% discount on all services',
      'Free health checkup twice',
      'Family member coverage (up to 2)',
      'Priority emergency response',
    ],
  },
  {
    id: 'ask_carebow',
    title: 'Ask CareBow Plan',
    price: 20,
    periodLabel: 'AI Access',
    rating: 5.0,
    image: 'ask_carebow',
    benefits: [
      'Unlimited AI health consultations',
      'Personalized health insights',
      'Symptom tracking & history',
      'Smart care recommendations',
      'Integration with all services',
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a service by its ID
 * TODO: Replace with API call when backend is ready
 */
export function getServiceById(serviceId: string): Service | undefined {
  return allServices.find(service => service.id === serviceId);
}

/**
 * Get a subscription plan by its ID
 * TODO: Replace with API call when backend is ready
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === planId);
}

/**
 * Get category by service ID
 * TODO: Replace with API call when backend is ready
 */
export function getCategoryByServiceId(serviceId: string): ServiceCategory | undefined {
  return serviceCategories.find(category =>
    category.items.some(item => item.id === serviceId)
  );
}

/**
 * Get services by category ID
 * TODO: Replace with API call when backend is ready
 */
export function getServicesByCategory(categoryId: string): Service[] {
  const category = serviceCategories.find(cat => cat.id === categoryId);
  return category?.items || [];
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Calculate price based on pricing model and selections
 */
export function calculatePrice(
  pricing: Service['pricing'],
  selections: {
    packageId?: string;
    hours?: number;
    days?: number;
  }
): { subtotal: number; discount: number; total: number; label: string } {
  switch (pricing.type) {
    case 'fixed': {
      const discount = pricing.originalPrice ? pricing.originalPrice - pricing.price : 0;
      return {
        subtotal: pricing.originalPrice || pricing.price,
        discount,
        total: pricing.price,
        label: 'Fixed Price',
      };
    }

    case 'packages': {
      const pkg = pricing.packages.find(p => p.id === selections.packageId);
      if (!pkg) return { subtotal: 0, discount: 0, total: 0, label: 'Select Package' };
      const discount = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
      return {
        subtotal: pkg.originalPrice || pkg.price,
        discount,
        total: pkg.price,
        label: pkg.label,
      };
    }

    case 'hourly': {
      const hours = selections.hours || pricing.minHours;
      const total = hours * pricing.hourlyRate;
      return {
        subtotal: total,
        discount: 0,
        total,
        label: `$${pricing.hourlyRate}/hr × ${hours} hrs`,
      };
    }

    case 'daily': {
      const days = selections.days || pricing.minDays;
      const total = days * pricing.dailyRate;
      return {
        subtotal: total,
        discount: 0,
        total,
        label: `$${pricing.dailyRate}/day × ${days} days`,
      };
    }

    case 'quote': {
      if (pricing.bookingFee) {
        return {
          subtotal: pricing.bookingFee,
          discount: 0,
          total: pricing.bookingFee,
          label: 'Booking Fee',
        };
      }
      return {
        subtotal: 0,
        discount: 0,
        total: 0,
        label: 'On Request',
      };
    }

    default:
      return { subtotal: 0, discount: 0, total: 0, label: '' };
  }
}

/**
 * Format time string for display (24h to 12h)
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours} hr ${mins} min`;
}
