import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import UserManagementPage from "../module/managementUser";
import { useNavigate } from "react-router-dom";

const UserManagementWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      pageTitle="Manajemen Pengguna"
      pageSubtitle="Kelola data pengguna dan hak akses sistem"
      showExport={true}
      showImport={true}
      showAdd={true}
      onExport={() => { }}
      onImport={() => { }}
      onAdd={() => navigate("/dashboard/management-user/tambah")}
    >
      <UserManagementPage />
    </DashboardLayout>
  );
};

export default UserManagementWrapper;