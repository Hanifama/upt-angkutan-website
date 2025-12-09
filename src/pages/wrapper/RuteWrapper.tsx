import { useNavigate } from "react-router-dom";
import { message, Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DashboardLayout from "../../layouts/DashboardLayout";
import RoutePage from "../module/rute/RutePage";
import { useRouteStore } from "../../store/useRoutesStore";
import { useState } from "react";

const RuteWrapper = () => {
  const navigate = useNavigate();
  const { exportRoutes, importRoutes } = useRouteStore();

  const [messageApi, contextHolder] = message.useMessage();
  const [openImportModal, setOpenImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // key untuk reset Upload
  const [uploadKey, setUploadKey] = useState(Date.now());

  /** EXPORT HANDLER */
  const handleExport = async () => {
    try {
      await exportRoutes();
      messageApi.success("Data rute berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data rute");
    }
  };

  /** RESET INPUT FILE */
  const resetUpload = () => {
    setFile(null);
    setUploadKey(Date.now());
  };

  /** IMPORT HANDLER */
  const handleImport = async () => {
    if (!file) {
      messageApi.warning("Silakan pilih file terlebih dahulu.");
      return;
    }

    try {
      setIsUploading(true);
      await importRoutes(file);
      messageApi.success("Import data rute berhasil!");
      setOpenImportModal(false);
      resetUpload();
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengimpor data rute");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <DashboardLayout
        pageTitle="Manajemen Data Rute"
        pageSubtitle="Kelola rute transportasi umum di Bandung"
        showExport={true}
        showImport={true}
        showAdd={true}
        onExport={handleExport}
        onImport={() => {
          resetUpload();
          setOpenImportModal(true);
        }}
        onAdd={() => navigate("/dashboard/rute/tambah")}
      >
        <RoutePage />
      </DashboardLayout>

      {/* MODAL IMPORT */}
      <Modal
        title="Import Data Rute"
        open={openImportModal}
        onCancel={() => {
          setOpenImportModal(false);
          resetUpload();
        }}
        onOk={handleImport}
        confirmLoading={isUploading}
        okText="Import"
        cancelText="Batal"
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            Pastikan file memiliki format kolom yang sesuai dengan template.
          </p>
        </div>
        <Upload
          key={uploadKey}
          beforeUpload={(f) => {
            setFile(f);
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Pilih File (.xlsx)</Button>
        </Upload>

        {file && (
          <p style={{ marginTop: 10 }}>
            File dipilih: <b>{file.name}</b>
          </p>
        )}
      </Modal>
    </>
  );
};

export default RuteWrapper;
