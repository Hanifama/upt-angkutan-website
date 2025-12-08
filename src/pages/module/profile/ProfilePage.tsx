import React, { useEffect, type JSX } from "react";
import { Avatar, Card, Spin, Modal, message } from "antd";
import {
  EditOutlined,
  LockOutlined,
  LogoutOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { useUploadStore } from "../../../store/useUploadStore";

const ProfilUser: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { profile, fetchProfile, logoutUser, updateProfile, isLoading } =
    useAuthStore();

  const { uploadFile, resetUpload } = useUploadStore();

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, [fetchProfile]);

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleSelectFile = (file: File) => {
    setSelectedFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
    setIsConfirmOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !profile) return;

    setUploading(true);

    try {
      const uploaded = await uploadFile(selectedFile);

      await updateProfile(profile.userId, {
        avatar: uploaded.withUrl,
      });

      messageApi.success("Foto profil berhasil diperbarui!");
    } catch (err: any) {
      messageApi.error(err.message || "Gagal memperbarui foto");
    } finally {
      setUploading(false);
      setIsConfirmOpen(false);
      setPreviewAvatar(null);
      setSelectedFile(null);
      resetUpload();

      const input = document.getElementById("avatarInput") as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setPreviewAvatar(null);
    setSelectedFile(null);

    const input = document.getElementById("avatarInput") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const handleEditProfile = () => {
    if (profile) navigate(`/dashboard/profile/edit/${profile.userId}`);
  };

  const handleUpdatePassword = () => {
    navigate(`/dashboard/profile/edit-password`);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      {/* File input untuk pilih foto */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="avatarInput"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSelectFile(e.target.files[0]);
          }
        }}
      />

      <div className="bg-white p-4">
        <Card
          title="Foto Profile"
          className="bg-transparent shadow-none border border-gray-200"
        >
          <div className="flex flex-col items-center gap-3">
            <Avatar size={120} src={profile.avatar || undefined}>
              {profile.namaLengkap.charAt(0)}
            </Avatar>

            <p className="font-semibold text-lg">{profile.namaLengkap}</p>

            <button
              className="text-blue-500 flex items-center gap-2 text-sm cursor-pointer"
              onClick={() => document.getElementById("avatarInput")?.click()}
            >
              <PictureOutlined /> Ubah Foto Profil
            </button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card
            title="Informasi Personal"
            className="bg-transparent shadow-none border border-gray-200"
            extra={
              <button
                className="text-blue-500 flex items-center gap-1 text-sm cursor-pointer"
                onClick={handleEditProfile}
              >
                <EditOutlined /> Update Informasi
              </button>
            }
          >
            <div className="divide-y divide-gray-200">
              <div className="py-2">
                <p className="text-sm text-gray-500">Nama Lengkap</p>
                <p className="font-medium">{profile.namaLengkap}</p>
              </div>

              <div className="py-2">
                <p className="text-sm text-gray-500">User Status</p>
                <p className="font-medium">{profile.role}</p>
              </div>

              <div className="py-2">
                <p className="text-sm text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{profile.nomorTelepon}</p>
              </div>

              <div className="py-2">
                <p className="text-sm text-gray-500">Tanggal Lahir</p>
                <p className="font-medium">
                  {new Date(profile.tanggalLahir).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="py-2">
                <p className="text-sm text-gray-500">Alamat</p>
                <p className="font-medium">{profile.alamat}</p>
              </div>
            </div>
          </Card>

          {/* Akun Info */}
          <Card
            title="Informasi Akun"
            className="bg-transparent shadow-none border border-gray-200"
            extra={
              <button
                className="text-blue-500 flex items-center gap-1 text-sm cursor-pointer"
                onClick={handleUpdatePassword}
              >
                <LockOutlined /> Ubah Password
              </button>
            }
          >
            <div className="divide-y divide-gray-200">
              <div className="py-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>

              <div className="py-2">
                <p className="text-sm text-gray-500">Status Akun</p>
                <p className="font-medium text-green-500">
                  {profile.isActive ? "Aktif" : "Belum Aktivasi"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-500 py-2 rounded-3xl hover:bg-red-200 cursor-pointer transition-colors"
                onClick={handleLogout}
              >
                <LogoutOutlined /> Logout
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal konfirmasi */}
      <Modal
        title="Konfirmasi Foto Baru"
        open={isConfirmOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar
            size={150}
            src={previewAvatar || undefined}
            className="border border-gray-300"
          />

          <div className="flex gap-4">
            <button
              onClick={handleConfirmUpload}
              className="bg-[#2E3192] text-white px-4 py-2 rounded-lg cursor-pointer"
              disabled={uploading}
            >
              {uploading ? "Menyimpan..." : "Ya, Ganti"}
            </button>

            <button
              onClick={handleCancel}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
            >
              Tidak
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfilUser;
