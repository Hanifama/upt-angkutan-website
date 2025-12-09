import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import DashboardLayout from "../../layouts/DashboardLayout";
import UserManagementPage from "../module/managementUser";
import { useUserStore } from "../../store/useUserStore";

const UserManagementWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { exportUsers, importUsers } = useUserStore();

  const [messageApi, contextHolder] = message.useMessage();
  const [openImportModal, setOpenImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadKey, setUploadKey] = useState(Date.now());

  /** EXPORT HANDLER */
  const handleExport = async () => {
    try {
      await exportUsers();
      messageApi.success("Data pengguna berhasil diekspor!");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengekspor data pengguna");
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
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      messageApi.error(`Format file tidak didukung. Gunakan ${allowedExtensions.join(', ')}`);
      return;
    }

    try {
      setIsUploading(true);

      const result = await importUsers(file);

      if (result?.success) {
        messageApi.success(
          result.message || "Import data pengguna berhasil!"
        );

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
        messageApi.error(result?.message || "Gagal mengimpor data pengguna");
      }

      setOpenImportModal(false);
      resetUpload();
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengimpor data pengguna");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <DashboardLayout
        pageTitle="Manajemen Pengguna"
        pageSubtitle="Kelola data pengguna dan hak akses sistem"
        showExport={false}
        showImport={false}
        showAdd={true}
        onExport={handleExport}
        onImport={() => {
          resetUpload();
          setOpenImportModal(true);
        }}
        onAdd={() => navigate("/dashboard/management-user/tambah")}
      >
        <UserManagementPage />
      </DashboardLayout>

      {/* MODAL IMPORT */}
      <Modal
        title="Import Data Pengguna"
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
          <p>Format file yang didukung: .xlsx, .xls, .csv</p>
          <p>Pastikan file memiliki format kolom yang sesuai dengan template.</p>
        </div>

        <Upload
          key={uploadKey}
          beforeUpload={(f) => {
            const allowedExtensions = ['.xlsx', '.xls', '.csv'];
            const fileExtension = f.name.toLowerCase().substring(f.name.lastIndexOf('.'));

            if (!allowedExtensions.includes(fileExtension)) {
              messageApi.error(`Format file tidak didukung. Gunakan ${allowedExtensions.join(', ')}`);
              return Upload.LIST_IGNORE;
            }

            setFile(f);
            return false;
          }}
          maxCount={1}
          accept=".xlsx,.xls,.csv"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Pilih File (.xlsx, .xls, .csv)</Button>
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

export default UserManagementWrapper;