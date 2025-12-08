import { useNavigate } from "react-router-dom";
import { message } from "antd";
import DashboardLayout from "../../layouts/DashboardLayout";
import RoutePage from "../module/rute/RutePage";
import { useRouteStore } from "../../store/useRoutesStore";

const RuteWrapper = () => {
  const navigate = useNavigate();
  const { exportRoutes } = useRouteStore();
  const [messageApi, contextHolder] = message.useMessage();

  const handleExport = async () => {
    try {
      await exportRoutes();
      messageApi.success("Data rute berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data rute");
    }
  };

  return (
    <>
      {contextHolder}
      <DashboardLayout
        pageTitle="Manajemen Data Rute"
        pageSubtitle="Kelola rute transportasi umum di Bandung"
        showExport={true}
        showAdd={true}
        onAdd={() => navigate("/dashboard/rute/tambah")}
        onExport={handleExport}
      >
        <RoutePage />
      </DashboardLayout>
    </>
  );
};

export default RuteWrapper;
