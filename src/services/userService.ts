import api from "../utils/api";
import { exportService } from "./exportService";
import type {
  UserData,
  GetUsersResponse,
  GetUserByIdResponse,
  CreateUserPayload,
  UpdateUserPayload,
  ImportUsersResponse,
  DeleteUserResponse,
  RestoreUserResponse,
  GetUsersParams,
} from "../interfaces/user";

class UserService {
  /**
   * Get all users with filters
   */
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    try {
      const query = new URLSearchParams();

      if (params?.role) {
        if (Array.isArray(params.role)) {
          params.role.forEach((role) => query.append("role", role));
        } else {
          query.append("role", params.role);
        }
      }

      if (params?.search) {
        query.append("search", params.search);
      }

      if (params?.isActive !== undefined) {
        query.append("isActive", String(params.isActive));
      }

      if (params?.page) {
        query.append("page", String(params.page));
      }

      if (params?.limit) {
        query.append("limit", String(params.limit));
      }

      const queryString = query.toString();
      const url = `/user${queryString ? `?${queryString}` : ""}`;

      const response = await api.get<GetUsersResponse>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data pengguna"
      );
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    try {
      const response = await api.get<GetUserByIdResponse>(`/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil detail pengguna"
      );
    }
  }

  /**
   * Create new user (with auto-generated password BemoBandung25$)
   */
  async createUser(payload: CreateUserPayload): Promise<UserData> {
    try {
      // Format tanggal lahir jika ada
      const formattedPayload = {
        ...payload,
        tanggalLahir: payload.tanggalLahir
          ? this.formatDate(payload.tanggalLahir)
          : undefined,
        // Hapus avatar jika berupa file (untuk upload terpisah)
        avatar: typeof payload.avatar === "string" ? payload.avatar : undefined,
      };

      // Kirim ke endpoint auth/add-user
      const response = await api.post<UserData>(
        "/auth/add-user",
        formattedPayload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal membuat pengguna baru"
      );
    }
  }

  /**
   * Update user dengan payload partial
   */
  async updateUser(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<UserData> {
    try {
      // Format tanggal lahir jika ada
      const formattedPayload = {
        ...payload,
        tanggalLahir: payload.tanggalLahir
          ? this.formatDate(payload.tanggalLahir)
          : undefined,
        // Hapus avatar jika berupa file (untuk upload terpisah)
        avatar: typeof payload.avatar === "string" ? payload.avatar : undefined,
      };

      const response = await api.put<UserData>(
        `/user/${userId}`,
        formattedPayload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui pengguna"
      );
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    try {
      const response = await api.delete<DeleteUserResponse>(
        `/user/delete/${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menghapus pengguna"
      );
    }
  }

  /**
   * Restore deleted user
   */
  async restoreUser(userId: string): Promise<RestoreUserResponse> {
    try {
      const response = await api.put<RestoreUserResponse>(
        `/user/restore/${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengembalikan pengguna"
      );
    }
  }

  /**
   * Export users to Excel
   */
  async exportUsers(params?: {
    role?: string | string[];
    search?: string;
    isActive?: boolean;
  }): Promise<void> {
    try {
      const query = new URLSearchParams();

      if (params?.role) {
        if (Array.isArray(params.role)) {
          params.role.forEach((role) => query.append("role", role));
        } else {
          query.append("role", params.role);
        }
      }

      if (params?.search) {
        query.append("search", params.search);
      }

      if (params?.isActive !== undefined) {
        query.append("isActive", String(params.isActive));
      }

      const queryString = query.toString();
      const url = `/user/export/xlsx${queryString ? `?${queryString}` : ""}`;

      await exportService.exportToExcel(url, {}, "data_pengguna.xlsx");
    } catch (error: any) {
      console.error("Gagal export data pengguna:", error);
      throw new Error(
        error?.response?.data?.message || "Gagal mengekspor data pengguna"
      );
    }
  }

  /**
   * Import users from Excel/CSV file
   */
  async importUsers(file: File): Promise<ImportUsersResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<ImportUsersResponse>(
        "/user/import-data",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengimpor data pengguna"
      );
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post<{ avatarUrl: string }>(
        `/user/${userId}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.avatarUrl;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengupload avatar"
      );
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put<{ success: boolean; message: string }>(
        `/user/${userId}/change-password`,
        { currentPassword, newPassword }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengubah password"
      );
    }
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: string | Date): string {
    if (typeof date === "string") {
      // Jika sudah string, pastikan format YYYY-MM-DD
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    }
    // Jika Date object
    return date.toISOString().split("T")[0];
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<{ success: boolean; message: string; data: UserData }> {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: UserData;
      }>(`/user/status/${userId}`, { isActive });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengubah status pengguna"
      );
    }
  }
}

export const userService = new UserService();
