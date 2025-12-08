import { create } from "zustand";
import type {
  Halte,
  GetHalteResponse,
  GetHalteListParams,
} from "../interfaces/halte";
import { halteService } from "../services/halteService";

interface HalteStoreState {
  halte: Halte[];
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchHalte: (routeIds: string | string[]) => Promise<void>;
  fetchHalteList: (params: GetHalteListParams) => Promise<void>;
}

export const useHalteStore = create<HalteStoreState>((set) => ({
  halte: [],
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  isLoading: false,
  error: null,

  /**
   * Fetch halte
   */
  fetchHalte: async (routeIds) => {
    set({ isLoading: true, error: null });

    try {
      const response: GetHalteResponse = await halteService.getHalte(routeIds);

      set({
        halte: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({
        error: error.message || "Gagal mengambil data halte, coba lagi!",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHalteList: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const response: GetHalteResponse = await halteService.getHalteList(
        params
      );

      set({
        halte: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({
        error: error.message || "Gagal mengambil data halte list!",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
