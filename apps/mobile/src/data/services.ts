/** Pure booking-formatting utilities. The service catalog comes from `/v1/services`. */
import type { Service } from './types';

export function getDiscountPercentage(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function calculatePrice(
  pricing: Service['pricing'],
  selections: { packageId?: string; hours?: number; days?: number }
): { subtotal: number; discount: number; total: number; label: string } {
  switch (pricing.type) {
    case 'fixed': {
      const discount = pricing.originalPrice ? pricing.originalPrice - pricing.price : 0;
      return {
        subtotal: pricing.originalPrice || pricing.price,
        discount,
        total: pricing.price,
        label: 'Service fee',
      };
    }
    case 'packages': {
      const pkg = pricing.packages.find((item) => item.id === selections.packageId);
      if (!pkg) return { subtotal: 0, discount: 0, total: 0, label: 'Select package' };
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
        label: `₹${pricing.hourlyRate}/hr × ${hours} hrs`,
      };
    }
    case 'daily': {
      const days = selections.days || pricing.minDays;
      const total = days * pricing.dailyRate;
      return {
        subtotal: total,
        discount: 0,
        total,
        label: `₹${pricing.dailyRate}/day × ${days} days`,
      };
    }
    case 'quote':
      return pricing.bookingFee
        ? {
            subtotal: pricing.bookingFee,
            discount: 0,
            total: pricing.bookingFee,
            label: 'Booking fee',
          }
        : { subtotal: 0, discount: 0, total: 0, label: 'Price confirmed by CareBow' };
  }
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr${hours > 1 ? 's' : ''}`;
}
