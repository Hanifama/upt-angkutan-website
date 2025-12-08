import type {
  CreateArmadaPayload,
  CreateArmadaResponse,
  GetArmadaParams,
  GetArmadaResponse,
  Armada,
  ArmadaDetail,
  GetArmadaSummaryResponse,
} from "../interfaces/armada";
import api from "../utils/api";
import { exportService } from "./exportService";

class ArmadaService {
  /** Get All Armada */
  async getArmadas(params?: GetArmadaParams): Promise<GetArmadaResponse> {
    try {
      const response = await api.get<GetArmadaResponse>("/armada", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data armada"
      );
    }
  }

  /** Get Armada by ID */
  async getArmadaById(id: string): Promise<ArmadaDetail> {
    try {
      const response = await api.get<{ data: ArmadaDetail }>(`/armada/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil detail armada"
      );
    }
  }

  /** Get Summary Armada */
  async getArmadaSummary(): Promise<GetArmadaSummaryResponse> {
    try {
      const response = await api.get<GetArmadaSummaryResponse>(
        "/armada/statistics/summary"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Gagal mengambil ringkasan statistik armada"
      );
    }
  }

  /** Create Armada */
  async createArmada(
    payload: CreateArmadaPayload
  ): Promise<CreateArmadaResponse> {
    try {
      const response = await api.post<CreateArmadaResponse>("/armada", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal membuat armada baru"
      );
    }
  }

  /**  Update Armada */
  async updateArmada(
    id: string,
    payload: Partial<CreateArmadaPayload>
  ): Promise<Armada> {
    try {
      const response = await api.put<{ data: Armada }>(
        `/armada/${id}`,
        payload
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui armada"
      );
    }
  }

  /** Delete Armada */
  async deleteArmada(id: string): Promise<void> {
    try {
      await api.delete(`/armada/${id}`);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menghapus armada"
      );
    }
  }

  // Export Armada
  async exportArmada(params?: { layananId?: string }) {
    try {
      await exportService.exportToExcel(
        "/armada/export/raw",
        params,
        "data_armada.xlsx"
      );
    } catch (error) {
      console.error("Gagal export data rute:", error);
      throw error;
    }
  }
}

export const armadaService = new ArmadaService();
