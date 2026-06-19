import { create } from "zustand";

export const useOrderStore = create((set, get) => ({
  orders: [],

  addOrder: (items, totalPrice) => {
    const newOrder = {
      id: Date.now(),
      items,
      totalPrice,
      status: "Sedang Dikemas",
      date: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder.id;
  },
}));
