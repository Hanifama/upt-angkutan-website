import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardPage from "../module/dashboard/DashboardPage";
import { useExportToPDF } from "../../hooks/useExportToPDF";

const DashboardWrapper = () => {
  const { contentRef, exportToPDF } = useExportToPDF();

  return (
    <DashboardLayout
      pageTitle="Dashboard Kinerja"
      pageSubtitle="Manajemen Ringkasan Kinerja transportasi umum di Bandung"
      showExport={true}
      onExport={exportToPDF}
    >
      <div ref={contentRef}>
        <DashboardPage />
      </div>
    </DashboardLayout>
  );
};

export default DashboardWrapper;
