import { create } from "zustand";
import type { Layanan, GetLayananParams } from "../interfaces/layanan";
import { layananService } from "../services/layananService";

/**
 * Interface representing the Layanan store state and actions.
 */
interface LayananStoreState {
  layanan: Layanan[];
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  /**
   * Fetches layanan with optional parameters.
   * Updates state with layanan data and meta information.
   */
  fetchLayanan: (params?: GetLayananParams) => Promise<void>;
}

/**
 * Zustand store for managing layanan.
 */
export const useLayananStore = create<LayananStoreState>((set) => ({
  layanan: [],
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  isLoading: false,
  error: null,

  fetchLayanan: async (params?: GetLayananParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await layananService.getLayanan(params);
      set({
        layanan: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch layanan" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
