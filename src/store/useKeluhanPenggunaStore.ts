import { create } from "zustand";

import type {
  KeluhanPengguna,
  CreateKeluhanPenggunaRequest,
  CreateKeluhanPenggunaResponse,
  GetKeluhanPenggunaResponse,
} from "../interfaces/keluhanPengguna";

import { keluhanPenggunaService } from "../services/keluhanPenggunaService";

interface KeluhanPenggunaStoreState {
  keluhanPengguna: KeluhanPengguna[];
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  selectedKeluhan: KeluhanPengguna | null;
  isLoading: boolean;
  error: string | null;

  fetchKeluhanPengguna: (
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<void>;
  setMeta: (newMeta: KeluhanPenggunaStoreState["meta"]) => void;
  createKeluhanPengguna: (
    payload: CreateKeluhanPenggunaRequest
  ) => Promise<void>;
}

export const useKeluhanPenggunaStore = create<KeluhanPenggunaStoreState>(
  (set) => ({
    keluhanPengguna: [],
    meta: {
      totalPages: 0,
      totalData: 0,
      totalDataPerPage: 0,
      page: 1,
      limit: 10,
    },
    selectedKeluhan: null,
    isLoading: false,
    error: null,

    /**
     * Mengambil daftar keluhan pengguna (future implementation)
     */
    fetchKeluhanPengguna: async (page = 1, limit = 10, search = "") => {
      set({ isLoading: true, error: null });
      try {
        const response: GetKeluhanPenggunaResponse =
          await keluhanPenggunaService.getKeluhanPengguna(page, limit, search);
        set({
          keluhanPengguna: response.data,
          meta: response.meta,
        });
      } catch (error: any) {
        set({
          error:
            error.message ||
            "Gagal mengambil data keluhan pengguna, coba lagi!",
        });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Mengatur metadata pagination secara manual
     */
    setMeta: (newMeta) => set({ meta: newMeta }),

    /**
     * Menambahkan keluhan pengguna baru
     */
    createKeluhanPengguna: async (payload: CreateKeluhanPenggunaRequest) => {
      set({ isLoading: true, error: null });
      try {
        const response: CreateKeluhanPenggunaResponse =
          await keluhanPenggunaService.createKeluhanPengguna(payload);

        if (!response.status) {
          throw new Error("Gagal menambahkan keluhan pengguna!");
        }

        set((state) => ({
          keluhanPengguna: [response.data, ...state.keluhanPengguna],
          meta: {
            ...state.meta,
            totalData: state.meta.totalData + 1,
          },
        }));
      } catch (error: any) {
        set({ error: "Data belum berhasil disimpan, silakan coba lagi!" });
        throw new Error("Data belum berhasil disimpan, silakan coba lagi!");
      } finally {
        set({ isLoading: false });
      }
    },
  })
);
