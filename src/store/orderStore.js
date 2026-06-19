import { create } from "zustand";

export const useOrderStore = create((set, get) => ({
  orders: [],

  addOrder: (items, total) => {
    set((state) => ({
      orders: [
        ...state.orders,
        {
          id: Date.now(),
          items,
          total,
          status: "Diproses",
          date: new Date().toLocaleDateString("id-ID"),
        },
      ],
    }));
  },

  getOrders: () => get().orders,
}));
