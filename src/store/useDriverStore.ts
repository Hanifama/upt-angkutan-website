import { create } from "zustand";
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
  Driver,
  GetDriverResponse,
  DriverDetailResponse,
  DriverStatisticsSummary,
  GetDriverStatisticsSummaryResponse,
  GetDriverParams,
} from "../interfaces/driver";
import { driverService } from "../services/driverService";

interface DriverStoreState {
  drivers: Driver[];
  selectedDriver: Driver | null;
  statistics: DriverStatisticsSummary | null;
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  // Export Driver
  filterLayanan: string;
  setFilterLayanan: (val: string) => void;
  exportDriver: (params?: {
    layananId?: string;
    status?: string;
  }) => Promise<void>;

  importDriver: (file: File) => Promise<void>;

  fetchDrivers: (
    page?: number,
    limit?: number,
    params?: {
      status?: string;
      search?: string;
    }
  ) => Promise<void>;
  fetchDriverById: (driverId: string) => Promise<void>;
  fetchDriverStatistics: () => Promise<void>;
  setMeta: (newMeta: DriverStoreState["meta"]) => void;
  createDriver: (payload: CreateDriverPayload) => Promise<void>;
  updateDriver: (
    driverId: string,
    payload: UpdateDriverPayload
  ) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  resetSelectedDriver: () => void;
}

export const useDriverStore = create<DriverStoreState>((set, get) => ({
  filterLayanan: "Semua Jenis Layanan",

  setFilterLayanan: (val) => set({ filterLayanan: val }),

  drivers: [],
  selectedDriver: null,
  statistics: null,
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  isLoading: false,
  error: null,

  fetchDrivers: async (
    page = 1,
    limit = 10,
    params?: {
      status?: string;
      search?: string;
    }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response: GetDriverResponse = await driverService.getDrivers(
        page,
        limit,
        params
      );

      set({
        drivers: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil data driver" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDriverById: async (driverId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: DriverDetailResponse = await driverService.getDriverById(
        driverId
      );
      set({ selectedDriver: response.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil detail driver" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDriverStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response: GetDriverStatisticsSummaryResponse =
        await driverService.getDriverStatisticsSummary();
      set({ statistics: response.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil statistik pengemudi" });
    } finally {
      set({ isLoading: false });
    }
  },

  setMeta: (newMeta) => set({ meta: newMeta }),

  createDriver: async (payload: CreateDriverPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await driverService.createDriver(payload);
      if (!response?.status || !response?.data) {
        throw new Error("Gagal menambahkan data pengemudi. Silakan coba lagi!");
      }
      set((state) => ({
        drivers: [response.data, ...state.drivers],
        meta: { ...state.meta, totalData: state.meta.totalData + 1 },
      }));
    } catch (error) {
      console.error("CreateDriver Error:", error);
      const fallbackMessage =
        "Data belum berhasil tersimpan, silakan coba lagi!";
      set({ error: fallbackMessage });
      throw new Error(fallbackMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  updateDriver: async (driverId: string, payload: UpdateDriverPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await driverService.updateDriver(driverId, payload);
      if (!response?.status || !response?.data) {
        throw new Error("Gagal memperbarui data pengemudi. Silakan coba lagi!");
      }
      set((state) => ({
        drivers: state.drivers.map((d) =>
          d.id === driverId ? response.data : d
        ),
        selectedDriver: response.data,
      }));
    } catch (error: any) {
      set({ error: error.message || "Gagal memperbarui driver" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDriver: async (driverId: string) => {
    set({ isLoading: true, error: null });
    try {
      await driverService.deleteDriver(driverId);
      set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== driverId),
      }));
    } catch (error: any) {
      set({ error: error.message || "Gagal menghapus driver" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportDriver: async () => {
    const { filterLayanan } = get();

    const params: GetDriverParams = {};
    if (filterLayanan !== "Semua Layanan") params.layananId = filterLayanan;

    await driverService.exportDriver(params);
  },

  importDriver: async (file: File) => {
    set({ isLoading: true, error: null });

    try {
      const response = await driverService.importDriver(file);

      // Kalau API mengembalikan data hasil import (misal: successCount)
      console.log("Import success:", response);
    } catch (error: any) {
      set({
        error:
          error.message ||
          "Gagal mengimpor data driver, periksa file dan coba lagi!",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetSelectedDriver: () => set({ selectedDriver: null }),
}));
