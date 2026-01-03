/**
 * CareBow Data Types
 */

export interface ServiceItem {
  id: string;
  title: string;
  rating: number;
  image: string;
  description?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  items: ServiceItem[];
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  price: number | null;
  periodLabel: string;
  rating: number;
  image: string;
  benefits?: string[];
}
