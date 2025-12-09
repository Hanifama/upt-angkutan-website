import { create } from "zustand";
import type {
  Halte,
  GetHalteResponse,
  GetHalteListParams,
  CreateHaltePayload,
  CreateHalteResponse,
} from "../interfaces/halte";
import { halteService } from "../services/halteService";

interface HalteStoreState {
  halte: Halte[];
  selectedHalte: Halte | null;
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  // Filter untuk export
  filterLayanan: string;
  filterRute: string;

  // Methods
  fetchHalte: (routeIds: string | string[]) => Promise<void>;
  fetchHalteList: (params: GetHalteListParams) => Promise<void>;
  createHalte: (payload: CreateHaltePayload) => Promise<Halte | undefined>;
  getHalteById: (id: string) => Promise<void>;
  updateHalte: (
    id: string,
    payload: Partial<CreateHaltePayload>
  ) => Promise<UpdateHalteResponse | void>; // Update return type
  deleteHalte: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleHalteStatus: (id: string) => Promise<void>;
  setSelectedHalte: (halte: Halte | null) => void;
  clearError: () => void;

  // Export Methods
  setFilterLayanan: (val: string) => void;
  setFilterRute: (val: string) => void;
  exportHalte: (params?: {
    routeId?: string;
    layananId?: string;
  }) => Promise<void>;
}

export const useHalteStore = create<HalteStoreState>((set, get) => ({
  halte: [],
  selectedHalte: null,
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  isLoading: false,
  error: null,

  // Filter states
  filterLayanan: "Semua Layanan",
  filterRute: "Semua Rute",

  /**
   * Fetch halte by route IDs
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
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Fetch halte list with pagination and filters
   */
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
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Create new halte
   */
  createHalte: async (payload: CreateHaltePayload) => {
    set({ isLoading: true, error: null });
    try {
      const response: CreateHalteResponse = await halteService.createHalte(
        payload
      );
      set((state) => ({
        halte: [response.data, ...state.halte],
        meta: {
          ...state.meta,
          totalData: state.meta.totalData + 1,
        },
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || "Gagal membuat halte" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Get single halte by ID
   */
  getHalteById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await halteService.getHalteById(id);
      set({ selectedHalte: response.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil detail halte" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Update halte
   */
  updateHalte: async (id: string, payload: Partial<CreateHaltePayload>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await halteService.updateHalte(id, payload);

      // Update local state
      set((state) => ({
        halte: state.halte.map((halte) =>
          halte.id === id ? { ...halte, ...response.data } : halte
        ),
        selectedHalte:
          state.selectedHalte?.id === id
            ? { ...state.selectedHalte, ...response.data }
            : state.selectedHalte,
      }));

      return response; // Return response untuk feedback
    } catch (error: any) {
      set({ error: error.message || "Gagal memperbarui halte" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete halte
   */
  deleteHalte: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await halteService.deleteHalte(id);
      set((state) => ({
        halte: state.halte.filter((halte) => halte.id !== id),
        meta: {
          ...state.meta,
          totalData: state.meta.totalData - 1,
        },
        selectedHalte:
          state.selectedHalte?.id === id ? null : state.selectedHalte,
      }));
      // Return success untuk feedback
      return { success: true, message: "Halte berhasil dihapus" };
    } catch (error: any) {
      const errorMessage = error.message || "Gagal menghapus halte";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Toggle halte status (aktif/nonaktif)
   */
  toggleHalteStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await halteService.toggleStatus(id);
      set((state) => ({
        halte: state.halte.map((halte) =>
          halte.id === id ? { ...halte, status: response.data.status } : halte
        ),
        selectedHalte:
          state.selectedHalte?.id === id
            ? { ...state.selectedHalte, status: response.data.status }
            : state.selectedHalte,
      }));
    } catch (error: any) {
      set({ error: error.message || "Gagal mengubah status halte" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Set filter layanan
   */
  setFilterLayanan: (val: string) => set({ filterLayanan: val }),

  /**
   * Set filter rute
   */
  setFilterRute: (val: string) => set({ filterRute: val }),

  /**
   * Export halte data
   */
  exportHalte: async (params?: { routeId?: string; layananId?: string }) => {
    const { filterLayanan, filterRute } = get();

    // Build params based on filters
    const exportParams: { routeId?: string; layananId?: string } = {};

    if (filterRute !== "Semua Rute") {
      exportParams.routeId = filterRute;
    }

    if (filterLayanan !== "Semua Layanan") {
      exportParams.layananId = filterLayanan;
    }

    // Merge with additional params if provided
    const finalParams = { ...exportParams, ...params };

    await halteService.exportHalte(finalParams);
  },

  /**
   * Import halte data from Excel file
   */
  importHalte: async (file: File): Promise<ImportHalteResponse | void> => {
    set({ isLoading: true, error: null });

    try {
      const response = await halteService.importHalte(file);

      // Jika import berhasil dan perlu refresh data
      if (response?.success) {
        // Refresh data halte setelah import berhasil
        const { filterLayanan, filterRute } = get();

        // Re-fetch data dengan filter yang sedang aktif
        await get().fetchHalteList({
          layananId:
            filterLayanan !== "Semua Layanan" ? filterLayanan : undefined,
          routeId: filterRute !== "Semua Rute" ? filterRute : undefined,
          page: 1,
          limit: get().meta.limit,
        });
      }

      return response;
    } catch (error: any) {
      set({
        error: error.message || "Gagal mengimpor data halte",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Set selected halte for editing
   */
  setSelectedHalte: (halte: Halte | null) => {
    set({ selectedHalte: halte });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
