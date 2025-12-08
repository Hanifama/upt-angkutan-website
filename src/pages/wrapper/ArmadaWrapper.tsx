import { useNavigate } from "react-router-dom";
import { message, Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DashboardLayout from "../../layouts/DashboardLayout";
import ArmadaPage from "../module/armada/ArmadaPage";
import { useArmadaStore } from "../../store/useArmadaStore";
import { useState } from "react";

const ArmadaWrapper = () => {
  const navigate = useNavigate();
  const { exportArmada, importArmada } = useArmadaStore();

  const [messageApi, contextHolder] = message.useMessage();
  const [openImportModal, setOpenImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // key untuk reset Upload
  const [uploadKey, setUploadKey] = useState(Date.now());

  /** EXPORT HANDLER */
  const handleExport = async () => {
    try {
      await exportArmada();
      messageApi.success("Data armada berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data armada");
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
      messageApi.warning("Silakan pilih file terlebih dahulu!");
      return;
    }

    try {
      setIsUploading(true);
      await importArmada(file);
      messageApi.success("Import data armada berhasil!");
      setOpenImportModal(false);
      resetUpload();
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengimpor data armada");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <DashboardLayout
        pageTitle="Manajemen Data Armada"
        pageSubtitle="Manajemen status armada dan jadwal inspeksi"
        showExport={true}
        showImport={true}
        showAdd={true}
        onExport={handleExport}
        onImport={() => {
          resetUpload();
          setOpenImportModal(true);
        }}
        onAdd={() => navigate("/dashboard/armada/tambah")}
      >
        <ArmadaPage />
      </DashboardLayout>

      {/* MODAL IMPORT */}
      <Modal
        title="Import Data Armada"
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

        {file && <p style={{ marginTop: 10 }}>File dipilih: {file.name}</p>}
      </Modal>
    </>
  );
};

export default ArmadaWrapper;
