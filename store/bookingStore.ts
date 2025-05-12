// // store/bookingStore.ts
// import { create } from "zustand";
// import { BookingOption } from "@/types";

// interface BookingStore {
//   totalAmounts: Record<string, number>;
//   options: Record<string, BookingOption[]>;
//   loading: Record<string, boolean>;
//   error: Record<string, string | null>;
//   setTotalAmount: (bookingId: string, total: number) => void;
//   setOptions: (bookingId: string, newOptions: BookingOption[]) => void;
//   setLoading: (bookingId: string, loading: boolean) => void;
//   setError: (bookingId: string, error: string | null) => void;
//   resetStore: () => void;
//   calculateTotal: (serviceAmount: number, options: BookingOption[]) => number;
//   updateTotalAmount: (bookingId: string) => Promise<void>;
// }

// export const useBookingStore = create<BookingStore>((set, get) => ({
//   totalAmounts: {},
//   options: {},
//   loading: {},
//   error: {},

//   setTotalAmount: (bookingId, total) => {
//     set((state) => ({
//       totalAmounts: { ...state.totalAmounts, [bookingId]: total },
//     }));
//   },

//   setOptions: (bookingId, newOptions) => {
//     set((state) => ({
//       options: { ...state.options, [bookingId]: newOptions },
//     }));
//     get().updateTotalAmount(bookingId);
//   },

//   setLoading: (bookingId, loading) => {
//     set((state) => ({
//       loading: { ...state.loading, [bookingId]: loading },
//     }));
//   },

//   setError: (bookingId, error) => {
//     set((state) => ({
//       error: { ...state.error, [bookingId]: error },
//     }));
//   },

//   resetStore: () =>
//     set({
//       totalAmounts: {},
//       options: {},
//       loading: {},
//       error: {},
//     }),

//   calculateTotal: (serviceAmount, options) =>
//     options.reduce(
//       (total, option) => total + option.unitPrice * option.quantity,
//       serviceAmount
//     ),

//   updateTotalAmount: async (bookingId: string) => {
//     const bookingOptions = get().options[bookingId] || [];

//     set((state) => ({
//       loading: { ...state.loading, [bookingId]: true },
//       error: { ...state.error, [bookingId]: null },
//     }));

//     try {
//       const response = await fetch(`/api/bookings/${bookingId}/total`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ options: bookingOptions }),
//       });

//       if (!response.ok) throw new Error("Erreur de mise à jour du total");

//       const { totalAmount } = await response.json();
//       get().setTotalAmount(bookingId, totalAmount);
//     } catch (error) {
//       set((state) => ({
//         error: {
//           ...state.error,
//           [bookingId]:
//             error instanceof Error ? error.message : "Une erreur est survenue",
//         },
//       }));
//     } finally {
//       set((state) => ({
//         loading: { ...state.loading, [bookingId]: false },
//       }));
//     }
//   },
// }));
// lib/store/bookingStore.ts
import { create } from "zustand";
import { BookingOption } from "@/types";

interface BookingStore {
  totalAmounts: Record<string, number>;
  options: Record<string, BookingOption[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;

  setOptions: (bookingId: string, newOptions: BookingOption[]) => void;
  updateTotalAmount: (bookingId: string, serviceAmount: number) => void;
  setLoading: (bookingId: string, value: boolean) => void;
  setError: (bookingId: string, message: string | null) => void;
  resetStore: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  totalAmounts: {},
  options: {},
  loading: {},
  error: {},

  setOptions: (bookingId, newOptions) => {
    set((state) => ({
      options: { ...state.options, [bookingId]: newOptions },
    }));
  },

  updateTotalAmount: (bookingId, serviceAmount) => {
    const options = get().options[bookingId] || [];
    const total = options.reduce(
      (sum, opt) => sum + opt.unitPrice * opt.quantity,
      serviceAmount
    );
    set((state) => ({
      totalAmounts: { ...state.totalAmounts, [bookingId]: total },
    }));
  },

  setLoading: (bookingId, value) => {
    set((state) => ({
      loading: { ...state.loading, [bookingId]: value },
    }));
  },

  setError: (bookingId, message) => {
    set((state) => ({
      error: { ...state.error, [bookingId]: message },
    }));
  },

  resetStore: () => {
    set({ totalAmounts: {}, options: {}, loading: {}, error: {} });
  },
}));
