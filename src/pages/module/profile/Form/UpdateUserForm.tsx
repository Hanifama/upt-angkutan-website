import React, { useEffect } from "react";
import { Card, Form, Input, DatePicker, Button, message, Spin } from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../store/useAuthStore";
import DashboardLayout from "../../../../layouts/DashboardLayout";

const UpdateProfileForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  const { profile, fetchProfile, updateProfile, isLoading } = useAuthStore();

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    } else {
      form.setFieldsValue({
        namaLengkap: profile.namaLengkap,
        email: profile.email,
        nomorTelepon: profile.nomorTelepon,
        tanggalLahir: dayjs(profile.tanggalLahir),
        alamat: profile.alamat,
      });
    }
  }, [profile, fetchProfile, form]);

  const handleSubmit = async (values: any) => {
    if (!userId) return;

    try {
      await updateProfile(userId, {
        namaLengkap: values.namaLengkap,
        email: values.email,
        nomorTelepon: values.nomorTelepon,
        tanggalLahir: dayjs(values.tanggalLahir).format("YYYY-MM-DD"),
        alamat: values.alamat,
      });

      messageApi.success("Profile berhasil diperbarui!", 2, () => {
        navigate("/dashboard/profile");
      });
    } catch (error: any) {
      messageApi.error(error.message || "Gagal memperbarui profile", 2);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Update Profile Pengguna"
      pageSubtitle="Silakan isi data profile secara lengkap."
    >
      {contextHolder}
      <Card
        title="Update Profile"
        className="shadow-md rounded-2xl p-6 bg-white"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="namaLengkap"
              label="Nama Lengkap"
              rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
            >
              <Input placeholder="Masukkan nama lengkap" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email wajib diisi" },
                { type: "email", message: "Format email tidak valid" },
              ]}
            >
              <Input placeholder="Masukkan email" />
            </Form.Item>

            <Form.Item
              name="nomorTelepon"
              label="Nomor Telepon"
              rules={[{ required: true, message: "Nomor telepon wajib diisi" }]}
            >
              <Input placeholder="Masukkan nomor telepon" />
            </Form.Item>

            <Form.Item
              name="tanggalLahir"
              label="Tanggal Lahir"
              rules={[{ required: true, message: "Tanggal lahir wajib diisi" }]}
            >
              <DatePicker
                placeholder="Pilih tanggal lahir"
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="alamat"
            label="Alamat"
            rules={[{ required: true, message: "Alamat wajib diisi" }]}
          >
            <Input.TextArea rows={4} placeholder="Masukkan alamat lengkap" />
          </Form.Item>

          {/* Tombol Aksi */}
          <Button onClick={() => navigate(-1)}>Kembali</Button>
          <Form.Item className="flex justify-end mt-4 space-x-3">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
            >
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default UpdateProfileForm;
