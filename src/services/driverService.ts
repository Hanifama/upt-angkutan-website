import type {
  CreateDriverPayload,
  CreateDriverResponse,
  GetDriverResponse,
  UpdateDriverPayload,
  UpdateDriverResponse,
  DriverDetailResponse,
  GetDriverStatisticsSummaryResponse,
} from "../interfaces/driver";
import api from "../utils/api";
import { exportService } from "./exportService";

class DriverService {
  // Get list driver
  async getDrivers(
    page = 1,
    limit = 10,
    params?: {
      status?: string;
      search?: string;
    }
  ): Promise<GetDriverResponse> {
    try {
      const queryParams = {
        page,
        limit,
        ...params,
      };

      const response = await api.get<GetDriverResponse>("/driver", {
        params: queryParams,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil data driver"
      );
    }
  }

  // Get driver by ID
  async getDriverById(driverId: string): Promise<DriverDetailResponse> {
    try {
      const response = await api.get<DriverDetailResponse>(
        `/driver/${driverId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil detail driver"
      );
    }
  }

  async getDriverStatisticsSummary(): Promise<GetDriverStatisticsSummaryResponse> {
    try {
      const response = await api.get<GetDriverStatisticsSummaryResponse>(
        "/driver/statistics/summary"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal mengambil statistik pengemudi"
      );
    }
  }

  // Create driver
  async createDriver(
    payload: CreateDriverPayload
  ): Promise<CreateDriverResponse> {
    try {
      const response = await api.post<CreateDriverResponse>("/driver", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menambahkan driver"
      );
    }
  }

  // Update driver
  async updateDriver(
    driverId: string,
    payload: UpdateDriverPayload
  ): Promise<UpdateDriverResponse> {
    try {
      const response = await api.put<UpdateDriverResponse>(
        `/driver/${driverId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal memperbarui driver"
      );
    }
  }

  // Delete driver
  async deleteDriver(driverId: string): Promise<void> {
    try {
      await api.delete(`/driver/${driverId}`);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Gagal menghapus driver"
      );
    }
  }

  // Export Driver
  async exportDriver(params?: { layananId?: string }) {
    try {
      await exportService.exportToExcel(
        "/driver/export/raw",
        params,
        "data_driver.xlsx"
      );
    } catch (error) {
      console.error("Gagal export data rute:", error);
      throw error;
    }
  }
}

export const driverService = new DriverService();
