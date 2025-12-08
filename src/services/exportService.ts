import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../utils/api";

class ExportService {
  async exportToExcel(
    endpoint: string,
    params?: Record<string, any>,
    filename = "data.xlsx"
  ) {
    try {
      const response = await api.get(endpoint, {
        params,
        responseType: "text",
      });

      const csvText = response.data;

      // Convert CSV → workbook
      const workbook = XLSX.read(csvText, { type: "string" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const newBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newBook, worksheet, "Sheet1");

      // Simpan ke file
      const excelBuffer = XLSX.write(newBook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, filename);

      console.log("Export berhasil:", filename);
    } catch (error: any) {
      console.error("Gagal export:", error);
      throw new Error(error?.response?.data?.message || "Gagal export data");
    }
  }
}

export const exportService = new ExportService();
