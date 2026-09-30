import { create } from "zustand";
import type { Product } from "@/types/product";

interface QuickViewState {
  /** The card-level product the popup was opened from (details are fetched on open). */
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
}

export const useQuickViewStore = create<QuickViewState>()((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
