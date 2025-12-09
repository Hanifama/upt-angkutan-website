import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import PengemudiPage from "../module/pengemudi/PengemudiPage";
import { useDriverStore } from "../../store/useDriverStore";
import { message, Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const PengemudiWrapper = () => {
  const navigate = useNavigate();
  const { exportDriver, importDriver } = useDriverStore();
  const [messageApi, contextHolder] = message.useMessage();

  const [openImportModal, setOpenImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // tambahkan state untuk reset Upload
  const [uploadKey, setUploadKey] = useState(Date.now());

  /** EXPORT HANDLER */
  const handleExport = async () => {
    try {
      await exportDriver();
      messageApi.success("Data pengemudi berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data pengemudi");
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
      await importDriver(file);
      messageApi.success("Data pengemudi berhasil diimpor!");

      setOpenImportModal(false);
      resetUpload();
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengimpor data.");
    }
  };

  return (
    <>
      {contextHolder}

      <DashboardLayout
        pageTitle="Manajemen Pengemudi Terdaftar (Note Belum bisa dilepas mandatory nomor pegawai)"
        pageSubtitle="Manajemen Pengemudi transportasi umum di Bandung"
        showExport={true}
        onExport={handleExport}
        showImport={true}
        onImport={() => {
          resetUpload();
          setOpenImportModal(true);
        }}
        showAdd={true}
        onAdd={() => navigate("/dashboard/pengemudi/tambah")}
      >
        <PengemudiPage />
      </DashboardLayout>

      <Modal
        title="Import Data Pengemudi"
        open={openImportModal}
        onCancel={() => {
          setOpenImportModal(false);
          resetUpload();
        }}
        onOk={handleImport}
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
          beforeUpload={(file) => {
            setFile(file);
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Pilih File Excel</Button>
        </Upload>

        {file && (
          <p className="mt-3 text-gray-600">
            File dipilih: <b>{file.name}</b>
          </p>
        )}
      </Modal>
    </>
  );
};

export default PengemudiWrapper;
