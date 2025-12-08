import type { GetKinerjaTransportasiResponse } from "../interfaces/kinerjaTransportasi";
import type { GetKinerjaTransportasiAverageResponse } from "../interfaces/kinerjaTransportasiAvarage";
import type { GetKinerjaTransportasiListResponse } from "../interfaces/kinerjaTransportasiList";
import api from "../utils/api";
import { exportService } from "./exportService";

export const kinerjaTransportasiService = {
  async getStatistikPenumpang(
    tahun: number
  ): Promise<GetKinerjaTransportasiResponse> {
    const response = await api.get(
      `/kinerja-transportasi/statistics/penumpang`,
      {
        params: { tahun },
      }
    );
    return response.data;
  },

  async getStatistikRataRata(
    tahun: number
  ): Promise<GetKinerjaTransportasiAverageResponse> {
    const response = await api.get(`/kinerja-transportasi/statistics/average`, {
      params: { tahun },
    });
    return response.data;
  },

  async getKinerjaTransportasiList(): Promise<GetKinerjaTransportasiListResponse> {
    const response = await api.get(`/kinerja-transportasi`);
    return response.data;
  },

  // Export Kinerja
  async exportKinerja(params?: { layananId?: string }) {
    try {
      await exportService.exportToExcel(
        "kinerja-transportasi/export/raw",
        params,
        "kinerja_transportasi.xlsx"
      );
    } catch (error) {
      console.error("Gagal export data rute:", error);
      throw error;
    }
  },
};
