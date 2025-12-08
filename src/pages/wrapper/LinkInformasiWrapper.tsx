import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import LinkInformasiPage from "../module/linkInformasi/LinkInformasiPage";

const LinkInformasiWrapper = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      pageTitle="Link Informasi Layanan"
      pageSubtitle="Manajemen Link Informasi terkait layanan pada landing page publik"
      showAdd={true}
      onAdd={() => navigate("/dashboard/link/tambah")}
    >
      <LinkInformasiPage />
    </DashboardLayout>
  );
};

export default LinkInformasiWrapper;
