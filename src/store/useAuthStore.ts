import { create } from "zustand";
import { authService } from "../services/authService";
import { tokenService } from "../services/tokenService";
import type { LoginData, LoginRequest, UserProfile } from "../interfaces/auth";
import type { UpdatePasswordRequest } from "../interfaces/auth";

interface AuthStoreState {
  user: LoginData | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  forgotPasswordLoading: boolean;
  forgotPasswordError: string | null;
  forgotPasswordSuccess: string | null;

  loginUser: (credentials: LoginRequest) => Promise<void>;
  logoutUser: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (
    userId: string,
    payload: Partial<UserProfile>
  ) => Promise<void>;
  updatePassword: (payload: UpdatePasswordRequest) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: null,

  loginUser: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const userData = await authService.login(credentials);
      set({ user: userData });
      await get().fetchProfile();
    } catch (error: any) {
      set({ error: error.message || "Login failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logoutUser: () => {
    tokenService.clearTokens();
    set({ user: null, profile: null });
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const userProfile = await authService.getProfile();
      set({ profile: userProfile });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch user profile" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (userId: string, payload: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await authService.updateProfile(userId, payload);
      set({ profile: updatedProfile });
    } catch (error: any) {
      set({ error: error.message || "Failed to update profile" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (payload: UpdatePasswordRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updatePassword(payload);
      console.log("Password updated:", response.message);
    } catch (error: any) {
      set({ error: error.message || "Failed to update password" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({
      forgotPasswordLoading: true,
      forgotPasswordError: null,
      forgotPasswordSuccess: null,
    });
    try {
      const response = await authService.forgotPassword({ email });
      set({ forgotPasswordSuccess: response.message });
    } catch (error: any) {
      set({
        forgotPasswordError:
          error.message || "Gagal mengirim email reset password",
      });
      throw error;
    } finally {
      set({ forgotPasswordLoading: false });
    }
  },
}));
