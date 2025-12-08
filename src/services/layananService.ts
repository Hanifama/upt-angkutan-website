import type {
  GetLayananParams,
  GetLayananResponse,
} from "../interfaces/layanan";
import api from "../utils/api";

class LayananService {
  async getLayanan(params?: GetLayananParams): Promise<GetLayananResponse> {
    try {
      const response = await api.get<GetLayananResponse>("/layanan", {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data layanan"
      );
    }
  }
}

export const layananService = new LayananService();
