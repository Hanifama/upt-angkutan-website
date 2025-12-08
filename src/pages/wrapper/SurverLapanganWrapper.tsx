import { message } from "antd";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useSurveyLapanganStore } from "../../store/useSurveyLapangan";
import { useKinerjaTransportasiStore } from "../../store/useKinerjaTransportasi";
import SurveyLapanganPage from "../module/surrveyLapangan/SurveyLapanganPage";
import { useState } from "react";

const SurveyLapanganWrapper = () => {
  const { exportSurvey } = useSurveyLapanganStore();
  const { exportKinerja } = useKinerjaTransportasiStore();
  const [messageApi, contextHolder] = message.useMessage();

  // track tab aktif
  const [activeTab, setActiveTab] = useState<"analisis" | "dinamis" | "statis">(
    "analisis"
  );

  const handleExport = async () => {
    try {
      if (activeTab === "analisis") {
        await exportKinerja();
      } else if (activeTab === "dinamis") {
        await exportSurvey();
      } else if (activeTab === "statis") {
        await exportSurvey();
      }

      messageApi.success("Data berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data!");
    }
  };

  return (
    <DashboardLayout
      pageTitle="Manajemen Data Survey Lapangan"
      pageSubtitle="Kelola data survey lapangan transportasi umum di Bandung"
      showExport={true}
      onExport={handleExport}
    >
      {contextHolder}
      <SurveyLapanganPage
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />
    </DashboardLayout>
  );
};

export default SurveyLapanganWrapper;
