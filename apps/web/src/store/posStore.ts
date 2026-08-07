import { create } from 'zustand';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface PosState {
  cart: CartItem[];
  locationId: string | null;
  customerId: string | null;
  discount: number;
  taxRate: number;
  
  // Actions
  setLocationId: (id: string) => void;
  setCustomer: (id: string | null) => void;
  setDiscount: (discount: number) => void;
  
  // Cart Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  
  // Computed
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  locationId: null,
  customerId: null,
  discount: 0,
  taxRate: 0.08875, // Default 8.875% tax (NYC)

  setLocationId: (id) => set({ locationId: id }),
  setCustomer: (id) => set({ customerId: id }),
  setDiscount: (discount) => set({ discount }),

  addItem: (newItem) => set((state) => {
    const existing = state.cart.find(
      (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
    );
    if (existing) {
      return {
        cart: state.cart.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { cart: [...state.cart, { ...newItem, quantity: 1 }] };
  }),

  removeItem: (productId, variantId) => set((state) => ({
    cart: state.cart.filter(
      (i) => !(i.productId === productId && i.variantId === variantId)
    ),
  })),

  updateQuantity: (productId, quantity, variantId) => set((state) => {
    if (quantity <= 0) {
      return {
        cart: state.cart.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        ),
      };
    }
    return {
      cart: state.cart.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      ),
    };
  }),

  clearCart: () => set({ cart: [], customerId: null, discount: 0 }),

  getSubtotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discountAmount = subtotal * (get().discount / 100);
    return (subtotal - discountAmount) * get().taxRate;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discountAmount = subtotal * (get().discount / 100);
    const tax = get().getTax();
    return subtotal - discountAmount + tax;
  },
}));
