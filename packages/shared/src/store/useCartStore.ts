import { create } from 'zustand';

interface CartItem {
  serviceId: string;
  serviceName: string;
  priceUSD: number;
  quantity: number;
  memberId?: string;
  memberName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
}

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (serviceId: string) => void;
  updateItem: (serviceId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;

  getTotalUSD: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],

  addItem: (item) => set((state) => {
    const existingIndex = state.items.findIndex(i => i.serviceId === item.serviceId);
    if (existingIndex >= 0) {
      const newItems = [...state.items];
      newItems[existingIndex] = { ...newItems[existingIndex], ...item };
      return { items: newItems };
    }
    return { items: [...state.items, item] };
  }),

  removeItem: (serviceId) => set((state) => ({
    items: state.items.filter(i => i.serviceId !== serviceId),
  })),

  updateItem: (serviceId, updates) => set((state) => ({
    items: state.items.map(i =>
      i.serviceId === serviceId ? { ...i, ...updates } : i
    ),
  })),

  clearCart: () => set({ items: [] }),

  getTotalUSD: () => {
    return get().items.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
