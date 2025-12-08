export interface Driver {
  id: string;
  status: string;
  nomorPegawai: string;
  pendidikanTerakhir: string;
  kepemilikanSuratIjinMengemudi: boolean;
  simData: SimData[] | null;
  nomorSim: string;
  jenisSim: string;
  masaBerlakuSim: string;
  gambarSertifikat: string | null;
  nomorSertifikatPengemudi: string | null;
  sertifikatPengemudiExpiresAt: string | null;
  jadwalKerja: {
    id: string;
    namaJadwal: string;
  } | null;
  armada: any | null;
  userId: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tanggalLahir: string | null;
  tanggalPencatatan: string | null;
  umur: number | null;
  alamat: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SimData {
  jenisSim: string; // "SIM_A", "SIM_B1", dll
  nomorSim: string;
  simExpiresAt: string; // YYYY-MM-DD
}

export interface CreateDriverPayload {
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  password: string;
  nomorPegawai: string;
  alamat?: string;
  pendidikanTerakhir?: string;
  simData?: SimData[];
  nomorSertifikatPengemudi?: string;
  sertifikatPengemudiExpiresAt?: string;
  gambarSertifikat?: string;
  tanggalLahir?: string;
  tanggalPencatatan?: string;
  status?: string;
}

export interface UpdateDriverPayload {
  namaLengkap?: string;
  email?: string;
  nomorTelepon?: string;
  password?: string;
  nomorPegawai?: string;
  alamat?: string;
  pendidikanTerakhir?: string;
  simData?: SimData[];
  nomorSertifikatPengemudi?: string;
  sertifikatPengemudiExpiresAt?: string;
  gambarSertifikat?: string;
  tanggalLahir?: string;
  tanggalPencatatan?: string;
  status?: string;
}

export interface Meta {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}

export interface GetDriverParams {
  page?: number;
  limit?: number;
  layananId?: string;
}

export interface GetDriverResponse {
  code: number;
  status: boolean;
  message: string;
  data: Driver[];
  meta: Meta;
}

export interface DriverDetailResponse {
  code: number;
  status: boolean;
  message: string;
  data: Driver;
}

export interface UpdateDriverResponse {
  status: boolean;
  message: string;
  data: Driver;
}

export interface CreateDriverResponse {
  status: boolean;
  message: string;
  data: Driver;
}

export interface DriverStatisticsUsia {
  rentang_17_30: number;
  rentang_31_40: number;
  lebih_dari_40: number;
  tidak_tercatat: number;
}

export interface DriverStatisticsSim {
  memilikiSim: number;
  tidakMemilikiSim: number;
  simExpired: number;
}

export interface DriverStatisticsSertifikat {
  memilikiSertifikat: number;
  tidakMemilikiSertifikat: number;
  sertifikatExpired: number;
}

export interface DriverStatisticsSummary {
  totalPengemudi: number;
  totalPengemudiAktif: number;
  totalPengemudiTidakAktif: number;
  statistikUsia: DriverStatisticsUsia;
  statistikSim: DriverStatisticsSim;
  statistikSertifikat: DriverStatisticsSertifikat;
}

export interface GetDriverStatisticsSummaryResponse {
  code: number;
  status: boolean;
  message: string;
  data: DriverStatisticsSummary;
}
