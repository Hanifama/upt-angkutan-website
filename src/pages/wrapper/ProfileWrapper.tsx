import DashboardLayout from "../../layouts/DashboardLayout";
import ProfilUser from "../module/profile/ProfilePage";

const ProfileWrapper = () => {
  return (
    <DashboardLayout
      pageTitle="Profile"
      pageSubtitle="Kelola data Profile pengguna"
    >
      <ProfilUser />
    </DashboardLayout>
  );
};

export default ProfileWrapper;
