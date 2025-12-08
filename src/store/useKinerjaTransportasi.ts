import { create } from "zustand";
import type {
  GetKinerjaTransportasiResponse,
  KinerjaTransportasiData,
} from "../interfaces/kinerjaTransportasi";

import { kinerjaTransportasiService } from "../services/kinerjaTransportasiService";
import type {
  GetKinerjaTransportasiAverageResponse,
  KinerjaTransportasiAverageItem,
} from "../interfaces/kinerjaTransportasiAvarage";

import type {
  GetKinerjaTransportasiListResponse,
  KinerjaTransportasiItem,
} from "../interfaces/kinerjaTransportasiList";

interface KinerjaTransportasiStoreState {
  // --- Export Kinerja ---
  filterLayanan: string;
  setFilterLayanan: (layanan: string) => void;
  exportKinerja: (params?: {
    tahun?: number;
    layananId?: string;
  }) => Promise<void>;

  // --- Statistik Penumpang ---
  statistik: KinerjaTransportasiData | null;
  isLoading: boolean;
  error: string | null;
  fetchStatistikPenumpang: (tahun: number) => Promise<void>;
  resetStatistik: () => void;

  // --- Statistik Rata-rata ---
  statistikRataRata: KinerjaTransportasiAverageItem[] | null;
  isLoadingRataRata: boolean;
  errorRataRata: string | null;
  fetchStatistikRataRata: (tahun: number) => Promise<void>;
  resetStatistikRataRata: () => void;

  // --- Daftar Kinerja Transportasi ---
  kinerjaList: KinerjaTransportasiItem[] | null;
  isLoadingList: boolean;
  errorList: string | null;
  fetchKinerjaList: () => Promise<void>;
  resetKinerjaList: () => void;
}

export const useKinerjaTransportasiStore =
  create<KinerjaTransportasiStoreState>((set, get) => ({
    // --- Export ---
    filterLayanan: "Semua Layanan",
    setFilterLayanan: (val) => set({ filterLayanan: val }),

    exportKinerja: async (params) => {
      try {
        const { filterLayanan } = get();
        await kinerjaTransportasiService.exportKinerja({
          layananId:
            filterLayanan !== "Semua Layanan" ? filterLayanan : undefined,
          ...params,
        });
      } catch (error: any) {
        console.error("Gagal export data kinerja:", error);
        set({ error: "Gagal export data kinerja!" });
      }
    },

    // --- Statistik Penumpang ---
    statistik: null,
    isLoading: false,
    error: null,

    fetchStatistikPenumpang: async (tahun: number) => {
      set({ isLoading: true, error: null });
      try {
        const response: GetKinerjaTransportasiResponse =
          await kinerjaTransportasiService.getStatistikPenumpang(tahun);

        if (!response?.status || !response?.data) {
          throw new Error("Gagal mengambil data statistik penumpang.");
        }

        set({ statistik: response.data });
      } catch (error: any) {
        console.error("Fetch Statistik Penumpang Error:", error);
        set({
          error: error.message || "Terjadi kesalahan saat mengambil data.",
        });
      } finally {
        set({ isLoading: false });
      }
    },

    resetStatistik: () => set({ statistik: null }),

    // --- Statistik Rata-rata ---
    statistikRataRata: null,
    isLoadingRataRata: false,
    errorRataRata: null,

    fetchStatistikRataRata: async (tahun: number) => {
      set({ isLoadingRataRata: true, errorRataRata: null });
      try {
        const response: GetKinerjaTransportasiAverageResponse =
          await kinerjaTransportasiService.getStatistikRataRata(tahun);

        if (!response?.status || !response?.data) {
          throw new Error("Gagal mengambil data statistik rata-rata.");
        }

        set({ statistikRataRata: response.data });
      } catch (error: any) {
        console.error("Fetch Statistik Rata-Rata Error:", error);
        set({
          errorRataRata:
            error.message || "Terjadi kesalahan saat mengambil data.",
        });
      } finally {
        set({ isLoadingRataRata: false });
      }
    },

    resetStatistikRataRata: () => set({ statistikRataRata: null }),

    // --- Daftar Kinerja Transportasi ---
    kinerjaList: null,
    isLoadingList: false,
    errorList: null,

    fetchKinerjaList: async () => {
      set({ isLoadingList: true, errorList: null });
      try {
        const response: GetKinerjaTransportasiListResponse =
          await kinerjaTransportasiService.getKinerjaTransportasiList();

        if (!response?.status || !response?.data) {
          throw new Error("Gagal mengambil daftar kinerja transportasi.");
        }

        set({ kinerjaList: response.data });
      } catch (error: any) {
        console.error("Fetch Kinerja List Error:", error);
        set({
          errorList:
            error.message || "Terjadi kesalahan saat mengambil data kinerja.",
        });
      } finally {
        set({ isLoadingList: false });
      }
    },

    resetKinerjaList: () => set({ kinerjaList: null }),
  }));
