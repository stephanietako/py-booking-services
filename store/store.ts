import { create } from "zustand";
import { Booking, Service } from "../types";

interface Option {
  id: string;
  amount: number;
  description: string;
  createdAt?: Date;
  serviceId?: string | null;
  service?: Service | null;
  bookings?: Booking[];
}

interface BookingStore {
  updateTotalAmount(bookingId: string): Promise<void>;
  totalAmounts: Record<string, number>;
  options: Record<string, Option[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  setTotalAmount: (bookingId: string, total: number) => void;
  setOptions: (bookingId: string, newOptions: Option[]) => void;
  setLoading: (bookingId: string, loading: boolean) => void;
  setError: (bookingId: string, error: string | null) => void;
  resetStore: () => void;
  calculateTotal: (serviceAmount: number, options: Option[]) => number;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  totalAmounts: {},
  options: {},
  loading: {},
  error: {},

  setTotalAmount: (bookingId, total) => {
    if (get().totalAmounts[bookingId] !== total) {
      set((state) => ({
        totalAmounts: { ...state.totalAmounts, [bookingId]: total },
      }));
    }
  },

  setOptions: (bookingId, newOptions) => {
    set((state) => ({
      options: { ...state.options, [bookingId]: newOptions },
    }));

    // 🔄 Mettre à jour le montant total en fonction des nouvelles options
    get().updateTotalAmount(bookingId);
  },

  setLoading: (bookingId, loading) => {
    if (get().loading[bookingId] !== loading) {
      set((state) => ({
        loading: { ...state.loading, [bookingId]: loading },
      }));
    }
  },

  setError: (bookingId, error) => {
    if (get().error[bookingId] !== error) {
      set((state) => ({
        error: { ...state.error, [bookingId]: error },
      }));
    }
  },

  resetStore: () =>
    set({
      totalAmounts: {},
      options: {},
      loading: {},
      error: {},
    }),

  calculateTotal: (serviceAmount, options) =>
    options.reduce((total, option) => total + option.amount, serviceAmount),

  // 🆕 Mise à jour du montant total en appelant l'API
  updateTotalAmount: async (bookingId: string) => {
    const bookingOptions = get().options[bookingId] || [];

    set((state) => ({
      loading: { ...state.loading, [bookingId]: true },
      error: { ...state.error, [bookingId]: null },
    }));

    try {
      const response = await fetch(`/api/bookings/${bookingId}/total`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: bookingOptions }),
      });

      if (!response.ok) throw new Error("Erreur de mise à jour du total");

      const { totalAmount } = await response.json();
      get().setTotalAmount(bookingId, totalAmount);
    } catch (error) {
      set((state) => ({
        error: {
          ...state.error,
          [bookingId]:
            error instanceof Error ? error.message : "Une erreur est survenue",
        },
      }));
    } finally {
      set((state) => ({
        loading: { ...state.loading, [bookingId]: false },
      }));
    }
  },
}));
