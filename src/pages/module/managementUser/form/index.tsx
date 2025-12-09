import React, { useState, useEffect } from "react";
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
  Typography,
  Alert,
  Tag,
  Divider,
  Badge,
  Modal,
  Spin,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import type { UploadProps } from "antd";
import { useUploadStore } from "../../../../store/useUploadStore";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useUserStore } from "../../../../store/useUserStore";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

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
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Stores
  const {
    selectedUser,
    isLoading: isUserStoreLoading,
    createUser,
    updateUser,
    fetchUserById,
  } = useUserStore();

  const {
    uploadFile,
    uploadedFile,
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

      // Set avatar jika ada
      if (selectedUser.avatar) {
        setPreviewImage(selectedUser.avatar);
        setFileList([
          {
            uid: "-1",
            name: "avatar-user",
            status: "done",
            url: selectedUser.avatar,
          },
        ]);
      } else {
        setFileList([]);
        setPreviewImage("");
      }
    }
  }, [selectedUser, isEditMode, form]);

  // Monitor perubahan pada uploadedFile untuk update preview
  useEffect(() => {
    if (uploadedFile?.withUrl) {
      // Jika uploadedFile berubah dan ada withUrl, update preview
      setPreviewImage(uploadedFile.withUrl);
      setFileList([
        {
          uid: "-3",
          name: uploadedFile.filename || "avatar",
          status: "done",
          url: uploadedFile.withUrl,
        },
      ]);
    }
  }, [uploadedFile]);

  // --- Upload Handler ---
  const handleUpload = async (file: File) => {
    try {
      setAvatarLoading(true);

      // Upload file ke server
      await uploadFile(file);

      // Response akan tersimpan di uploadedFile melalui store
      // useEffect di atas akan menangani update preview

      messageApi.success("Avatar berhasil diunggah!", 2);

    } catch (err: any) {
      messageApi.error(err.message || "Gagal mengunggah avatar", 2);
      throw err;
    } finally {
      setAvatarLoading(false);
    }
  };

  // --- Avatar Preview ---
  const handleCancel = () => setPreviewOpen(false);

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // --- Avatar Preview Handler ---
  const handlePreview = async (file: UploadFile) => {
    // Jika file sudah diupload dan memiliki URL dari response API
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url?.split('/').pop() || "Avatar");
    }
    // Jika masih file lokal sebelum upload
    else if (file.originFileObj) {
      try {
        const preview = await getBase64(file.originFileObj as RcFile);
        setPreviewImage(preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || "Avatar");
      } catch (error) {
        messageApi.error("Gagal menampilkan preview");
      }
    }
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
    setFileList(newList);
  };

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

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

      // Prioritas 1: URL dari uploadedFile terbaru
      if (uploadedFile?.withUrl) {
        payload.avatar = uploadedFile.withUrl;
      }
      // Prioritas 2: URL dari previewImage (bisa dari edit mode atau upload sebelumnya)
      else if (previewImage && previewImage.startsWith('http')) {
        payload.avatar = previewImage;
      }

      // --- TAMBAHAN BARU: Password hanya untuk edit mode ---
      if (isEditMode && values.newPassword && values.newPassword.trim() !== '') {
        // Kirim password baru jika diisi
        payload.password = values.newPassword;
      }

      if (isEditMode && userId) {
        // Update existing user menggunakan endpoint /user/:userId
        payload.isActive = values.isActive;
        await updateUser(userId, payload);
        messageApi.success("Pengguna berhasil diperbarui!");
        
        // Jika password diubah, beri pesan khusus
        if (values.newPassword && values.newPassword.trim() !== '') {
          messageApi.info("Password berhasil diubah!", 3);
        }
      } else {
        // Create new user menggunakan endpoint /auth/add-user
        // Password akan auto-generated: BemoBandung25$
        await createUser(payload);

        // Tampilkan informasi password default
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

  // Validasi tanggal lahir
  const validateBirthDate = (_: any, value: dayjs.Dayjs) => {
    if (!value) {
      return Promise.resolve();
    }

    const today = dayjs();
    const minDate = dayjs().subtract(120, 'year'); // Maks 120 tahun
    const maxDate = dayjs().subtract(17, 'year'); // Minimal 17 tahun

    if (value.isAfter(today)) {
      return Promise.reject(new Error('Tanggal lahir tidak boleh di masa depan!'));
    }

    if (value.isBefore(minDate)) {
      return Promise.reject(new Error('Tanggal lahir terlalu tua!'));
    }

    if (value.isAfter(maxDate)) {
      return Promise.reject(new Error('Minimal usia 17 tahun!'));
    }

    return Promise.resolve();
  };

  // Validasi password
  const validatePassword = (_: any, value: string) => {
    if (!value || value === '') {
      return Promise.resolve(); // Password opsional untuk edit
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Password minimal 6 karakter'));
    }
    return Promise.resolve();
  };

  // Validasi konfirmasi password
  const validateConfirmPassword = ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      const newPassword = getFieldValue('newPassword');
      if (!newPassword || newPassword === '') {
        // Jika password baru kosong, tidak perlu validasi
        return Promise.resolve();
      }
      if (!value || value === newPassword) {
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
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/dashboard/management-user")}
                type="text"
                disabled={isLoading}
              >
                Kembali
              </Button>
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
        {!isEditMode && (
          <Alert
            message="Informasi Penting"
            description={
              <div>
                <p>Password default akan di-generate otomatis: <strong>YTREWQ</strong></p>
                <p className="text-sm text-gray-600 mt-1">
                  pengguna bisa mengganti password di profile
                </p>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ isActive: true }}
        >
          {/* Section: Informasi Pribadi */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserOutlined />
              Informasi Pribadi
            </h3>

            {/* Avatar Upload Section */}
            {isEditMode && (
              <div className="flex flex-col items-center mb-6">
                <div className="mb-4">
                  <Avatar
                    size={100}
                    src={previewImage}
                    icon={!previewImage && <UserOutlined />}
                    style={{
                      backgroundColor: previewImage ? 'transparent' : '#1890ff',
                      border: '3px solid #f0f0f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: previewImage ? 'pointer' : 'default'
                    }}
                    onClick={previewImage ? () => {
                      setPreviewOpen(true);
                      setPreviewTitle("Foto Profil");
                    } : undefined}
                  />
                </div>

                <Form.Item
                  name="avatar"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  className="text-center"
                >
                  <div className="flex gap-2">
                    <Upload
                      beforeUpload={(file) => {
                        handleUpload(file);
                        return false;
                      }}
                      showUploadList={false}
                      accept=".jpg,.jpeg,.png,.webp"
                      maxCount={1}
                      disabled={isLoading || avatarLoading}
                    >
                      <Button
                        icon={avatarLoading ? <Spin size="small" /> : <UploadOutlined />}
                        loading={avatarLoading}
                        size="middle"
                      >
                        {previewImage ? 'Ganti Foto Profil' : 'Upload Foto Profil'}
                      </Button>
                    </Upload>
                    {previewImage && (
                      <Button
                        danger
                        onClick={() => {
                          setPreviewImage("");
                          setFileList([]);
                          resetUpload();
                        }}
                        type="text"
                        disabled={isLoading}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                  Ukuran maksimal 2MB. Format: JPG, PNG, WEBP
                  {previewImage && (
                    <span style={{ color: '#52c41a', marginLeft: 8 }}>
                      ✓ Avatar siap diunggah
                    </span>
                  )}
                </Text>
              </div>
            )}

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

          {/* Section: Ganti Password (Edit Mode Only) */}
          {isEditMode && (
            <>
              <Divider />
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LockOutlined />
                  Ganti Password (Opsional)
                </h3>
                
                <Alert
                  message="Informasi"
                  description="Kosongkan jika tidak ingin mengubah password. Password minimal 6 karakter."
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  className="mb-4"
                />
                
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Password Baru"
                      name="newPassword"
                      rules={[
                        { validator: validatePassword }
                      ]}
                    >
                      <Input.Password
                        placeholder="Masukkan password baru (opsional)"
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
                        placeholder="Konfirmasi password baru"
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
            </>
          )}

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
                disabled={avatarLoading}
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

      {/* Avatar Preview Modal */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
        centered
      >
        <img
          alt="preview"
          style={{ width: "100%", borderRadius: '8px' }}
          src={previewImage}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default UserForm;