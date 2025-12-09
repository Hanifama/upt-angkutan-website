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
  Modal,
  Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import type { UploadProps } from "antd";
import { useLayananStore } from "../../../../store/useLayananStore";
import { useUploadStore } from "../../../../store/useUploadStore";
import { useHalteStore } from "../../../../store/useHalteStore";

const { Option } = Select;
const { TextArea } = Input;

const HalteForm: React.FC = () => {
  const { halteId } = useParams<{ halteId: string }>(); // Ubah dari id ke halteId
  const {
    createHalte,
    updateHalte,
    getHalteById,
    selectedHalte,
    isLoading: isStoreLoading,
    setSelectedHalte,
  } = useHalteStore();

  const { layanan, fetchLayanan, isLoading: isLayananLoading } = useLayananStore();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { uploadFile, uploadedFile, isLoading: isUploading, resetUpload } =
    useUploadStore();

  const [isLoadingHalte, setIsLoadingHalte] = useState(false);

  const isLoading = isStoreLoading || isUploading || isLayananLoading || isLoadingHalte;
  const isEditMode = !!halteId;

  // --- FETCH DATA ---
  useEffect(() => {
    fetchLayanan();

    if (isEditMode && halteId) {
      fetchHalteData();
    }

    return () => {
      setSelectedHalte(null);
      resetUpload();
    };
  }, [halteId, isEditMode]);

  const fetchHalteData = async () => {
    try {
      setIsLoadingHalte(true);
      await getHalteById(halteId);
    } catch (error: any) {
      messageApi.error(error.message || "Gagal memuat data halte");
      navigate("/dashboard/halte"); // Redirect jika error
    } finally {
      setIsLoadingHalte(false);
    }
  };

  const activeLayanan = layanan.filter((item) => item.status === true);

  // -------- SET DATA SAAT EDIT ----------
  useEffect(() => {
    if (selectedHalte && isEditMode) {
      // Reset form terlebih dahulu
      form.resetFields();

      // Set nilai form
      form.setFieldsValue({
        nama: selectedHalte.nama,
        deskripsi: selectedHalte.deskripsi,
        latitude: String(selectedHalte.location.latitude),
        longitude: String(selectedHalte.location.longitude),
        status: selectedHalte.status,
      });

      // Set layanan IDs
      if (selectedHalte.layanan && selectedHalte.layanan.length > 0) {
        const layananIds = selectedHalte.layanan.map(l => l.id);
        setSelectedLayanan(layananIds);
      } else {
        setSelectedLayanan([]);
      }

      // Set gambar jika ada
      if (selectedHalte.gambar) {
        setPreviewImage(selectedHalte.gambar);
        setFileList([
          {
            uid: "-1",
            name: "gambar-halte",
            status: "done",
            url: selectedHalte.gambar,
          },
        ]);
      } else {
        setFileList([]);
        setPreviewImage("");
      }
    }
  }, [selectedHalte, isEditMode]);

  // --- Upload Manual ---
  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
      messageApi.success("File berhasil diunggah!", 2);
      if (uploadedFile?.withUrl) {
        setPreviewImage(uploadedFile.withUrl);
        // Tambahkan ke fileList
        setFileList([
          {
            uid: "-2",
            name: file.name,
            status: "done",
            url: uploadedFile.withUrl,
          },
        ]);
      }
    } catch (err: any) {
      messageApi.error(err.message || "Gagal mengunggah file", 2);
      throw err;
    }
  };

  const handleCancel = () => setPreviewOpen(false);

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
    // Jika file dihapus, reset preview image
    if (newList.length === 0) {
      setPreviewImage("");
    }
    setFileList(newList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // ===================== SUBMIT =====================
  const onFinish = async (values: any) => {
    // Validasi layanan
    if (selectedLayanan.length === 0) {
      messageApi.error("Pilih minimal satu layanan!");
      return;
    }

    // Validasi koordinat
    if (isNaN(parseFloat(values.latitude)) || isNaN(parseFloat(values.longitude))) {
      messageApi.error("Koordinat harus berupa angka!");
      return;
    }

    const payload = {
      nama: values.nama,
      deskripsi: values.deskripsi,
      latitude: parseFloat(values.latitude),
      longitude: parseFloat(values.longitude),
      status: values.status,
      gambar: uploadedFile?.withUrl || previewImage || undefined,
      layananIds: selectedLayanan,
    };

    try {
      if (isEditMode && halteId) {
        await updateHalte(halteId, payload);
        messageApi.success("Halte berhasil diperbarui!", 1);
      } else {
        await createHalte(payload);
        messageApi.success("Halte berhasil ditambahkan!", 1);
        resetUpload();
        form.resetFields();
        setSelectedLayanan([]);
        setFileList([]);
        setPreviewImage("");
      }

      setTimeout(() => navigate("/dashboard/halte"), 800);
    } catch (error: any) {
      messageApi.error(error.message || "Terjadi kesalahan!", 2);
    }
  };

  const onFinishFailed = () =>
    messageApi.warning("Form belum lengkap, periksa kembali!", 2);

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

  // Loading state
  if (isEditMode && isLoadingHalte) {
    return (
      <DashboardLayout
        pageTitle="Edit Data Halte"
        pageSubtitle="Memuat data halte..."
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" tip="Memuat data halte..." />
        </div>
      </DashboardLayout>
    );
  }

  // Fungsi untuk mendapatkan lokasi GPS
  const handleGetLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      messageApi.error("Browser Anda tidak mendukung Geolocation!");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Set nilai latitude dan longitude ke form
        form.setFieldsValue({
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        });

        setIsGettingLocation(false);
        messageApi.success("Lokasi berhasil diambil dari GPS!");
      },
      (error) => {
        let errorMessage = "Gagal mengambil lokasi: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Izin lokasi ditolak";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Informasi lokasi tidak tersedia";
            break;
          case error.TIMEOUT:
            errorMessage += "Permintaan lokasi timeout";
            break;
          default:
            errorMessage += "Error tidak diketahui";
        }
        messageApi.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <DashboardLayout
      pageTitle={isEditMode ? "Edit Data Halte" : "Tambah Data Halte"}
      pageSubtitle={
        isEditMode
          ? "Perbarui data halte yang sudah ada"
          : "Silakan isi data halte secara lengkap."
      }
    >
      {contextHolder}

      <Card
        title={isEditMode ? "Form Edit Halte" : "Form Tambah Halte"}
        className="shadow-md rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{ status: true }}
        >
          {/* =================== INFORMASI =================== */}
          <h3 style={{ fontWeight: 600, fontSize: "16px", marginBottom: 16 }}>
            Informasi Dasar Halte
          </h3>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nama Halte"
                name="nama"
                rules={[
                  { required: true, message: "Nama halte wajib diisi!" },
                  { max: 100, message: "Nama halte maksimal 100 karakter" },
                ]}
              >
                <Input placeholder="Masukkan nama halte" disabled={isLoading} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Status" name="status" valuePropName="checked">
                <Switch
                  checkedChildren="Aktif"
                  unCheckedChildren="Nonaktif"
                  disabled={isLoading}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Deskripsi"
            name="deskripsi"
            rules={[
              { required: true, message: "Deskripsi wajib diisi!" },
              { max: 500, message: "Deskripsi maksimal 500 karakter" },
            ]}
          >
            <TextArea rows={3} disabled={isLoading} />
          </Form.Item>

          {/* =================== KOORDINAT =================== */}
          <h3
            style={{ fontWeight: 600, fontSize: "16px", margin: "24px 0 16px" }}
          >
            Koordinat Lokasi
          </h3>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Latitude"
                name="latitude"
                rules={[
                  { required: true, message: "Latitude wajib diisi!" },
                  {
                    pattern: /^-?\d+(\.\d+)?$/,
                    message: "Format latitude tidak valid",
                  },
                ]}
              >
                <Input placeholder="-6.9224096" disabled={isLoading} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Longitude"
                name="longitude"
                rules={[
                  { required: true, message: "Longitude wajib diisi!" },
                  {
                    pattern: /^-?\d+(\.\d+)?$/,
                    message: "Format longitude tidak valid",
                  },
                ]}
              >
                <Input placeholder="107.6070151" disabled={isLoading} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" ">
                <Button
                  type="default"
                  onClick={handleGetLocation}
                  loading={isGettingLocation}
                  block
                  icon={isGettingLocation ? <Spin size="small" /> : null}
                  style={{
                    backgroundColor: isGettingLocation ? '#f0f0f0' : '#1890ff',
                    color: isGettingLocation ? '#666' : 'white',
                    borderColor: '#1890ff'
                  }}
                >
                  {isGettingLocation ? "Mendapatkan Lokasi..." : "Ambil Lokasi Saat Ini dari GPS"}
                </Button>
              </Form.Item>

            </Col>
          </Row>

          {/* =================== UPLOAD =================== */}
          <Form.Item
            label="Upload Gambar"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={(file) => {
                handleUpload(file);
                return false;
              }}
              accept=".jpg,.jpeg,.png,.webp"
              maxCount={1}
              disabled={isLoading}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Modal open={previewOpen} footer={null} onCancel={handleCancel}>
            <img alt="preview" style={{ width: "100%" }} src={previewImage} />
          </Modal>

          {/* =================== LAYANAN =================== */}
          <h3
            style={{ fontWeight: 600, fontSize: "16px", margin: "24px 0 16px" }}
          >
            Layanan yang Tersedia
          </h3>

          <Form.Item label="Pilih Layanan">
            <Select
              mode="multiple"
              value={selectedLayanan}
              onChange={(val) => setSelectedLayanan(val)}
              placeholder="Pilih layanan"
              loading={isLayananLoading}
              disabled={isLoading}
              allowClear
            >
              {activeLayanan.map((item) => (
                <Option key={item.id} value={String(item.id)}>
                  {item.nama}
                </Option>
              ))}
            </Select>

            <div style={{ fontSize: 12, marginTop: 4 }}>
              {activeLayanan.length > 0
                ? `Tersedia ${activeLayanan.length} layanan aktif`
                : "Memuat layanan..."}
            </div>
          </Form.Item>

          {/* =================== BUTTON =================== */}
          <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
            <Button
              onClick={() => navigate("/dashboard/halte")}
              disabled={isLoading}
              style={{
                borderColor: "#FF4D4F",
                color: "#FF4D4F",
                marginRight: 8
              }}
            >
              Batal
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                backgroundColor: "#2E3192",
                borderColor: "#2E3192"
              }}
            >
              {isEditMode ? "Perbarui" : "Simpan"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default HalteForm;