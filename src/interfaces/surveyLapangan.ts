export interface TitikLokasi {
  latitude: number;
  longitude: number;
}

export interface Layanan {
  id: string;
  nama: string;
}

export interface Rute {
  id: string;
  nama: string;
}

export interface GetSurveyParams {
  page?: number;
  limit?: number;
  jenisSurvey?: string;
  idLayanan?: string;
}

/** Payload untuk Survey Lapangan Statis */
export interface CreateSurveyLapanganStatisPayload {
  jenisSurvey: "STATIS";
  tanggalSurvey: string; // yyyy-mm-dd
  namaPenanggungJawab: string;
  waktuSurvey: string; // HH:mm
  idLayanan: string;
  idRute: string;
  noPlat: string;
  namaTitikLokasi?: string;
  waktuKedatangan?: string; // HH:mm - DITAMBAHKAN
  waktuKeberangkatan?: string; // HH:mm - DITAMBAHKAN
  titikLokasi?: TitikLokasi; // opsional (statis - hanya satu lokasi)
  jumlahPenumpang?: number; // opsional (statis - jumlah penumpang total)
}

/** Payload untuk Survey Lapangan Dinamis */
export interface CreateSurveyLapanganDinamisPayload {
  jenisSurvey: "DINAMIS";
  tanggalSurvey: string; // yyyy-mm-dd
  namaPenanggungJawab: string;
  waktuSurvey: string; // HH:mm
  idLayanan: string;
  idRute: string;
  noPlat: string;
  waktuKedatangan?: string; // HH:mm
  waktuKeberangkatan?: string; // HH:mm
  namaTitikLokasi?: string;
  lokasiKedatangan?: TitikLokasi; // opsional (dinamis)
  lokasiKeberangkatan?: TitikLokasi; // opsional (dinamis)
  jumlahPenumpangNaik?: number; // opsional (dinamis)
  jumlahPenumpangTurun?: number; // opsional (dinamis)
}

/** Struktur data hasil create survey lapangan statis */
export interface SurveyLapanganStatis {
  id: string;
  jenisSurvey: "STATIS";
  tanggalSurvey: string;
  namaPenanggungJawab: string;
  waktuSurvey: string;
  layanan?: Layanan;
  rute?: Rute;
  noPlat: string;
  namaTitikLokasi?: string;
  waktuKedatangan?: string; // DITAMBAHKAN
  waktuKeberangkatan?: string; // DITAMBAHKAN
  titikLokasi?: TitikLokasi | null;
  jumlahPenumpang?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Struktur data hasil create survey lapangan dinamis */
export interface SurveyLapanganDinamis {
  id: string;
  jenisSurvey: "DINAMIS";
  tanggalSurvey: string;
  namaPenanggungJawab: string;
  waktuSurvey: string;
  noPlat: string;
  layanan?: Layanan;
  rute?: Rute;
  waktuKedatangan?: string;
  waktuKeberangkatan?: string;
  namaTitikLokasi?: string;
  lokasiKedatangan?: TitikLokasi | null;
  lokasiKeberangkatan?: TitikLokasi | null;
  jumlahPenumpangNaik?: number | null;
  jumlahPenumpangTurun?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Response API create survey lapangan statis */
export interface CreateSurveyLapanganStatisResponse {
  code: number;
  status: boolean;
  message: string;
  data: SurveyLapanganStatis;
}

/** Response API create survey lapangan dinamis */
export interface CreateSurveyLapanganDinamisResponse {
  code: number;
  status: boolean;
  message: string;
  data: SurveyLapanganDinamis;
}

/** Struktur response GET list (dengan pagination) */
export interface GetSurveyLapanganResponse<T> {
  code: number;
  status: boolean;
  message: string;
  data: T[];
  meta: {
    totalPages: number;
    totalData: number;
    totalDataPerPage: number;
    page: number;
    limit: number;
  };
}
