import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PengemudiPage from "../module/pengemudi/PengemudiPage";
import { useDriverStore } from "../../store/useDriverStore";
import { message } from "antd";

const PengemudiWrapper = () => {
  const navigate = useNavigate();
  const { exportDriver } = useDriverStore();
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = async () => {
    try {
      await exportDriver();
      messageApi.success("Data pengemudi berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data rute");
    }
  };

  return (
    <DashboardLayout
      pageTitle="Manajemen Pengemudi Terdaftar"
      pageSubtitle="Manajemen Pengemudi transportasi umum di Bandung"
      showExport={true}
      onExport={handleExport}
      showAdd={true}
      onAdd={() => navigate("/dashboard/pengemudi/tambah")}
    >
      {contextHolder}
      <PengemudiPage />
    </DashboardLayout>
  );
};

export default PengemudiWrapper;
