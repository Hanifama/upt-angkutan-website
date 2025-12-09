import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Switch,
  message,
  Upload,
  DatePicker,
  Space,
  Avatar,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { RcFile } from "antd/es/upload/interface";
import DashboardLayout from "../../../../layouts/DashboardLayout";

const { Option } = Select;
const { TextArea } = Input;

// Role cuma admin-upt & koperasi
const roleOptions = [
  { value: "admin-upt", label: "Admin UPT", color: "blue" },
  { value: "koperasi", label: "Koperasi", color: "green" },
];

const CreateUserForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userData = {
        ...values,
        tanggalLahir: values.tanggalLahir
          ? values.tanggalLahir.toISOString()
          : null,
        avatar: avatarUrl,
        umur: values.tanggalLahir
          ? new Date().getFullYear() - values.tanggalLahir.year()
          : null,
      };

      console.log("User data to create:", userData);

      messageApi.success("Pengguna berhasil ditambahkan!");

      setTimeout(() => {
        navigate("/dashboard/users");
      }, 1500);
    } catch (error) {
      messageApi.error("Gagal menambahkan pengguna!");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <DashboardLayout
      pageTitle="Tambah Pengguna Baru"
      pageSubtitle="Silakan isi data pengguna secara lengkap"
    >
      {contextHolder}

      <Card
        title={
          <div className="flex items-center gap-2">
            <span>Form Tambah Pengguna</span>
          </div>
        }
        className="shadow-md rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ isActive: true }}
        >
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <Avatar
              size={100}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              style={{ backgroundColor: "#1890ff", marginBottom: 16 }}
            />
            <Form.Item
              name="avatar"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                beforeUpload={(file: RcFile) => {
                  handleAvatarUpload(file);
                  return false;
                }}
                showUploadList={false}
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Foto Profil</Button>
              </Upload>
            </Form.Item>
          </div>

          {/* Nama & Email */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nama Lengkap"
                name="namaLengkap"
                rules={[
                  { required: true, message: "Nama lengkap wajib diisi" },
                  { min: 3, message: "Nama minimal 3 karakter" },
                ]}
              >
                <Input placeholder="Masukkan nama lengkap" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email wajib diisi" },
                  { type: "email", message: "Format email tidak valid" },
                ]}
              >
                <Input placeholder="user@example.com" size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* Telepon & Tanggal Lahir */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nomor Telepon"
                name="nomorTelepon"
                rules={[
                  { required: true, message: "Nomor telepon wajib diisi" },
                  {
                    pattern: /^\+?[1-9]\d{1,14}$/,
                    message: "Format nomor telepon tidak valid",
                  },
                ]}
              >
                <Input placeholder="+628123456789" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tanggal Lahir" name="tanggalLahir">
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Pilih tanggal lahir"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Role & Status */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: "Role wajib dipilih" }]}
              >
                <Select placeholder="Pilih role" size="large">
                  {roleOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <span style={{ color: option.color, fontWeight: 500 }}>
                        {option.label}
                      </span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" name="isActive" valuePropName="checked">
                <Switch
                  checkedChildren="Aktif"
                  unCheckedChildren="Nonaktif"
                  defaultChecked
                  size="default"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Alamat */}
          <Form.Item
            label="Alamat"
            name="alamat"
            rules={[
              { required: true, message: "Alamat wajib diisi" },
              { min: 10, message: "Alamat minimal 10 karakter" },
            ]}
          >
            <TextArea rows={4} placeholder="Masukkan alamat lengkap" />
          </Form.Item>

          {/* Password Section */}
          <h3
            style={{ fontWeight: 600, fontSize: "16px", margin: "24px 0 16px" }}
          >
            Informasi Akun
          </h3>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password wajib diisi" },
                  { min: 6, message: "Password minimal 6 karakter" },
                ]}
              >
                <Input.Password placeholder="Masukkan password" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Konfirmasi Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Konfirmasi password wajib diisi",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Password tidak sesuai!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Konfirmasi password"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Form.Item style={{ marginTop: 32 }}>
            <Space
              size="large"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Button
                size="large"
                onClick={() => navigate("/dashboard/management-user")}
                style={{ minWidth: 120 }}
              >
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  backgroundColor: "#2E3192",
                  borderColor: "#2E3192",
                  minWidth: 120,
                }}
              >
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default CreateUserForm;
