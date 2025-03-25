import { create } from "zustand";
import { Service } from "@/types";

interface ServiceStore {
  services: Service[];
  setServices: (newServices: Service[]) => void;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  setServices: (newServices) => {
    const currentServices = get().services;
    if (JSON.stringify(currentServices) !== JSON.stringify(newServices)) {
      set({ services: newServices }); // ✅ Met à jour uniquement si nécessaire
    }
  },
}));
