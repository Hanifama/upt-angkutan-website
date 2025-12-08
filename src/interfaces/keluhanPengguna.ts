export interface KeluhanPengguna {
  id: string;
  namaLengkap: string;
  jenisLayanan: string;
  tanggalKejadian: string;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}

export interface GetKeluhanPenggunaResponse {
  code: number;
  status: boolean;
  message: string;
  data: KeluhanPengguna[];
  meta: Meta;
}

export interface CreateKeluhanPenggunaRequest {
  namaLengkap: string;
  jenisLayanan: string;
  tanggalKejadian: string;
  keterangan: string;
}

export interface CreateKeluhanPenggunaResponse {
  code: number;
  status: boolean;
  message: string;
  data: KeluhanPengguna;
}
