export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Layanan {
  id: string;
  nama: string;
}

export interface Route {
  routeId: string;
  routeName: string;
  coordinates: Coordinate[];
  fare: number;
  document: string;
  dokumenPerwal?: string;
  linkGeojson?: string;
  color?: string;
  layanan: Layanan;
  status: string;
  lengthKm: number;
  tanggalPencatatan: string;
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

export interface GetRoutesResponse {
  code: number;
  status: boolean;
  message: string;
  data: Route[];
  meta: Meta;
}

export interface GetRoutesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  layananId?: string;
  routeIds?: string[];
}

export interface UpdateRouteRequest {
  routeName?: string;
  layananId?: string;
  fare?: number;
  lengthKm?: number;
  tanggalPencatatan?: string;
  dokumenPerwal?: string;
  coordinates?: Coordinate[];
  linkGeojson?: string;
  status?: "active" | "inactive" | "maintenance";
}

export interface RouteDetailResponse {
  code: number;
  status: boolean;
  message: string;
  data: Route;
}

export interface CreateRouteRequest {
  routeId?: string; // optional
  routeName: string;
  layananId: string;
  lengthKm: number;
  fare: number;
  tanggalPencatatan: string;
  dokumenPerwal?: string;
  // coordinates: Coordinate[];
}

export interface CreateRouteResponse {
  code: number;
  status: boolean;
  message: string;
  data: Route;
}

export interface RouteDetailPerLayanan {
  layananId: string;
  layananNama: string;
  totalRute: number;
  totalArmada: number;
}

export interface RouteStatisticsSummary {
  totalKeseluruhan: number;
  totalAktif: number;
  totalTidakAktif: number;
  totalKeseluruhanArmada?: number;
  totalAktifArmada?: number;
  totalTidakAktifArmada?: number;
  detailPerLayanan: RouteDetailPerLayanan[];
}

export interface RouteStatisticsResponse {
  code: number;
  status: boolean;
  message: string;
  data: RouteStatisticsSummary;
}
