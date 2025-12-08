import { useNavigate } from "react-router-dom";

import DashboardCenteredLayout from "../../layouts/DashboardPublicLayout";
import DashboardPublicPage from "../module/dashboard/DashboardPublicPage";

const DashboardPublicWrapper = () => {
  const navigate = useNavigate();

  return (
    <DashboardCenteredLayout
      pageTitle="Dashboard UPT Manajemen Angkutan"
      pageSubtitle="Manajemen Ringkasan Kinerja trasportasi umum di Bandung"
      showLogin={true}
      onLogin={() => navigate("/login")}
    >
      <DashboardPublicPage />
    </DashboardCenteredLayout>
  );
};

export default DashboardPublicWrapper;
