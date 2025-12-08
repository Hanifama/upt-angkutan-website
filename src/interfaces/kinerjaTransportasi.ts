export interface BreakdownBulananItem {
  bulan: string; // "01", "02", ..., "12"
  total: number;
}

export interface KinerjaTransportasiPerLayanan {
  layananId: string;
  namaLayanan: string;
  icon: string;
  color: string;
  totalPenumpang: number;
  breakdownBulanan: BreakdownBulananItem[]; // changed from object to array
}

export interface KinerjaTransportasiData {
  tahun: number;
  totalPenumpangHarian: number;
  totalPenumpangBulanan: number;
  totalPenumpangTahunan: number;
  totalRatarataPenumpang: number;
  detailPerLayanan: KinerjaTransportasiPerLayanan[];
}

export interface GetKinerjaTransportasiResponse {
  code: number;
  status: boolean;
  message: string;
  data: KinerjaTransportasiData;
}
