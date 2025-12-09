import { create } from "zustand";
import type {
  UserData,
  GetUsersResponse,
  GetUsersParams,
  CreateUserPayload,
  UpdateUserPayload,
  ImportUsersResponse,
} from "../interfaces/user";
import { userService } from "../services/userService";

interface UserStoreState {
  users: UserData[];
  selectedUser: UserData | null;
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;

  // Filter states
  filterRole: string;
  filterStatus: string;
  searchText: string;

  // Methods
  fetchUsers: (params?: GetUsersParams) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  createUser: (payload: CreateUserPayload) => Promise<UserData | undefined>;
  updateUser: (
    userId: string,
    payload: UpdateUserPayload
  ) => Promise<UserData | undefined>;
  deleteUser: (
    userId: string
  ) => Promise<{ success: boolean; message: string }>;
  restoreUser: (
    userId: string
  ) => Promise<{ success: boolean; message: string }>;
  uploadAvatar: (userId: string, file: File) => Promise<string>;
  changePassword: (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  setSelectedUser: (user: UserData | null) => void;
  updateUserStatus: (
    userId: string,
    isActive: boolean
  ) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;

  // Filter Methods
  setFilterRole: (role: string) => void;
  setFilterStatus: (status: string) => void;
  setSearchText: (text: string) => void;

  // Export/Import Methods
  exportUsers: (params?: {
    role?: string | string[];
    search?: string;
    isActive?: boolean;
  }) => Promise<void>;
  importUsers: (file: File) => Promise<ImportUsersResponse>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  selectedUser: null,
  meta: {
    totalPages: 0,
    totalData: 0,
    totalDataPerPage: 0,
    page: 1,
    limit: 10,
  },
  isLoading: false,
  error: null,

  // Filter states
  filterRole: "Semua Role",
  filterStatus: "Semua Status",
  searchText: "",

  /**
   * Fetch users with pagination and filters
   */
  fetchUsers: async (params?: GetUsersParams) => {
    set({ isLoading: true, error: null });

    try {
      const response: GetUsersResponse = await userService.getUsers(params);

      set({
        users: response.data,
        meta: response.meta,
      });
    } catch (error: any) {
      set({
        error: error.message || "Gagal mengambil data pengguna!",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Fetch single user by ID
   */
  fetchUserById: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUserById(userId);
      set({ selectedUser: response.data });
    } catch (error: any) {
      set({ error: error.message || "Gagal mengambil detail pengguna" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Create new user
   */
  createUser: async (payload: CreateUserPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.createUser(payload);
      set((state) => ({
        users: [response, ...state.users],
        meta: {
          ...state.meta,
          totalData: state.meta.totalData + 1,
        },
      }));
      return response;
    } catch (error: any) {
      set({ error: error.message || "Gagal membuat pengguna" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Update user dengan payload partial
   */
  updateUser: async (userId: string, payload: UpdateUserPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateUser(userId, payload);

      set((state) => ({
        users: state.users.map((user) =>
          user.userId === userId ? { ...user, ...response } : user
        ),
        selectedUser:
          state.selectedUser?.userId === userId
            ? { ...state.selectedUser, ...response }
            : state.selectedUser,
      }));

      return response;
    } catch (error: any) {
      set({ error: error.message || "Gagal memperbarui pengguna" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.deleteUser(userId);

      // Update local state
      set((state) => ({
        users: state.users.filter((user) => user.userId !== userId),
        meta: {
          ...state.meta,
          totalData: state.meta.totalData - 1,
        },
        selectedUser:
          state.selectedUser?.userId === userId ? null : state.selectedUser,
      }));

      return {
        success: true,
        message: response.message || "Pengguna berhasil dihapus",
      };
    } catch (error: any) {
      const errorMessage = error.message || "Gagal menghapus pengguna";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Restore deleted user
   */
  restoreUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.restoreUser(userId);

      // Refresh data setelah restore
      await get().fetchUsers();

      return {
        success: true,
        message: response.message || "Pengguna berhasil dikembalikan",
      };
    } catch (error: any) {
      const errorMessage = error.message || "Gagal mengembalikan pengguna";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (userId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const avatarUrl = await userService.uploadAvatar(userId, file);

      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user.userId === userId ? { ...user, avatar: avatarUrl } : user
        ),
        selectedUser:
          state.selectedUser?.userId === userId
            ? { ...state.selectedUser, avatar: avatarUrl }
            : state.selectedUser,
      }));

      return avatarUrl;
    } catch (error: any) {
      set({ error: error.message || "Gagal mengupload avatar" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Change password
   */
  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      return result;
    } catch (error: any) {
      set({ error: error.message || "Gagal mengubah password" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Export users data
   */
  exportUsers: async (params?: {
    role?: string | string[];
    search?: string;
    isActive?: boolean;
  }) => {
    const { filterRole, filterStatus, searchText } = get();

    // Build params based on filters
    const exportParams: any = {};

    if (filterRole !== "Semua Role") {
      exportParams.role = filterRole;
    }

    if (filterStatus !== "Semua Status") {
      exportParams.isActive = filterStatus === "Aktif";
    }

    if (searchText) {
      exportParams.search = searchText;
    }

    // Merge with additional params if provided
    const finalParams = { ...exportParams, ...params };

    await userService.exportUsers(finalParams);
  },

  /**
   * Import users data from Excel/CSV file
   */
  importUsers: async (file: File): Promise<ImportUsersResponse> => {
    set({ isLoading: true, error: null });

    try {
      const response = await userService.importUsers(file);

      // Refresh data setelah import berhasil
      if (response.success) {
        await get().fetchUsers();
      }

      return response;
    } catch (error: any) {
      set({
        error: error.message || "Gagal mengimpor data pengguna",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Set filter role
   */
  setFilterRole: (role: string) => set({ filterRole: role }),

  /**
   * Set filter status
   */
  setFilterStatus: (status: string) => set({ filterStatus: status }),

  /**
   * Set search text
   */
  setSearchText: (text: string) => set({ searchText: text }),

  /**
   * Set selected user for editing/viewing
   */
  setSelectedUser: (user: UserData | null) => {
    set({ selectedUser: user });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateUserStatus(userId, isActive);

      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user.userId === userId ? { ...user, isActive } : user
        ),
        selectedUser:
          state.selectedUser?.userId === userId
            ? { ...state.selectedUser, isActive }
            : state.selectedUser,
      }));

      return {
        success: true,
        message: response.message || "Status berhasil diperbarui",
      };
    } catch (error: any) {
      const errorMessage = error.message || "Gagal mengubah status pengguna";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));
