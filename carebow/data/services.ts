/**
 * CareBow Services Data
 * Single source of truth for all services and subscription plans
 */

import { ServiceCategory, ServiceItem, SubscriptionPlan } from './types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'personal_companion',
    title: 'Personal Companion',
    items: [
      { id: 'companionship', title: 'Companionship', rating: 4.5, image: 'companionship' },
      { id: 'dynamic_transportation', title: 'Dynamic Transportation Services', rating: 4.5, image: 'transport' },
    ],
  },
  {
    id: 'daily_care',
    title: 'Daily Care Services',
    items: [
      { id: 'gourmet_food', title: 'Gourmet Food Delivery and Nutritional Planning', rating: 4.5, image: 'food' },
      { id: 'deep_cleaning', title: 'Comprehensive Deep-Cleaning', rating: 5.0, image: 'cleaning' },
      { id: 'culturaspire', title: 'Culturaspire', rating: 4.5, image: 'culture' },
      { id: 'athome_barber', title: 'AtHome Barber Services', rating: 4.5, image: 'barber' },
    ],
  },
  {
    id: 'health_care',
    title: 'Health Care',
    items: [
      { id: 'yoga', title: 'Yoga and Meditation', rating: 4.5, image: 'yoga' },
      { id: 'home_nurse', title: 'Expert Home Stay Nurse', rating: 4.5, image: 'nurse' },
      { id: 'transactional_care', title: 'Transactional Care', rating: 5.0, image: 'transactional' },
      { id: 'physiotherapy', title: 'Physiotherapy', rating: 4.5, image: 'physio' },
      { id: 'doctor_visit', title: 'Doctor Visit', rating: 4.5, image: 'doctor' },
      { id: 'lab_testing', title: 'Lab Testing', rating: 4.5, image: 'lab' },
      { id: 'healthcheck', title: 'HealthCheck Visit', rating: 4.5, image: 'healthcheck' },
    ],
  },
  {
    id: 'special_packages',
    title: 'Special Packages',
    items: [
      { id: 'cardiac_package', title: 'Cardiac Package', rating: 4.5, image: 'cardiac' },
      { id: 'oncology_package', title: 'Oncology Package', rating: 4.0, image: 'oncology' },
      { id: 'neuro_package', title: 'Neuro Package', rating: 4.5, image: 'neuro' },
      { id: 'cardiac_basic', title: 'Cardiac Basic', rating: 4.5, image: 'cardiac_basic' },
      { id: 'ortho_package', title: 'Ortho Package', rating: 4.5, image: 'ortho' },
    ],
  },
  {
    id: 'medical_devices',
    title: 'Medical Devices at Home',
    items: [
      { id: 'oxygen', title: 'Oxygen Concentrator', rating: 4.5, image: 'oxygen' },
      { id: 'bipap', title: 'BiPAP', rating: 4.0, image: 'bipap' },
      { id: 'cpap', title: 'CPAP', rating: 4.5, image: 'cpap' },
      { id: 'cot_single', title: 'Medical Cot Single Function', rating: 4.5, image: 'cot_single' },
      { id: 'cot_two', title: 'Medical Cot Two Function', rating: 4.5, image: 'cot_two' },
      { id: 'alfa_bed', title: 'Alfa Bed', rating: 4.5, image: 'alfa_bed' },
      { id: 'cardiac_monitor', title: 'Cardiac Monitor', rating: 5.0, image: 'cardiac_monitor' },
      { id: 'syringe_pump', title: 'Syringe Pump', rating: 4.5, image: 'syringe' },
      { id: 'medicine_delivery', title: 'Medicine Delivery', rating: 5.0, image: 'medicine' },
    ],
  },
];

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
    price: null,
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

// Helper function to get service by ID
export function getServiceById(serviceId: string): ServiceItem | undefined {
  for (const category of serviceCategories) {
    const service = category.items.find((item) => item.id === serviceId);
    if (service) return service;
  }
  return undefined;
}

// Helper function to get plan by ID
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((plan) => plan.id === planId);
}

// Helper function to get category by service ID
export function getCategoryByServiceId(serviceId: string): ServiceCategory | undefined {
  return serviceCategories.find((category) =>
    category.items.some((item) => item.id === serviceId)
  );
}
