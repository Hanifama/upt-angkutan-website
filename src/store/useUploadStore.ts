import { create } from "zustand";
import { uploadService } from "../services/uploadService";

interface UploadedFile {
  filename: string;
  withUrl: string;
}

interface UploadStoreState {
  uploadedFile: UploadedFile | null;
  isLoading: boolean;
  error: string | null;

  uploadFile: (file: File) => Promise<UploadedFile>;
  resetUpload: () => void;
}

export const useUploadStore = create<UploadStoreState>((set) => ({
  uploadedFile: null,
  isLoading: false,
  error: null,

  uploadFile: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await uploadService.uploadFile(file);
      set({ uploadedFile: response });
      return response;
    } catch (err: any) {
      const message = err?.message || "Terjadi kesalahan saat mengunggah file";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  resetUpload: () => set({ uploadedFile: null, isLoading: false, error: null }),
}));
