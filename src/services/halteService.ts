import api from "../utils/api";
import type { GetHalteListParams, GetHalteResponse } from "../interfaces/halte";

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
}

export const halteService = new HalteService();
