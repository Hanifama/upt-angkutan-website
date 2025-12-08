import type {
  LoginData,
  LoginRequest,
  LoginResponse,
  UserProfile,
  ProfileResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "../interfaces/auth";
import api from "../utils/api";
import { tokenService } from "./tokenService";

class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<LoginData> {
    try {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      const { accessToken, refreshToken } = response.data.data;

      if (accessToken) {
        tokenService.setToken(accessToken);
        tokenService.setRefreshToken(refreshToken);
        const decoded = tokenService.decodeToken(accessToken);
        if (decoded?.role) {
          localStorage.setItem("userRole", decoded.role);
        }

        return response.data.data;
      }

      throw new Error(response.data.message || "Login gagal");
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Login gagal");
    }
  }

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<ProfileResponse>("/user/profile");
    return response.data.data;
  }

  // Update user profile
  async updateProfile(
    userId: string,
    payload: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const response = await api.put<ProfileResponse>(
        `/user/${userId}`,
        payload
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui profil"
      );
    }
  }

  async updatePassword(
    payload: UpdatePasswordRequest
  ): Promise<UpdatePasswordResponse> {
    try {
      const response = await api.put<UpdatePasswordResponse>(
        "/user/update/password",
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui password"
      );
    }
  }

  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    try {
      const response = await api.put<ForgotPasswordResponse>(
        "/user/forgot/password",
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Gagal mengirim permintaan reset password"
      );
    }
  }
}

export const authService = new AuthService();
