import { useNavigate } from "react-router-dom";
import { message } from "antd";
import DashboardLayout from "../../layouts/DashboardLayout";
import ArmadaPage from "../module/armada/ArmadaPage";
import { useArmadaStore } from "../../store/useArmadaStore";

const ArmadaWrapper = () => {
  const navigate = useNavigate();
  const { exportArmada } = useArmadaStore();
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = async () => {
    try {
      await exportArmada();
      messageApi.success("Data armada berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data rute");
    }
  };

  return (
    <DashboardLayout
      pageTitle="Manajemen Data Armada"
      pageSubtitle="Manajemen status armada dan jadwal inspeksi"
      showExport={true}
      showAdd={true}
      onExport={handleExport}
      onAdd={() => navigate("/dashboard/armada/tambah")}
    >
      {contextHolder}
      <ArmadaPage />
    </DashboardLayout>
  );
};

export default ArmadaWrapper;
