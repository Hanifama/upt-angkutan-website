import DashboardLayout from "../../layouts/DashboardLayout";
import KeluhanPenggunaPage from "../module/keluhanPengguna/KeluhanPenggunaPage";

const KeluhanPenggunaWrapper = () => {
  return (
    <DashboardLayout
      pageTitle="Keluhan Pengguna"
      pageSubtitle="Manajemen keluhan pengguna"
    >
      <KeluhanPenggunaPage />
    </DashboardLayout>
  );
};

export default KeluhanPenggunaWrapper;
