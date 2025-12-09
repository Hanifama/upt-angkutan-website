import { useNavigate } from "react-router-dom";
import { message, Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DashboardLayout from "../../layouts/DashboardLayout";
import HaltePage from "../module/halte/HaltePage";
import { useHalteStore } from "../../store/useHalteStore";
import { useState } from "react";

const HalteWrapper = () => {
  const navigate = useNavigate();
  const { exportHalte, importHalte } = useHalteStore();

  const [messageApi, contextHolder] = message.useMessage();
  const [openImportModal, setOpenImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // key untuk reset Upload
  const [uploadKey, setUploadKey] = useState(Date.now());

  /** EXPORT HANDLER */
  const handleExport = async () => {
    try {
      await exportHalte();
      messageApi.success("Data halte berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data halte");
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

    // Validasi format file
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      messageApi.error(
        `Format file tidak didukung. Gunakan ${allowedExtensions.join(", ")}`
      );
      return;
    }

    try {
      setIsUploading(true);

      const result = await importHalte(file);

      if (result?.status) {
        messageApi.success(result.message || "Import data halte berhasil!");

        // Tampilkan detail jika ada
        if (result.data) {
          const { imported, failed } = result.data;
          if (imported > 0 || failed > 0) {
            messageApi.info(
              `Import selesai: ${imported} data berhasil, ${failed} data gagal`
            );
          }
        }
      } else {
        messageApi.error("Import data halte berhasil!");
      }

      setOpenImportModal(false);
      resetUpload();
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengimpor data halte");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <DashboardLayout
        pageTitle="Manajemen Data Halte"
        pageSubtitle="Kelola data halte dan lokasi pemberhentian"
        showExport={true}
        showImport={true}
        showAdd={true}
        onExport={handleExport}
        onImport={() => {
          resetUpload();
          setOpenImportModal(true);
        }}
        onAdd={() => navigate("/dashboard/halte/tambah")}
      >
        <HaltePage />
      </DashboardLayout>

      {/* MODAL IMPORT */}
      <Modal
        title="Import Data Halte"
        open={openImportModal}
        onCancel={() => {
          setOpenImportModal(false);
          resetUpload();
        }}
        onOk={handleImport}
        confirmLoading={isUploading}
        okText="Import"
        cancelText="Batal"
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            Pastikan file memiliki format kolom yang sesuai dengan template.
          </p>
        </div>

        <Upload
          key={uploadKey}
          beforeUpload={(f) => {
            // Validasi format file sebelum diset
            const allowedExtensions = [".xlsx", ".xls", ".csv"];
            const fileExtension = f.name
              .toLowerCase()
              .substring(f.name.lastIndexOf("."));

            if (!allowedExtensions.includes(fileExtension)) {
              messageApi.error(
                `Format file tidak didukung. Gunakan ${allowedExtensions.join(
                  ", "
                )}`
              );
              return Upload.LIST_IGNORE; // Mengabaikan file yang tidak valid
            }

            setFile(f);
            return false; // Mencegah auto upload
          }}
          maxCount={1}
          accept=".xlsx,.xls,.csv"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>
            Pilih File (.xlsx, .xls, .csv)
          </Button>
        </Upload>

        {file && (
          <div style={{ marginTop: 10 }}>
            <p>File dipilih: {file.name}</p>
            <p>Ukuran: {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default HalteWrapper;
