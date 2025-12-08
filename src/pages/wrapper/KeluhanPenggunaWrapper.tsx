import DashboardLayout from "../../layouts/DashboardLayout";
import KeluhanPenggunaPage from "../module/keluhanPengguna/KeluhanPenggunaPage";
import { useKeluhanPenggunaStore } from "../../store/useKeluhanPenggunaStore";

import { message } from "antd";

const KeluhanPenggunaWrapper = () => {
  const { exportKeluhanPengguna } = useKeluhanPenggunaStore();
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = async () => {
    try {
      await exportKeluhanPengguna();
      messageApi.success("Data keluhan pengguna berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(
        error.message || "Gagal mengekspor data keluhan pengguna"
      );
    }
  };

  return (
    <DashboardLayout
      pageTitle="Keluhan Pengguna (Note belum ada API exportnya)"
      showExport={true}
      onExport={handleExport}
      pageSubtitle="Manajemen keluhan pengguna"
    >
      {contextHolder}
      <KeluhanPenggunaPage />
    </DashboardLayout>
  );
};

export default KeluhanPenggunaWrapper;
