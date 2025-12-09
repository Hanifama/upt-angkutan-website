export interface User {
    userId: string;
    namaLengkap: string;
    email: string;
    tanggalLahir: string;
    umur: number;
    nomorTelepon: string;
    role: string;
    alamat: string;
    avatar: string | null;
    isActive: boolean;
    deletedAt: string | null;
    status: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface GetUsersResponse {
    code: number;
    status: boolean;
    message: string;
    data: User[];
    meta: {
      totalPages: number;
      totalData: number;
      totalDataPerPage: number;
      page: number;
      limit: number;
    };
  }
  
  export interface CreateUserPayload {
    namaLengkap: string;
    email: string;
    tanggalLahir: string;
    nomorTelepon: string;
    role: string;
    alamat: string;
    password: string;
  }
  
  export interface UpdateUserPayload {
    namaLengkap?: string;
    email?: string;
    tanggalLahir?: string;
    nomorTelepon?: string;
    role?: string;
    alamat?: string;
    isActive?: boolean;
  }
  
  export interface DeleteUserResponse {
    code: number;
    status: boolean;
    message: string;
  }
  
  export interface ToggleStatusResponse {
    code: number;
    status: boolean;
    message: string;
    data: {
      isActive: boolean;
    };
  }