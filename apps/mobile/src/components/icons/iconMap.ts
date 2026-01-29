/**
 * CareBow Icon Map
 * Maps custom icon names to react-native-vector-icons
 * Uses Ionicons, MaterialCommunityIcons, and Feather for premium healthcare icons
 */

export type IconName =
  // Services
  | 'companionship'
  | 'transport'
  | 'nurse'
  | 'culture'
  | 'food'
  | 'doctor'
  | 'lab'
  | 'physio'
  | 'healthcheck'
  | 'cleaning'
  | 'yoga'
  | 'barber'
  | 'transactional_care'
  // Special Packages
  | 'cardiac_package'
  | 'oncology_package'
  | 'neuro_package'
  | 'cardiac_basic'
  | 'ortho_package'
  // Medical Devices
  | 'oxygen_concentrator'
  | 'bpap'
  | 'cpap'
  | 'medical_cot_single'
  | 'medical_cot_two'
  | 'alfa_bed'
  | 'cardiac_monitor'
  | 'syringe_pump'
  | 'medicine_delivery'
  // Subscription
  | 'ask_carebow'
  | 'calendar'
  | 'leaf'
  | 'trophy'
  | 'sparkles'
  // Navigation & UI
  | 'home'
  | 'home-filled'
  | 'messages'
  | 'messages-filled'
  | 'chat-ai'
  | 'chat-ai-filled'
  | 'user'
  | 'user-filled'
  // General UI
  | 'heart'
  | 'heart-filled'
  | 'star'
  | 'star-filled'
  | 'check'
  | 'check-circle'
  | 'arrow-right'
  | 'arrow-left'
  | 'plus'
  | 'minus'
  | 'close'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'settings'
  | 'bell'
  | 'search'
  | 'filter'
  | 'clock'
  | 'location'
  | 'phone'
  | 'mail'
  | 'shield'
  | 'shield-check'
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  | 'receipt'
  | 'document'
  | 'folder'
  | 'help'
  | 'video'
  | 'flash'
  | 'time'
  | 'stethoscope'
  | 'pulse'
  | 'bed'
  | 'wheelchair'
  | 'ambulance'
  | 'placeholder';

// =============================================================================
// ICON CATEGORY COLORS (Healthcare-safe palette)
// =============================================================================

export const iconCategoryColors = {
  // Personal Companion
  companionship: { primary: '#0D9488', background: '#CCFBF1' },
  transport: { primary: '#2563EB', background: '#DBEAFE' },

  // Daily Care
  food: { primary: '#EA580C', background: '#FFEDD5' },
  cleaning: { primary: '#0D9488', background: '#CCFBF1' },
  culture: { primary: '#7C3AED', background: '#EDE9FE' },
  barber: { primary: '#6366F1', background: '#E0E7FF' },

  // Health Care
  nurse: { primary: '#DB2777', background: '#FCE7F3' },
  doctor: { primary: '#0D9488', background: '#CCFBF1' },
  stethoscope: { primary: '#0D9488', background: '#CCFBF1' },
  lab: { primary: '#2563EB', background: '#DBEAFE' },
  physio: { primary: '#059669', background: '#D1FAE5' },
  healthcheck: { primary: '#0D9488', background: '#CCFBF1' },
  yoga: { primary: '#7C3AED', background: '#EDE9FE' },
  transactional_care: { primary: '#0891B2', background: '#CFFAFE' },

  // Special Packages
  cardiac_package: { primary: '#DC2626', background: '#FEE2E2' },
  cardiac_basic: { primary: '#EF4444', background: '#FEE2E2' },
  oncology_package: { primary: '#9333EA', background: '#F3E8FF' },
  neuro_package: { primary: '#2563EB', background: '#DBEAFE' },
  ortho_package: { primary: '#0891B2', background: '#CFFAFE' },

  // Medical Devices
  oxygen_concentrator: { primary: '#0891B2', background: '#CFFAFE' },
  bpap: { primary: '#6366F1', background: '#E0E7FF' },
  cpap: { primary: '#6366F1', background: '#E0E7FF' },
  medical_cot_single: { primary: '#64748B', background: '#F1F5F9' },
  medical_cot_two: { primary: '#64748B', background: '#F1F5F9' },
  alfa_bed: { primary: '#7C3AED', background: '#EDE9FE' },
  cardiac_monitor: { primary: '#DC2626', background: '#FEE2E2' },
  syringe_pump: { primary: '#0D9488', background: '#CCFBF1' },
  medicine_delivery: { primary: '#059669', background: '#D1FAE5' },

  // Subscriptions
  ask_carebow: { primary: '#8B5CF6', background: '#EDE9FE' },
  sparkles: { primary: '#8B5CF6', background: '#EDE9FE' },
  calendar: { primary: '#3B82F6', background: '#DBEAFE' },
  leaf: { primary: '#22C55E', background: '#DCFCE7' },
  trophy: { primary: '#F59E0B', background: '#FEF3C7' },

  // Navigation
  home: { primary: '#64748B', background: '#F1F5F9' },
  'home-filled': { primary: '#0D9488', background: '#CCFBF1' },
  messages: { primary: '#64748B', background: '#F1F5F9' },
  'messages-filled': { primary: '#0D9488', background: '#CCFBF1' },
  'chat-ai': { primary: '#8B5CF6', background: '#EDE9FE' },
  'chat-ai-filled': { primary: '#8B5CF6', background: '#EDE9FE' },

  // Status
  success: { primary: '#16A34A', background: '#DCFCE7' },
  warning: { primary: '#D97706', background: '#FEF3C7' },
  error: { primary: '#DC2626', background: '#FEE2E2' },
  info: { primary: '#2563EB', background: '#DBEAFE' },

  // General
  default: { primary: '#64748B', background: '#F1F5F9' },
};

// =============================================================================
// VECTOR ICON MAPPING
// Maps custom icon names to react-native-vector-icons
// =============================================================================

export type VectorIconLibrary = 'ionicons' | 'material-community' | 'feather';

export interface VectorIconMapping {
  library: VectorIconLibrary;
  name: string;
}

export const iconToVectorIcon: Record<IconName, VectorIconMapping> = {
  // ============================================
  // SERVICES - Professional Healthcare Icons
  // ============================================
  companionship: { library: 'ionicons', name: 'people-outline' },
  transport: { library: 'ionicons', name: 'car-outline' },
  nurse: { library: 'ionicons', name: 'heart-outline' },
  culture: { library: 'ionicons', name: 'book-outline' },
  food: { library: 'ionicons', name: 'restaurant-outline' },
  doctor: { library: 'material-community', name: 'stethoscope' },
  stethoscope: { library: 'material-community', name: 'stethoscope' },
  lab: { library: 'ionicons', name: 'flask-outline' },
  physio: { library: 'ionicons', name: 'fitness-outline' },
  healthcheck: { library: 'ionicons', name: 'clipboard-outline' },
  cleaning: { library: 'ionicons', name: 'sparkles-outline' },
  yoga: { library: 'material-community', name: 'yoga' },
  barber: { library: 'ionicons', name: 'cut-outline' },
  transactional_care: { library: 'ionicons', name: 'medical-outline' },

  // ============================================
  // SPECIAL PACKAGES - Medical specialties
  // ============================================
  cardiac_package: { library: 'ionicons', name: 'heart-outline' },
  cardiac_basic: { library: 'ionicons', name: 'heart-outline' },
  oncology_package: { library: 'material-community', name: 'atom' },
  neuro_package: { library: 'material-community', name: 'brain' },
  ortho_package: { library: 'material-community', name: 'bone' },

  // ============================================
  // MEDICAL DEVICES - Equipment icons
  // ============================================
  oxygen_concentrator: { library: 'material-community', name: 'lungs' },
  bpap: { library: 'material-community', name: 'lungs' },
  cpap: { library: 'material-community', name: 'sleep' },
  medical_cot_single: { library: 'ionicons', name: 'bed-outline' },
  medical_cot_two: { library: 'ionicons', name: 'bed-outline' },
  alfa_bed: { library: 'ionicons', name: 'bed-outline' },
  cardiac_monitor: { library: 'ionicons', name: 'pulse-outline' },
  syringe_pump: { library: 'material-community', name: 'needle' },
  medicine_delivery: { library: 'ionicons', name: 'medkit-outline' },

  // ============================================
  // SUBSCRIPTION ICONS
  // ============================================
  ask_carebow: { library: 'ionicons', name: 'sparkles' },
  sparkles: { library: 'ionicons', name: 'sparkles' },
  calendar: { library: 'ionicons', name: 'calendar-outline' },
  leaf: { library: 'ionicons', name: 'leaf-outline' },
  trophy: { library: 'ionicons', name: 'trophy-outline' },

  // ============================================
  // NAVIGATION ICONS (Tab Bar)
  // ============================================
  home: { library: 'ionicons', name: 'home-outline' },
  'home-filled': { library: 'ionicons', name: 'home' },
  messages: { library: 'ionicons', name: 'chatbubbles-outline' },
  'messages-filled': { library: 'ionicons', name: 'chatbubbles' },
  'chat-ai': { library: 'ionicons', name: 'sparkles-outline' },
  'chat-ai-filled': { library: 'ionicons', name: 'sparkles' },
  user: { library: 'ionicons', name: 'person-outline' },
  'user-filled': { library: 'ionicons', name: 'person' },

  // ============================================
  // GENERAL UI ICONS
  // ============================================
  heart: { library: 'ionicons', name: 'heart-outline' },
  'heart-filled': { library: 'ionicons', name: 'heart' },
  star: { library: 'ionicons', name: 'star-outline' },
  'star-filled': { library: 'ionicons', name: 'star' },
  check: { library: 'ionicons', name: 'checkmark' },
  'check-circle': { library: 'ionicons', name: 'checkmark-circle-outline' },
  'arrow-right': { library: 'ionicons', name: 'arrow-forward' },
  'arrow-left': { library: 'ionicons', name: 'arrow-back' },
  plus: { library: 'ionicons', name: 'add' },
  minus: { library: 'ionicons', name: 'remove' },
  close: { library: 'ionicons', name: 'close' },
  'chevron-right': { library: 'ionicons', name: 'chevron-forward' },
  'chevron-left': { library: 'ionicons', name: 'chevron-back' },
  'chevron-down': { library: 'ionicons', name: 'chevron-down' },
  'chevron-up': { library: 'ionicons', name: 'chevron-up' },
  settings: { library: 'ionicons', name: 'settings-outline' },
  bell: { library: 'ionicons', name: 'notifications-outline' },
  search: { library: 'ionicons', name: 'search-outline' },
  filter: { library: 'ionicons', name: 'filter-outline' },
  clock: { library: 'ionicons', name: 'time-outline' },
  time: { library: 'ionicons', name: 'time-outline' },
  location: { library: 'ionicons', name: 'location-outline' },
  phone: { library: 'ionicons', name: 'call-outline' },
  mail: { library: 'ionicons', name: 'mail-outline' },
  shield: { library: 'ionicons', name: 'shield-outline' },
  'shield-check': { library: 'ionicons', name: 'shield-checkmark-outline' },
  info: { library: 'ionicons', name: 'information-circle-outline' },
  warning: { library: 'ionicons', name: 'warning-outline' },
  success: { library: 'ionicons', name: 'checkmark-circle-outline' },
  error: { library: 'ionicons', name: 'close-circle-outline' },
  receipt: { library: 'ionicons', name: 'receipt-outline' },
  document: { library: 'ionicons', name: 'document-outline' },
  folder: { library: 'ionicons', name: 'folder-outline' },
  help: { library: 'ionicons', name: 'help-circle-outline' },
  video: { library: 'ionicons', name: 'videocam-outline' },
  flash: { library: 'ionicons', name: 'flash-outline' },
  pulse: { library: 'ionicons', name: 'pulse-outline' },
  bed: { library: 'ionicons', name: 'bed-outline' },
  wheelchair: { library: 'material-community', name: 'wheelchair-accessibility' },
  ambulance: { library: 'material-community', name: 'ambulance' },
  placeholder: { library: 'ionicons', name: 'help-circle-outline' },
};

// =============================================================================
// SERVICE IMAGE TO ICON MAPPING
// =============================================================================

export const serviceImageToIcon: Record<string, IconName> = {
  companionship: 'companionship',
  transport: 'transport',
  nurse: 'nurse',
  culture: 'culture',
  food: 'food',
  doctor: 'doctor',
  lab: 'lab',
  physio: 'physio',
  healthcheck: 'healthcheck',
  cleaning: 'cleaning',
  yoga: 'yoga',
  barber: 'barber',
  transactional_care: 'transactional_care',
  cardiac_package: 'cardiac_package',
  oncology_package: 'oncology_package',
  neuro_package: 'neuro_package',
  cardiac_basic: 'cardiac_basic',
  ortho_package: 'ortho_package',
  oxygen_concentrator: 'oxygen_concentrator',
  bpap: 'bpap',
  cpap: 'cpap',
  medical_cot_single: 'medical_cot_single',
  medical_cot_two: 'medical_cot_two',
  alfa_bed: 'alfa_bed',
  cardiac_monitor: 'cardiac_monitor',
  syringe_pump: 'syringe_pump',
  medicine_delivery: 'medicine_delivery',
  ask_carebow: 'sparkles',
  one_month: 'calendar',
  six_month: 'leaf',
  twelve_month: 'trophy',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getIconForService(serviceImage: string): IconName {
  return serviceImageToIcon[serviceImage] || 'placeholder';
}

export function getIconColors(iconName: IconName): { primary: string; background: string } {
  return iconCategoryColors[iconName as keyof typeof iconCategoryColors] || iconCategoryColors.default;
}

// Keep these exports for backward compatibility (they're used but won't render SVGs anymore)
export type IconDefinition = {
  path: string;
  viewBox: string;
  strokeWidth?: number;
  fillPath?: string;
};

export const iconDefinitions: Record<IconName, IconDefinition> = {} as any;
