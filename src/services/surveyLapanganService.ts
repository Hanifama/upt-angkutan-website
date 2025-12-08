import type {
  CreateSurveyLapanganDinamisPayload,
  CreateSurveyLapanganDinamisResponse,
  CreateSurveyLapanganStatisPayload,
  CreateSurveyLapanganStatisResponse,
  SurveyLapanganStatis,
  SurveyLapanganDinamis,
  GetSurveyLapanganResponse,
} from "../interfaces/surveyLapangan";
import api from "../utils/api";
import { exportService } from "./exportService";

class SurveyLapanganService {
  /** Create Survey Lapangan Dinamis */
  async createSurveyLapanganDinamis(
    payload: CreateSurveyLapanganDinamisPayload
  ): Promise<CreateSurveyLapanganDinamisResponse> {
    try {
      const response = await api.post<CreateSurveyLapanganDinamisResponse>(
        "/survey-lapangan",
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Gagal membuat data survey lapangan dinamis"
      );
    }
  }

  /** Create Survey Lapangan Statis */
  async createSurveyLapanganStatis(
    payload: CreateSurveyLapanganStatisPayload
  ): Promise<CreateSurveyLapanganStatisResponse> {
    try {
      const response = await api.post<CreateSurveyLapanganStatisResponse>(
        "/survey-lapangan",
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Gagal membuat data survey lapangan statis"
      );
    }
  }

  /** Get Survey Lapangan (Statis atau Dinamis) */
  async getSurveyLapangan<T extends "STATIS" | "DINAMIS">(
    jenisSurvey: T,
    layananId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<
    T extends "STATIS"
      ? GetSurveyLapanganResponse<SurveyLapanganStatis>
      : GetSurveyLapanganResponse<SurveyLapanganDinamis>
  > {
    try {
      const response = await api.get("/survey-lapangan", {
        params: {
          jenisSurvey, // "STATIS" atau "DINAMIS"
          layananId,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          `Gagal mengambil data survey lapangan ${jenisSurvey.toLowerCase()}`
      );
    }
  }

  // Export Survey
  async exportSurvey(params?: { jenisSurvey?: string; idLayanan?: string }) {
    try {
      const filename = `data_survey_${params?.jenisSurvey || "lapangan"}.xlsx`;

      await exportService.exportToExcel(
        "/survey-lapangan/export/raw",
        params,
        filename
      );
    } catch (error) {
      console.error("Gagal export data rute:", error);
      throw error;
    }
  }
}

export const surveyLapanganService = new SurveyLapanganService();
