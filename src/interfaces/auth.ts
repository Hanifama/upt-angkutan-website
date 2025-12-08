// ==================== Base Response ====================
export interface BaseResponse {
  message: string;
  status: boolean;
  code: number;
}

// ==================== Login ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends BaseResponse {
  data: LoginData;
}

// ==================== User Profile ====================
export interface UserProfile {
  userId: string;
  namaLengkap: string;
  email: string;
  avatar: string | null;
  alamat: string;
  nomorTelepon: string;
  tanggalLahir: string;
  umur: number;
  role: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface UpdatePasswordResponse extends BaseResponse {}

export interface ForgotPasswordRequest {
  email: string;
}
export interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}

export interface ProfileResponse extends BaseResponse {
  data: UserProfile;
}
