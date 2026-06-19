import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, variant, quantity) => {
    const existing = get().items.find(
      (i) => i.id === product.id && i.variantLabel === variant.label
    );
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === product.id && i.variantLabel === variant.label
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
            variantLabel: variant.label,
            variantColor: variant.color,
            quantity,
          },
        ],
      }));
    }
  },

  removeItem: (productId, variantLabel) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.id === productId && i.variantLabel === variantLabel)
      ),
    })),

  updateQuantity: (productId, variantLabel, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId && i.variantLabel === variantLabel
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
