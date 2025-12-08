import { create } from "zustand";
import type {
  GetRoutesParams,
  Route,
  CreateRouteRequest,
  CreateRouteResponse,
  UpdateRouteRequest,
  RouteDetailResponse,
  RouteStatisticsSummary,
} from "../interfaces/route";
import { routeService } from "../services/routesService";

interface RouteStoreState {
  routes: Route[];
  selectedRoute: Route | null;
  routesByLayanan: Route[]; // Rute berdasarkan layanan yang dipilih
  statistics: RouteStatisticsSummary | null;
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  // Export routes
  filterLayanan: string;
  filterStatus: string;
  searchTerm: string;

  setFilterLayanan: (val: string) => void;
  setFilterStatus: (val: string) => void;
  setSearchTerm: (val: string) => void;
  exportRoutes: (params?: {
    layananId?: string;
    status?: string;
  }) => Promise<void>;

  // functions service
  fetchRoutes: (params?: GetRoutesParams) => Promise<void>;
  fetchRouteById: (routeId: string) => Promise<void>;
  fetchRouteStatisticsSummary: () => Promise<void>;
  createRoute: (payload: CreateRouteRequest) => Promise<void>;
  updateRoute: (routeId: string, payload: UpdateRouteRequest) => Promise<void>;
  deleteRoute: (routeId: string) => Promise<void>;
  resetSelectedRoute: () => void;

  // New functions untuk optimasi
  fetchRoutesByLayanan: (layananId: string) => Promise<void>;
  setRoutesByLayanan: (routes: Route[]) => void;
  clearRoutesByLayanan: () => void;
}

export const useRouteStore = create<RouteStoreState>((set, get) => ({
  filterLayanan: "Semua Layanan",
  filterStatus: "Semua Status",
  searchTerm: "",

  setFilterLayanan: (val) => set({ filterLayanan: val }),
  setFilterStatus: (val) => set({ filterStatus: val }),
  setSearchTerm: (val) => set({ searchTerm: val }),

  routes: [],
  selectedRoute: null,
  routesByLayanan: [],
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

  fetchRoutes: async (params?: GetRoutesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routeService.getRoutes(params);
      set({
        routes: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil data rute" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRoutesByLayanan: async (layananId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routeService.getRoutes({ layananId });
      set({
        routesByLayanan: response.data,
      });
    } catch (error: any) {
      set({
        error: error.message || "Gagal mengambil data rute berdasarkan layanan",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setRoutesByLayanan: (routes: Route[]) => {
    set({ routesByLayanan: routes });
  },

  clearRoutesByLayanan: () => {
    set({ routesByLayanan: [] });
  },

  fetchRouteById: async (routeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: RouteDetailResponse = await routeService.getRouteById(
        routeId
      );
      set({ selectedRoute: response.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil detail rute" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRouteStatisticsSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await routeService.getRouteStatisticsSummary();
      if (!response.status || !response.data) {
        throw new Error("Gagal mengambil statistik rute");
      }
      set({ statistics: response.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil statistik rute" });
    } finally {
      set({ isLoading: false });
    }
  },

  resetSelectedRoute: () => set({ selectedRoute: null }),

  createRoute: async (payload: CreateRouteRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: CreateRouteResponse = await routeService.createRoute(
        payload
      );

      if (!response.status) {
        throw new Error("Gagal menambahkan data rute. Silakan coba lagi!");
      }

      set((state) => ({
        routes: [response.data, ...state.routes],
        meta: {
          ...state.meta,
          totalData: state.meta.totalData + 1,
        },
      }));
    } catch (error) {
      set({ error: "Data belum berhasil tersimpan, silakan coba lagi!" });
      throw new Error("Data belum berhasil tersimpan, silakan coba lagi!");
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoute: async (routeId: string, payload: UpdateRouteRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: RouteDetailResponse = await routeService.updateRoute(
        routeId,
        payload
      );

      if (!response.status) {
        throw new Error("Gagal memperbarui data rute. Silakan coba lagi!");
      }

      set((state) => ({
        routes: state.routes.map((r) =>
          r.routeId === routeId ? response.data : r
        ),
        selectedRoute: response.data,
      }));
    } catch (error) {
      set({ error: "Gagal memperbarui data rute, silakan coba lagi!" });
      throw new Error("Gagal memperbarui data rute, silakan coba lagi!");
    } finally {
      set({ isLoading: false });
    }
  },

  exportRoutes: async () => {
    const { filterLayanan, filterStatus } = get();

    const params: GetRoutesParams = {};
    if (filterLayanan !== "Semua Layanan") params.layananId = filterLayanan;
    if (filterStatus !== "Semua Status")
      params.status = filterStatus === "Aktif" ? "active" : "inactive";

    await routeService.exportRoutes(params);
  },

  deleteRoute: async (routeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await routeService.deleteRoute(routeId);

      set((state) => ({
        routes: state.routes.filter((r) => r.routeId !== routeId),
        meta: {
          ...state.meta,
          totalData: state.meta.totalData - 1,
        },
      }));
    } catch (error) {
      set({ error: "Gagal menghapus data rute, silakan coba lagi!" });
      throw new Error("Gagal menghapus data rute, silakan coba lagi!");
    } finally {
      set({ isLoading: false });
    }
  },
}));
