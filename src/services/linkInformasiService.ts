import type {
  GetLinkInformasiResponse,
  CreateLinkInformasiRequest,
  CreateLinkInformasiResponse,
  GetLinkInformasiParams,
} from "../interfaces/linkInformasi";
import api from "../utils/api";

class LinkInformasiService {
  /**
   * Mengambil daftar link informasi dengan pagination.
   */
  async getLinkInformasi(
    params?: GetLinkInformasiParams
  ): Promise<GetLinkInformasiResponse> {
    try {
      const queryParams = {
        type: "UPT",
        ...params,
      };

      const response = await api.get<GetLinkInformasiResponse>(
        "/link-informasi",
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data link informasi"
      );
    }
  }

  /**
   * Mengambil detail link informasi berdasarkan ID.
   */
  async getLinkInformasiById(linkInfoId: string) {
    try {
      const response = await api.get(`/link-informasi/${linkInfoId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Gagal mengambil detail link informasi"
      );
    }
  }

  /**
   * Menambahkan link informasi baru.
   */
  async createLinkInformasi(
    payload: CreateLinkInformasiRequest
  ): Promise<CreateLinkInformasiResponse> {
    try {
      const response = await api.post<CreateLinkInformasiResponse>(
        "/link-informasi",
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menambahkan link informasi"
      );
    }
  }

  /**
   * Memperbarui link informasi berdasarkan ID.
   */
  async updateLinkInformasi(
    linkInfoId: string,
    payload: CreateLinkInformasiRequest
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await api.put(`/link-informasi/${linkInfoId}`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui link informasi"
      );
    }
  }

  /**
   * Menghapus link informasi berdasarkan ID.
   */
  async deleteLinkInformasi(
    linkInfoId: string
  ): Promise<{ status: boolean; message: string }> {
    try {
      const response = await api.delete(`/link-informasi/${linkInfoId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menghapus link informasi"
      );
    }
  }
}

export const linkInformasiService = new LinkInformasiService();
