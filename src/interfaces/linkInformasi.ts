export interface LinkInformasi {
  id: string;
  labelInformasi: string;
  embedLink: string;
  thumbnail: string;
  type: string;
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

export interface GetLinkInformasiParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetLinkInformasiResponse {
  code: number;
  status: boolean;
  message: string;
  data: LinkInformasi[];
  meta: Meta;
}

export interface CreateLinkInformasiRequest {
  labelInformasi: string;
  embedLink: string;
  thumbnail: string;
  type?: string;
}

export interface CreateLinkInformasiResponse {
  code: number;
  status: boolean;
  message: string;
  data: LinkInformasi;
}
