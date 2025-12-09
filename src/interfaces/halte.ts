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

export interface CreateHaltePayload {
  nama: string;
  deskripsi: string;
  latitude: number;
  longitude: number;
  status: boolean;
  gambar?: string;
  layananIds: string[];
}

export interface CreateHalteResponse {
  success: boolean;
  message: string;
  data: Halte;
}

export interface UpdateHalteResponse {
  success: boolean;
  message: string;
  data: Halte;
}

export interface DeleteHalteResponse {
  success: boolean;
  message: string;
}

export interface ToggleStatusResponse {
  success: boolean;
  message: string;
  data: {
    status: boolean;
  };
}

export interface GetHalteByIdResponse {
  success: boolean;
  data: Halte;
}

export interface ImportHalteResponse {
  success: boolean;
  message: string;
  data?: {
    imported: number;
    failed: number;
    details?: Array<{
      row: number;
      nama_halte: string;
      status: string;
      message: string;
    }>;
  };
  errors?: Array<{
    row: number;
    field: string;
    error: string;
  }>;
}