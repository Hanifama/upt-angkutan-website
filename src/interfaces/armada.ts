import type { Layanan } from "./route";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface SimpleRoute {
  id: string;
  nama: string;
}

export interface Armada {
  id: string;
  licensePlate: string;
  kapasitas: number;
  tersedia: boolean;
  status: boolean;
  stnkExpiresAt: string;
  kirExpiresAt: string;
  sipaExpiresAt: string;
  tanggalPencatatan: string;
  potoArmada: string;
  tahunKendaraan: number;
  sipaNumber: string;
  kirNumber: string;
  layanan: Layanan;
  rute: SimpleRoute | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LayananDetail {
  id: string;
  nama: string;
}

export interface RuteDetail {
  id: string;
  nama: string;
}

export interface ArmadaDetail {
  id: string;
  licensePlate: string;
  kapasitas: number;
  tersedia: boolean;
  status: boolean;
  stnkExpiresAt: string | null;
  kirExpiresAt: string | null;
  tanggalPencatatan: string | null;
  potoArmada: string | null;
  tahunKendaraan: number | null;
  sipaExpiresAt: string | null;
  sipaNumber: string | null;
  kirNumber: string | null;
  layanan: LayananDetail | null;
  rute: RuteDetail | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Meta {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}

export interface GetArmadaResponse {
  code: number;
  status: boolean;
  message: string;
  data: Armada[];
  meta: Meta;
}

export interface GetArmadaParams {
  page?: number;
  limit?: number;
  search?: string;
  layananId?: string;
  routeId?: string;
  tersedia?: boolean;
}

export interface CreateArmadaPayload {
  licensePlate: string;
  layananId: string;
  routeId: string;
  kapasitas: number;
  stnkExpiresAt: string; // yyyy-mm-dd
  tanggalPencatatan: string; // yyyy-mm-dd
  potoArmada?: string;
  tahunKendaraan?: number;
  sipaNumber?: string;
  kirNumber?: string;
  sipaExpiresAt?: string; // yyyy-mm-dd
  kirExpiresAt?: string; // yyyy-mm-dd
  latitude: number;
  longitude: number;
  tersedia?: boolean; // default true
}

export interface CreateArmadaResponse {
  code: number;
  status: boolean;
  message: string;
  data: Armada;
}

export interface ArmadaSummaryPerLayanan {
  layananId: string | null;
  layananNama: string;
  icon?: string | null;
  color?: string | null;
  totalAktif: number;
  totalTidakAktif: number;
  totalDenganLicensePlate: number;
  totalDenganKirNumber: number;
  totalDenganSipaNumber: number;
}

export interface ArmadaSummary {
  totalKeseluruhan: number;
  totalAktif: number;
  totalTidakAktif: number;
  totalStnkSegeraHabis: number;
  totalKirSegeraHabis: number;
  totalSipaSegeraHabis: number;
  detailPerLayanan: ArmadaSummaryPerLayanan[];
}

export interface GetArmadaSummaryResponse {
  code: number;
  status: boolean;
  message: string;
  data: ArmadaSummary;
}
