import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, variant, quantity) => {
    const existing = get().items.find(
      (i) => i.id === product.id && i.variantId === variant.id
    );
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === product.id && i.variantId === variant.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      }));
    } else {
      set((state) => ({
        items: [
          ...state.items,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            variantId: variant.id,
            variantLabel: variant.label,
            quantity,
          },
        ],
      }));
    }
  },

  removeItem: (productId, variantId) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.id === productId && i.variantId === variantId)
      ),
    })),

  updateQuantity: (productId, variantId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId && i.variantId === variantId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  totalCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
