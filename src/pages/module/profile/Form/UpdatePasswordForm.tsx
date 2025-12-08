import React from "react";
import { Card, Form, Input, Button, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useAuthStore } from "../../../../store/useAuthStore";

const UpdatePasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const { updatePassword, isLoading } = useAuthStore();

  const handleSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      messageApi.error("Konfirmasi password tidak cocok!");
      return;
    }

    try {
      await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      messageApi.success("Password berhasil diperbarui!");
      form.resetFields();

      setTimeout(() => {
        navigate("/dashboard/profile");
      }, 1000);
    } catch (error: any) {
      messageApi.error(error.message || "Gagal memperbarui password");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Ubah Password"
      pageSubtitle="Silakan ganti password akun Anda untuk keamanan."
    >
      {contextHolder}
      <Card
        title="Ganti Password"
        className="shadow-md rounded-2xl p-6 bg-white"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="oldPassword"
            label="Password Lama"
            rules={[{ required: true, message: "Password lama wajib diisi" }]}
          >
            <Input.Password placeholder="Masukkan password lama" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Password Baru"
            rules={[
              { required: true, message: "Password baru wajib diisi" },
              { min: 8, message: "Password minimal 8 karakter" },
            ]}
          >
            <Input.Password placeholder="Masukkan password baru" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Konfirmasi Password Baru"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Konfirmasi password wajib diisi" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Konfirmasi password tidak cocok!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Masukkan ulang password baru" />
          </Form.Item>

          {/* Action Buttons */}
          <Button onClick={() => navigate(-1)}>Kembali</Button>
          <Form.Item className="flex justify-end mt-4 gap-3">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default UpdatePasswordForm;
