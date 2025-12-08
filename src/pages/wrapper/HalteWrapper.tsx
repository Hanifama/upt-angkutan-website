import DashboardLayout from "../../layouts/DashboardLayout";
import HaltePage from "../module/halte/HaltePage";

const HalteWrapper = () => {
  return (
    <DashboardLayout
      pageTitle="Manajemen Halte"
      pageSubtitle="Manajemen Data Halte"
    >
      <HaltePage />
    </DashboardLayout>
  );
};

export default HalteWrapper;
