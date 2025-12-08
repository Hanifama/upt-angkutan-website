import type {
  CreateRouteRequest,
  CreateRouteResponse,
  GetRoutesParams,
  GetRoutesResponse,
  UpdateRouteRequest,
  RouteDetailResponse,
  RouteStatisticsResponse,
} from "../interfaces/route";
import api from "../utils/api";
import { exportService } from "./exportService";

class RouteService {
  // Get all routes with query params
  async getRoutes(params?: GetRoutesParams): Promise<GetRoutesResponse> {
    try {
      const response = await api.get<GetRoutesResponse>("/route", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data rute"
      );
    }
  }

  // Get route by ID
  async getRouteById(routeId: string): Promise<RouteDetailResponse> {
    try {
      const response = await api.get<RouteDetailResponse>(`/route/${routeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data rute"
      );
    }
  }

  // Get route statistics summary
  async getRouteStatisticsSummary(): Promise<RouteStatisticsResponse> {
    try {
      const response = await api.get<RouteStatisticsResponse>(
        "/route/statistics/summary"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil statistik rute"
      );
    }
  }

  // Create route
  async createRoute(payload: CreateRouteRequest): Promise<CreateRouteResponse> {
    try {
      const response = await api.post<CreateRouteResponse>("/route", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal membuat data rute"
      );
    }
  }

  // Update route
  async updateRoute(
    routeId: string,
    payload: UpdateRouteRequest
  ): Promise<RouteDetailResponse> {
    try {
      const response = await api.put<RouteDetailResponse>(
        `/route/${routeId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui data rute"
      );
    }
  }

  // Delete route
  async deleteRoute(routeId: string): Promise<void> {
    try {
      await api.delete(`/route/${routeId}`);
    } catch (error: any) {
      throw new Error("Fitur gangguan, silakan coba lagi");
    }
  }

  // Export route
  async exportRoutes(params?: { layananId?: string; status?: string }) {
    try {
      await exportService.exportToExcel(
        "/route/export/raw",
        params,
        "data_rute.xlsx"
      );
    } catch (error) {
      console.error("Gagal export data rute:", error);
      throw error;
    }
  }

  async importRoutes(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/route/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengimpor data rute"
      );
    }
  }
}

export const routeService = new RouteService();
