import api from "../utils/api";

class UploadService {
  /**
   * Mengunggah file ke server.
   */
  async uploadFile(file: File): Promise<{ filename: string; withUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data?.data;

      return {
        filename: result?.filename,
        withUrl: result?.withUrl,
      };
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengunggah file"
      );
    }
  }
}

export const uploadService = new UploadService();
