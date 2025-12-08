export interface HalteLocation {
  latitude: number;
  longitude: number;
}

export interface HalteRoute {
  id: string;
  nama: string;
}

export interface HalteLayanan {
  id: string;
  nama: string;
}

export interface Halte {
  id: string;
  nama: string;
  status: boolean;
  gambar: string;
  location: HalteLocation;
  routes: HalteRoute[];
  layanan: HalteLayanan[];
  createdAt: string;
  updatedAt: string;
}

export interface HalteMeta {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}

export interface GetHalteListParams {
  routeId?: string | string[];
  layananId?: string | string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetHalteResponse {
  code: number;
  status: boolean;
  message: string;
  data: Halte[];
  meta: HalteMeta;
}
