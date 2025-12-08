import { create } from "zustand";
import type {
  CreateSurveyLapanganDinamisPayload,
  CreateSurveyLapanganDinamisResponse,
  CreateSurveyLapanganStatisPayload,
  CreateSurveyLapanganStatisResponse,
  GetSurveyParams,
  SurveyLapanganDinamis,
  SurveyLapanganStatis,
} from "../interfaces/surveyLapangan";
import { surveyLapanganService } from "../services/surveyLapanganService";

interface SurveyLapanganStoreState {
  surveyLapanganDinamis: SurveyLapanganDinamis[];
  surveyLapanganStatis: SurveyLapanganStatis[];
  isLoading: boolean;
  error: string | null;

  // Export survey
  filterLayanan: string;
  filterJenis: string;

  setFilterLayanan: (val: string) => void;
  setFilterJenis: (val: string) => void;
  exportSurvey: (params?: {
    layananId?: string;
    status?: string;
  }) => Promise<void>;

  /** Fetch Survey (Statis / Dinamis) */
  fetchSurveyLapangan: (
    jenis: "STATIS" | "DINAMIS",
    layananId?: string
  ) => Promise<void>;

  /** Create Survey Dinamis */
  createSurveyDinamis: (
    payload: CreateSurveyLapanganDinamisPayload
  ) => Promise<CreateSurveyLapanganDinamisResponse | void>;

  /** Create Survey Statis */
  createSurveyStatis: (
    payload: CreateSurveyLapanganStatisPayload
  ) => Promise<CreateSurveyLapanganStatisResponse | void>;

  clearError: () => void;
}

export const useSurveyLapanganStore = create<SurveyLapanganStoreState>(
  (set, get) => ({
    filterLayanan: "Semua Layanan",
    filterJenis: "Semua Jenis Survey",

    setFilterLayanan: (val) => set({ filterLayanan: val }),
    setFilterJenis: (val) => set({ filterJenis: val }),

    surveyLapanganDinamis: [],
    surveyLapanganStatis: [],
    isLoading: false,
    error: null,

    /** Fetch Survey Lapangan (Statis / Dinamis) */
    fetchSurveyLapangan: async (jenis, layananId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await surveyLapanganService.getSurveyLapangan(
          jenis,
          layananId
        );

        if (jenis === "STATIS") {
          set({
            surveyLapanganStatis: response.data as SurveyLapanganStatis[],
          });
        } else {
          set({
            surveyLapanganDinamis: response.data as SurveyLapanganDinamis[],
          });
        }
      } catch (error: any) {
        set({
          error:
            error.message ||
            `Gagal mengambil data survey lapangan ${jenis.toLowerCase()}`,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    /** Create Survey Lapangan Dinamis */
    createSurveyDinamis: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const response =
          await surveyLapanganService.createSurveyLapanganDinamis(payload);
        set((state) => ({
          surveyLapanganDinamis: [
            response.data,
            ...state.surveyLapanganDinamis,
          ],
        }));
        return response;
      } catch (error: any) {
        set({
          error: error.message || "Gagal membuat survey lapangan dinamis",
        });
      } finally {
        set({ isLoading: false });
      }
    },

    /** Create Survey Lapangan Statis */
    createSurveyStatis: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await surveyLapanganService.createSurveyLapanganStatis(
          payload
        );
        set((state) => ({
          surveyLapanganStatis: [response.data, ...state.surveyLapanganStatis],
        }));
        return response;
      } catch (error: any) {
        set({
          error: error.message || "Gagal membuat survey lapangan statis",
        });
      } finally {
        set({ isLoading: false });
      }
    },

    exportSurvey: async () => {
      const { filterLayanan, filterJenis } = get();

      const params: GetSurveyParams = {
        idLayanan:
          filterLayanan !== "Semua Layanan" ? filterLayanan : undefined,
        jenisSurvey:
          filterJenis !== "Semua Jenis Survey" ? filterJenis : undefined,
      };

      await surveyLapanganService.exportSurvey(params);
    },

    clearError: () => set({ error: null }),
  })
);
