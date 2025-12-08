export interface KinerjaTransportasiItem {
  id: string;
  idLayanan: string;
  namaLayanan: string;
  idRute: string;
  namaRute: string;
  jarakRute: number | null;
  ritase: number;
  jumlahPenumpang: number;
  headway: number;
  layOverTime: number;
  kapasitas: number;
  travelTime: number;
  kecepatan: number;
  loadFactor: number;
  penumpangKm: number;
  penumpangNaik: number;
  penumpangTurun: number;
  tahun: number;
  bulan: string;
  createdAt: string;
}

export interface GetKinerjaTransportasiListResponse {
  code: number;
  status: boolean;
  message: string;
  data: KinerjaTransportasiItem[];
}
