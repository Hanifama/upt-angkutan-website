import api from "../utils/api";
import { exportService } from "./exportService";
import type {
  CreateHaltePayload,
  CreateHalteResponse,
  DeleteHalteResponse,
  GetHalteByIdResponse,
  GetHalteListParams,
  GetHalteResponse,
  HalteFormData,
  ImportHalteResponse,
  ToggleStatusResponse,
  UpdateHalteResponse,
} from "../interfaces/halte";

class HalteService {
  async getHalte(
    routeIds: string | string[],
    page = 1,
    limit = 1000
  ): Promise<GetHalteResponse> {
    try {
      const routeParam = Array.isArray(routeIds)
        ? routeIds.join(",")
        : routeIds;

      const response = await api.get<GetHalteResponse>(
        `/halte?routeIds=${routeParam}&page=${page}&limit=${limit}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data halte"
      );
    }
  }

  async getHalteList(params: GetHalteListParams): Promise<GetHalteResponse> {
    try {
      const { routeId, layananId, search, page = 1, limit = 5 } = params;

      const query = new URLSearchParams();

      // routeId sekarang single, cukup cek ada/tidak
      if (routeId) {
        query.append("routeId", String(routeId));
      }

      // layananId sekarang single juga
      if (layananId) {
        query.append("layananId", String(layananId));
      }

      if (search && search.trim() !== "") {
        query.append("search", search);
      }

      query.append("page", String(page));
      query.append("limit", String(limit));

      const response = await api.get<GetHalteResponse>(
        `/halte?${query.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data halte list"
      );
    }
  }

  /**
   * Create new halte
   */
  async createHalte(payload: CreateHaltePayload): Promise<CreateHalteResponse> {
    try {
      const response = await api.post<CreateHalteResponse>("/halte", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal membuat halte baru"
      );
    }
  }

  /**
   * Get halte by ID
   */
  async getHalteById(id: string): Promise<GetHalteByIdResponse> {
    try {
      const response = await api.get<GetHalteByIdResponse>(`/halte/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data halte"
      );
    }
  }

  /**
   * Update halte
   */
  async updateHalte(
    id: string,
    payload: Partial<CreateHaltePayload>
  ): Promise<UpdateHalteResponse> {
    try {
      const response = await api.put<UpdateHalteResponse>(
        `/halte/${id}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui halte"
      );
    }
  }

  /**
   * Delete halte
   */
  async deleteHalte(id: string): Promise<void> {
    try {
      await api.delete(`/halte/${id}`); // Perbaiki endpoint dari /haltes/ menjadi /halte/
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menghapus halte"
      );
    }
  }

  /**
   * Toggle halte status
   */
  async toggleStatus(id: string): Promise<ToggleStatusResponse> {
    try {
      const response = await api.patch<ToggleStatusResponse>(
        `/haltes/${id}/toggle-status`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengubah status halte"
      );
    }
  }

  /** Export Halte */
  async exportHalte(params?: {
    routeId?: string;
    layananId?: string;
  }): Promise<void> {
    try {
      await exportService.exportToExcel(
        "/halte/export", // Sesuaikan dengan endpoint backend Anda
        params,
        "data_halte.xlsx"
      );
    } catch (error: any) {
      console.error("Gagal export data halte:", error);
      throw new Error(
        error?.response?.data?.message || "Gagal mengekspor data halte"
      );
    }
  }

  /** Import Halte from Excel */
  async importHalte(file: File): Promise<ImportHalteResponse | void> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/halte/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengimpor data halte"
      );
    }
  }
}

export const halteService = new HalteService();
