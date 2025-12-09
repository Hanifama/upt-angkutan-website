import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  message,
  DatePicker,
  Typography,
  Alert,
  Tag,
  Divider,
  Badge,
  Spin,
} from "antd";
import {
  UserOutlined,
  InfoCircleOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useUploadStore } from "../../../../store/useUploadStore";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useUserStore } from "../../../../store/useUserStore";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

// Role options sesuai API [driver, penumpang, upt, admin-upt, koperasi]
const roleOptions = [
  { value: "admin-upt", label: "Admin UPT", color: "blue" },
  { value: "koperasi", label: "Operator Transportasi", color: "green" },
];

const UserForm: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // State management
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // Stores
  const {
    selectedUser,
    isLoading: isUserStoreLoading,
    createUser,
    updateUser,
    fetchUserById,
  } = useUserStore();

  const {
    isLoading: isUploading,
    resetUpload
  } = useUploadStore();

  const isLoading = isUserStoreLoading || isUploading || loading;

  // Load user data jika edit mode
  useEffect(() => {
    if (userId) {
      setIsEditMode(true);
      loadUserData();
    }

    return () => {
      resetUpload();
    };
  }, [userId]);

  const loadUserData = async () => {
    try {
      await fetchUserById(userId!);
    } catch (error) {
      messageApi.error("Gagal memuat data pengguna");
      navigate("/dashboard/management-user");
    }
  };

  // Set form values ketika selectedUser berubah
  useEffect(() => {
    if (isEditMode && selectedUser) {
      form.setFieldsValue({
        namaLengkap: selectedUser.namaLengkap,
        email: selectedUser.email,
        nomorTelepon: selectedUser.nomorTelepon,
        tanggalLahir: selectedUser.tanggalLahir ? dayjs(selectedUser.tanggalLahir) : null,
        role: selectedUser.role,
        alamat: selectedUser.alamat,
      });

    }
  }, [selectedUser, isEditMode, form]);

  // --- Submit Handler ---
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Prepare payload sesuai API /auth/add-user
      const payload: any = {
        namaLengkap: values.namaLengkap,
        email: values.email,
        nomorTelepon: values.nomorTelepon,
        role: values.role,
        alamat: values.alamat,
      };

      // Tambahkan tanggal lahir jika ada
      if (values.tanggalLahir) {
        payload.tanggalLahir = values.tanggalLahir.format("YYYY-MM-DD");
      }

      // --- TAMBAHAN: Password untuk create dan edit mode ---
      if (values.password && values.password.trim() !== '') {
        // Kirim password jika diisi
        payload.password = values.password;
      }

      if (isEditMode && userId) {
        // Update existing user menggunakan endpoint /user/:userId
        await updateUser(userId, payload);
        messageApi.success("Pengguna berhasil diperbarui!");
        
        // Jika password diubah, beri pesan khusus
        if (values.password && values.password.trim() !== '') {
          messageApi.info("Password berhasil diubah!", 3);
        }
      } else {
        // Create new user menggunakan endpoint /auth/add-user
        await createUser(payload);

        // Tampilkan informasi password
        if (values.password && values.password.trim() !== '') {
          messageApi.success({
            content: (
              <div>
                <p>Pengguna berhasil ditambahkan!</p>
                <p>
                  <strong>Password yang diatur:</strong> {values.password}
                </p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  (pengguna bisa mengganti password di profile)
                </p>
              </div>
            ),
            duration: 5,
          });
        } else {
          messageApi.success({
            content: (
              <div>
                <p>Pengguna berhasil ditambahkan!</p>
                <p>
                  <strong>Password default:</strong> YTREWQ
                </p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  (pengguna bisa mengganti password di profile)
                </p>
              </div>
            ),
            duration: 5,
          });
        }
      }

      // Tunggu sebentar sebelum redirect
      setTimeout(() => {
        navigate("/dashboard/management-user");
      }, 2000);

    } catch (error: any) {
      messageApi.error(error.message || "Terjadi kesalahan!");
    } finally {
      setLoading(false);
    }
  };

  // Validasi nomor telepon
  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Format nomor telepon tidak valid!'));
  };

  // Validasi password (untuk create mode - wajib, untuk edit mode - opsional)
  const validatePassword = (_: any, value: string) => {
    if (isEditMode) {
      // Untuk edit mode: opsional
      if (!value || value === '' || value.length >= 6) {
        return Promise.resolve();
      }
    } else {
      // Untuk create mode: wajib
      if (!value || value === '') {
        return Promise.reject(new Error('Password wajib diisi untuk pengguna baru'));
      }
      if (value.length < 6) {
        return Promise.reject(new Error('Password minimal 6 karakter'));
      }
    }
    return Promise.resolve();
  };

  // Validasi konfirmasi password
  const validateConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      const password = getFieldValue('password');
      
      if (isEditMode) {
        // Untuk edit mode: validasi hanya jika password diisi
        if (!password || password === '') {
          return Promise.resolve();
        }
      } else {
        // Untuk create mode: password wajib, jadi konfirmasi juga wajib
        if (!password) {
          return Promise.resolve();
        }
      }
      
      if (!value || value === password) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Password tidak cocok'));
    },
  });

  // Loading state untuk edit mode
  if (isEditMode && isUserStoreLoading) {
    return (
      <DashboardLayout
        pageTitle="Edit Pengguna"
        pageSubtitle="Memuat data pengguna..."
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" tip="Memuat data pengguna..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      pageSubtitle={
        isEditMode
          ? "Perbarui data pengguna yang dipilih"
          : "Silakan isi data pengguna secara lengkap"
      }
    >
      {contextHolder}

      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: 600, fontSize: '16px' }}>
                {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </span>
            </div>
            {isEditMode && selectedUser && (
              <Tag color={selectedUser.isActive ? "success" : "error"}>
                {selectedUser.isActive ? "Aktif" : "Nonaktif"}
              </Tag>
            )}
          </div>
        }
        className="shadow-md rounded-lg"
        loading={isEditMode && isUserStoreLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* Section: Informasi Pribadi */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserOutlined />
              Informasi Pribadi
            </h3>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span className="font-medium">
                      Nama Lengkap
                    </span>
                  }
                  name="namaLengkap"
                  rules={[
                    { required: true, message: "Nama lengkap wajib diisi" },
                    { min: 3, message: "Nama minimal 3 karakter" },
                    { max: 100, message: "Nama maksimal 100 karakter" }
                  ]}
                >
                  <Input
                    placeholder="Masukkan nama lengkap"
                    size="large"
                    allowClear
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span className="font-medium">
                      Email
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Email wajib diisi" },
                    { type: "email", message: "Format email tidak valid" },
                  ]}
                >
                  <Input
                    placeholder="masukan email aktif anda"
                    size="large"
                    disabled={isLoading || isEditMode}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span className="font-medium">
                      Nomor Telepon
                    </span>
                  }
                  name="nomorTelepon"
                  rules={[
                    { required: true, message: "Nomor telepon wajib diisi" },
                    { validator: validatePhoneNumber }
                  ]}
                >
                  <Input
                    placeholder="+628123456789"
                    size="large"
                    allowClear
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span className="font-medium">
                      Tanggal Lahir
                    </span>
                  }
                  name="tanggalLahir"
                  rules={[
                    { required: true, message: "Tanggal lahir wajib diisi" }
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Pilih tanggal lahir"
                    format="DD-MM-YYYY"
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('day');
                    }}
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={
                <span className="font-medium">
                  Alamat Lengkap
                </span>
              }
              name="alamat"
              rules={[
                { required: true, message: "Alamat wajib diisi" },
                { min: 10, message: "Alamat minimal 10 karakter" },
                { max: 500, message: "Alamat maksimal 500 karakter" }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Contoh: Jl. Soekarno-Hatta No.205, Situsaeur, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40233"
                showCount
                maxLength={500}
                disabled={isLoading}
              />
            </Form.Item>
          </div>

          {/* Section: Password (Untuk Create dan Edit Mode) */}
          <Divider />
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LockOutlined />
              Password {isEditMode ? '(Opsional)' : ''}
            </h3>
            
            {isEditMode ? (
              <Alert
                message="Informasi"
                description="Kosongkan jika tidak ingin mengubah password.Password harus terdiri dari 6 karakter (huruf kecil, besar, angka, simbol[@$!%*?&])"
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="mb-4"
              />
            ) : (
              <Alert
                message="Informasi"
                description="Password wajib diisi untuk pengguna baru. Minimal 6 karakter.Password harus terdiri dari 6 karakter (huruf kecil, besar, angka, simbol[@$!%*?&])"
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="mb-4"
              />
            )}
            
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { validator: validatePassword }
                  ]}
                >
                  <Input.Password
                    placeholder={isEditMode ? "Masukkan password baru (opsional)" : "Masukkan password"}
                    size="large"
                    iconRender={(visible) => 
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Konfirmasi Password"
                  name="confirmPassword"
                  rules={[
                    validateConfirmPassword
                  ]}
                >
                  <Input.Password
                    placeholder="Konfirmasi password"
                    size="large"
                    iconRender={(visible) => 
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    disabled={isLoading}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Section: Informasi Akun */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Informasi Akun
            </h3>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span className="font-medium">
                      Role Pengguna
                    </span>
                  }
                  name="role"
                  rules={[{ required: true, message: "Role wajib dipilih" }]}
                >
                  <Select
                    placeholder="Pilih role pengguna"
                    size="large"
                    optionLabelProp="label"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {roleOptions.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        label={
                          <span style={{ color: option.color, fontWeight: 500 }}>
                            {option.label}
                          </span>
                        }
                      >
                        <Badge
                          color={option.color}
                          text={option.label}
                          className="font-medium"
                        />
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
            </Row>
          </div>

          {/* Action Buttons */}
          <Form.Item className="mt-10">
            <div className="flex justify-end gap-3">
              <Button
                size="large"
                onClick={() => navigate("/dashboard/management-user")}
                style={{ minWidth: 120 }}
                disabled={isLoading}
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
                {isEditMode ? 'Perbarui Data' : 'Tambah Pengguna'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

    </DashboardLayout>
  );
};

export default UserForm;