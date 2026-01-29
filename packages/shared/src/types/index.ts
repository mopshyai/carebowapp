// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

// Family Members
export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'self' | 'parent' | 'spouse' | 'child' | 'other';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  avatarUrl?: string;
  healthConditions?: string[];
  medications?: Medication[];
  allergies?: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
}

// Services
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  priceUSD: number;
  originalPriceUSD?: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  icon: string;
  color: string;
  colorSoft: string;
  isPopular?: boolean;
  deliveryTime?: string;
  testsCount?: number;
  minHours?: number;
  features?: string[];
}

export type ServiceCategory =
  | 'Health Care'
  | 'Special Packages'
  | 'Medical Devices'
  | 'Daily Care'
  | 'Wellness';

// Orders
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalUSD: number;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
  address?: Address;
  notes?: string;
}

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  priceUSD: number;
  quantity: number;
  memberId?: string;
  memberName?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// AI Chat
export interface ChatSession {
  id: string;
  memberId?: string;
  memberName?: string;
  startedAt: string;
  endedAt?: string;
  triageLevel?: TriageLevel;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    triageLevel?: TriageLevel;
    recommendations?: ServiceRecommendation[];
    guidance?: HealthGuidance;
  };
}

export type TriageLevel = 'P1' | 'P2' | 'P3' | 'P4';

export interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  reason: string;
  urgency: 'immediate' | 'soon' | 'when_convenient';
}

export interface HealthGuidance {
  summary: string;
  selfCare?: string[];
  warningSign?: string[];
  traditionalRemedies?: TraditionalRemedy[];
}

export interface TraditionalRemedy {
  name: string;
  nameHindi?: string;
  description: string;
  preparation?: string;
  caution?: string;
}

// Safety
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface SOSEvent {
  id: string;
  userId: string;
  triggeredAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contactsNotified: string[];
  resolvedAt?: string;
  notes?: string;
}

// Address
export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Input Types
export interface CreateOrderInput {
  items: {
    serviceId: string;
    quantity: number;
    memberId?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  }[];
  addressId: string;
  notes?: string;
}

export interface CreateFamilyMemberInput {
  name: string;
  relationship: FamilyMember['relationship'];
  dateOfBirth: string;
  gender: FamilyMember['gender'];
  bloodGroup?: string;
  healthConditions?: string[];
  allergies?: string[];
}

export interface SOSData {
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

// API Responses
export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
}

export interface SOSResponse {
  eventId: string;
  contactsNotified: string[];
  emergencyNumber: string;
}
