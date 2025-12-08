import type {
  GetKeluhanPenggunaResponse,
  CreateKeluhanPenggunaRequest,
  CreateKeluhanPenggunaResponse,
} from "../interfaces/keluhanPengguna";
import api from "../utils/api";
import { exportService } from "./exportService";

class KeluhanPenggunaService {
  /**
   * Mengambil daftar keluhan pengguna dengan pagination
   */
  async getKeluhanPengguna(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<GetKeluhanPenggunaResponse> {
    try {
      const params: Record<string, any> = { page, limit };
      if (search.trim() !== "") {
        params.search = search.trim();
      }

      const response = await api.get<GetKeluhanPenggunaResponse>(
        `/keluhan-pengguna`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Gagal mengambil data keluhan pengguna"
      );
    }
  }

  /**
   * Menambahkan keluhan pengguna baru
   */
  async createKeluhanPengguna(
    payload: CreateKeluhanPenggunaRequest
  ): Promise<CreateKeluhanPenggunaResponse> {
    try {
      const response = await api.post<CreateKeluhanPenggunaResponse>(
        "/keluhan-pengguna",
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menambahkan keluhan pengguna"
      );
    }
  }

  /**
   * export keluhan pengguna
   */
  async exportKeluhanPengguna() {
    try {
      await exportService.exportToExcel(
        "/driver/export/raw",
        undefined,
        "data_keluhan_pengguna.xlsx"
      );
    } catch (error) {
      console.error("Gagal export data rute:", error);
      throw error;
    }
  }
}

export const keluhanPenggunaService = new KeluhanPenggunaService();
