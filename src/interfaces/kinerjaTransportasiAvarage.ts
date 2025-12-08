// interfaces/kinerjaTransportasiAverage.ts

export interface StatistikItem {
  key: string;
  label: string;
  value: string;
  standar: string;
}

export interface LoadFactor {
  awal: number;
  akhir: number;
  rataRata: number;
}

export interface Penumpang {
  naik: number;
  turun: number;
  rataRata: number;
}

export interface Rute {
  nama: string;
  headway: number;
  layOverTime: number;
  travelTime: number;
  loadFactor: LoadFactor;
  penumpang: Penumpang;
}

export interface KinerjaTransportasiAverageItem {
  layananId: string;
  namaLayanan: string;
  icon: string;
  color: string;
  statistikStatis: StatistikItem[];
  statistikDinamis: StatistikItem[];
  rute: Rute[];
}

export interface GetKinerjaTransportasiAverageResponse {
  code: number;
  status: boolean;
  message: string;
  data: KinerjaTransportasiAverageItem[];
}
