import { create } from "zustand";

import type {
  LinkInformasi,
  CreateLinkInformasiRequest,
  CreateLinkInformasiResponse,
  GetLinkInformasiResponse,
} from "../interfaces/linkInformasi";

import { linkInformasiService } from "../services/linkInformasiService";

interface LinkInformasiStoreState {
  linkInformasi: LinkInformasi[];
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  selectedLinkInformasi: LinkInformasi | null;
  isLoading: boolean;
  error: string | null;

  fetchLinkInformasi: (
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<void>;
  setMeta: (newMeta: LinkInformasiStoreState["meta"]) => void;
  getDetailLinkInformasi: (id: string) => Promise<void>;
  createLinkInformasi: (payload: CreateLinkInformasiRequest) => Promise<void>;
  updateLinkInformasi: (
    id: string,
    payload: CreateLinkInformasiRequest
  ) => Promise<void>;
  deleteLinkInformasi: (id: string) => Promise<void>;
}

export const useLinkInformasiStore = create<LinkInformasiStoreState>((set) => ({
  linkInformasi: [],
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  selectedLinkInformasi: null,
  isLoading: false,
  error: null,

  /**
   * Mengambil daftar link informasi dari server dengan pagination.
   */
  fetchLinkInformasi: async (page = 1, limit = 10, search = "") => {
    set({ isLoading: true, error: null });
    try {
      const response: GetLinkInformasiResponse =
        await linkInformasiService.getLinkInformasi({ page, limit, search });
      set({
        linkInformasi: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({
        error:
          error.message || "Gagal mengambil data link informasi, coba lagi!",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Mengatur metadata pagination secara manual.
   */
  setMeta: (newMeta) => set({ meta: newMeta }),

  /**
   * Mengambil detail link informasi berdasarkan ID.
   */
  getDetailLinkInformasi: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await linkInformasiService.getLinkInformasiById(id);
      set({ selectedLinkInformasi: response.data });
    } catch (error: any) {
      set({
        error:
          error.message || "Gagal mengambil detail link informasi, coba lagi!",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Menambahkan link informasi baru.
   */
  createLinkInformasi: async (payload: CreateLinkInformasiRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: CreateLinkInformasiResponse =
        await linkInformasiService.createLinkInformasi(payload);

      if (!response.status) {
        throw new Error("Gagal menambahkan data link informasi!");
      }

      set((state) => ({
        linkInformasi: [response.data, ...state.linkInformasi],
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

  /**
   * Memperbarui data link informasi berdasarkan ID.
   */
  updateLinkInformasi: async (
    id: string,
    payload: CreateLinkInformasiRequest
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await linkInformasiService.updateLinkInformasi(
        id,
        payload
      );

      if (!response.status) {
        throw new Error("Gagal memperbarui data link informasi!");
      }

      set((state) => ({
        linkInformasi: state.linkInformasi.map((item) =>
          item.id === id ? { ...item, ...payload } : item
        ),
      }));
    } catch (error: any) {
      set({ error: "Gagal memperbarui data link informasi, coba lagi!" });
      throw new Error("Gagal memperbarui data link informasi, coba lagi!");
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Menghapus link informasi berdasarkan ID.
   */
  deleteLinkInformasi: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await linkInformasiService.deleteLinkInformasi(id);

      if (!response.status) {
        throw new Error("Gagal menghapus data link informasi!");
      }

      set((state) => ({
        linkInformasi: state.linkInformasi.filter((item) => item.id !== id),
        meta: {
          ...state.meta,
          totalData: state.meta.totalData - 1,
        },
      }));
    } catch (error: any) {
      set({
        error:
          error.message || "Gagal menghapus data link informasi, coba lagi!",
      });
      throw new Error("Gagal menghapus data link informasi, coba lagi!");
    } finally {
      set({ isLoading: false });
    }
  },
}));
