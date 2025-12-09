export interface UserData {
    userId: string;
    namaLengkap: string;
    email: string;
    tanggalLahir: string;
    umur: number;
    nomorTelepon: string;
    role: string; // [driver, penumpang, upt, admin-upt, koperasi]
    alamat: string;
    avatar: string | null;
    isActive: boolean;
    deletedAt: string | null;
    status: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface GetUsersParams {
    role?: string | string[];
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }
  
  export interface GetUsersResponse {
    success: boolean;
    message: string;
    data: UserData[];
    meta: {
      totalPages: number;
      totalData: number;
      totalDataPerPage: number;
      page: number;
      limit: number;
    };
  }
  
  export interface GetUserByIdResponse {
    success: boolean;
    message: string;
    data: UserData;
  }
  
  export interface CreateUserPayload {
    namaLengkap: string;
    email: string;
    tanggalLahir?: string | Date;
    nomorTelepon: string;
    role: string; // [driver, penumpang, upt, admin-upt, koperasi]
    alamat: string;
    avatar?: string | File | null;
    // Note: Tidak ada field password, akan auto-generated "BemoBandung25$"
  }
  
  export interface UpdateUserPayload extends Partial<Omit<CreateUserPayload, 'password'>> {
    isActive?: boolean;
    password?: string; // Opsional hanya jika ingin ganti password melalui /user/:userId
  }
  
  export interface ImportUsersResponse {
    success: boolean;
    message: string;
    data?: {
      imported: number;
      failed: number;
      errors?: Array<{
        row: number;
        error: string;
      }>;
    };
  }
  
  export interface DeleteUserResponse {
    success: boolean;
    message: string;
    data?: {
      userId: string;
      deletedAt: string;
    };
  }
  
  export interface RestoreUserResponse {
    success: boolean;
    message: string;
    data?: {
      userId: string;
      restoredAt: string;
    };
  }