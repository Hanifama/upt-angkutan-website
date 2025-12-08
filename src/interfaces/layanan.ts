export interface Layanan {
  id: string;
  nama: string;
  icon?: string | null;
  color?: string;
  status: boolean;
  deskripsi?: string | null;
  jamOperasionalMulai?: string | null;
  jamOperasionalSelesai?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Meta {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}

export interface GetLayananResponse {
  code: number;
  status: boolean;
  message: string;
  data: Layanan[];
  meta: Meta;
}

export interface GetLayananParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
}
