import { create } from "zustand";
import type {
  GetArmadaParams,
  Armada,
  ArmadaDetail,
  CreateArmadaPayload,
  ArmadaSummary,
} from "../interfaces/armada";
import { armadaService } from "../services/armadaService";

interface ArmadaStoreState {
  armadas: Armada[];
  selectedArmada: ArmadaDetail | null;
  summary: ArmadaSummary | null;
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  // Export Armada
  filterLayanan: string;
  setFilterLayanan: (val: string) => void;
  exportArmada: (params?: {
    layananId?: string;
    status?: string;
  }) => Promise<void>;

  fetchArmadas: (params?: GetArmadaParams) => Promise<void>;
  fetchArmadaSummary: () => Promise<void>;
  getArmadaById: (id: string) => Promise<ArmadaDetail | null>;
  createArmada: (payload: CreateArmadaPayload) => Promise<Armada | void>;
  updateArmada: (
    id: string,
    payload: Partial<CreateArmadaPayload>
  ) => Promise<ArmadaDetail | void>;
  deleteArmada: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useArmadaStore = create<ArmadaStoreState>((set, get) => ({
  filterLayanan: "Semua Jenis Layanan",

  setFilterLayanan: (val) => set({ filterLayanan: val }),

  armadas: [],
  summary: null,
  selectedArmada: null,
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  isLoading: false,
  error: null,

  fetchArmadas: async (params?: GetArmadaParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await armadaService.getArmadas(params);
      set({
        armadas: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch armadas" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArmadaSummary: async () => {
    set({ isLoading: true });
    try {
      const res = await armadaService.getArmadaSummary();
      set({ summary: res.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil ringkasan armada" });
    } finally {
      set({ isLoading: false });
    }
  },

  getArmadaById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await armadaService.getArmadaById(id);
      set({ selectedArmada: data });
      return data;
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch armada detail" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createArmada: async (payload: CreateArmadaPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await armadaService.createArmada(payload);
      set((state) => ({
        armadas: [response.data, ...state.armadas],
        meta: {
          ...state.meta,
          totalData: state.meta.totalData + 1,
        },
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.message || "Failed to create armada" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateArmada: async (id: string, payload: Partial<CreateArmadaPayload>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await armadaService.updateArmada(id, payload);
      set((state) => ({
        armadas: state.armadas.map((a) => (a.id === id ? updated : a)),
        selectedArmada: updated,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message || "Failed to update armada" });
    } finally {
      set({ isLoading: false });
    }
  },

  exportArmada: async () => {
    const { filterLayanan } = get();

    const params: GetArmadaParams = {};
    if (filterLayanan !== "Semua Jenis Layanan")
      params.layananId = filterLayanan;

    await armadaService.exportArmada(params);
  },

  deleteArmada: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await armadaService.deleteArmada(id);
      set((state) => ({
        armadas: state.armadas.filter((armada) => armada.id !== id),
      }));
    } catch (error: any) {
      set({ error: "Gagal menghapus armada, silakan coba lagi!" });
      throw new Error("Gagal menghapus armada, silakan coba lagi!");
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedArmada: null }),
}));
