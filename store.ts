// // store.ts (Zustand store)
// import { create } from "zustand";

// interface Option {
//   id: string;
//   description: string;
//   amount: number;
// }

// interface BookingStore {
//   totalAmounts: Record<string, number>;
//   setTotalAmount: (id: string, amount: number) => void;
//   options: Record<string, Option[]>;
//   setOptions: (id: string, options: Option[]) => void;
// }

// export const useBookingStore = create<BookingStore>((set) => ({
//   totalAmounts: {},
//   options: {},
//   setTotalAmount: (id, amount) =>
//     set((state) => ({
//       totalAmounts: { ...state.totalAmounts, [id]: amount },
//     })),
//   setOptions: (id, options) =>
//     set((state) => ({
//       options: { ...state.options, [id]: options },
//     })),
// }));
///////////////////////////
// import { create } from "zustand";

// interface Option {
//   id: string;
//   description: string;
//   amount: number;
// }

// interface BookingStore {
//   totalAmounts: Record<string, number>;
//   options: Record<string, Option[]>;
//   setTotalAmount: (bookingId: string, total: number) => void;
//   setOptions: (bookingId: string, newOptions: Option[]) => void;
// }

// export const useBookingStore = create<BookingStore>((set) => ({
//   totalAmounts: {},
//   options: {},

//   setTotalAmount: (bookingId, total) =>
//     set((state) => ({
//       totalAmounts: { ...state.totalAmounts, [bookingId]: total },
//     })),

//   setOptions: (bookingId, newOptions) =>
//     set((state) => ({
//       options: { ...state.options, [bookingId]: newOptions },
//     })),
// }));
/////////////////////////
import { create } from "zustand";

interface Option {
  id: string;
  description: string;
  amount: number;
}

interface BookingStore {
  totalAmounts: Record<string, number>;
  options: Record<string, Option[]>;
  setTotalAmount: (bookingId: string, total: number) => void;
  setOptions: (bookingId: string, newOptions: Option[]) => void;
  resetStore: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  totalAmounts: {},
  options: {},

  setTotalAmount: (bookingId, total) =>
    set((state) => ({
      totalAmounts: { ...state.totalAmounts, [bookingId]: total },
    })),

  setOptions: (bookingId, newOptions) =>
    set((state) => ({
      options: { ...state.options, [bookingId]: newOptions },
    })),

  // ✅ Nouvelle méthode pour **réinitialiser** l'état global quand on change de page
  resetStore: () =>
    set({
      totalAmounts: {},
      options: {},
    }),
}));
