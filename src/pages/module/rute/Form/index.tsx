import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useRouteStore } from "../../../../store/useRoutesStore";
import type {
  CreateRouteRequest,
  UpdateRouteRequest,
} from "../../../../interfaces/route";
import { useLayananStore } from "../../../../store/useLayananStore";
import { useUploadStore } from "../../../../store/useUploadStore";

import dayjs from "dayjs";

const { Dragger } = Upload;
const { Option } = Select;

const RuteForm: React.FC = () => {
  const {
    uploadedFile,
    isLoading: isUploading,
    uploadFile,
    resetUpload,
  } = useUploadStore();

  const {
    createRoute,
    updateRoute,
    fetchRouteById,
    resetSelectedRoute,
    selectedRoute,
    isLoading,
  } = useRouteStore();
  const {
    layanan,
    fetchLayanan,
    isLoading: loadingLayanan,
  } = useLayananStore();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { routeId } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);

  useEffect(() => {
    fetchLayanan();
  }, []);

  useEffect(() => {
    if (routeId) {
      setIsEditMode(true);
      fetchRouteById(routeId);
      resetUpload(); // Reset upload state saat masuk mode edit
    } else {
      setIsEditMode(false);
      resetSelectedRoute();
      resetUpload();
      setCurrentDocument(null);
    }
  }, [routeId]);

  useEffect(() => {
    if (selectedRoute && isEditMode) {
      form.setFieldsValue({
        idRute: selectedRoute.routeId,
        namaRute: selectedRoute.routeName,
        layanan: selectedRoute.layanan.id,
        tarif: parseInt(String(selectedRoute.fare).replace(/[^0-9]/g, "")) || 0,
        panjangRute: selectedRoute.lengthKm,
        tanggalPencatatan: selectedRoute.createdAt
          ? dayjs(selectedRoute.createdAt)
          : null,
      });

      // Set current document untuk mode edit
      if (selectedRoute.dokumenPerwal) {
        setCurrentDocument(selectedRoute.dokumenPerwal);
      }
    }
  }, [selectedRoute, isEditMode]);

  const onFinish = async (values: any) => {
    try {
      // Tentukan dokumen yang akan dikirim
      let dokumenPerwal = "";

      if (uploadedFile) {
        // Jika ada file baru yang diupload, gunakan yang baru
        dokumenPerwal = uploadedFile.withUrl;
      } else if (isEditMode && currentDocument) {
        // Jika mode edit dan tidak ada file baru, gunakan dokumen yang sudah ada
        dokumenPerwal = currentDocument;
      } else {
        // Untuk create mode, wajib ada dokumen
        if (!isEditMode) {
          messageApi.error("Dokumen Peraturan Wali Kota wajib diunggah!", 2);
          return;
        }
      }

      if (isEditMode && routeId) {
        // Update
        const payload: UpdateRouteRequest = {
          routeName: values.namaRute,
          layananId: values.layanan,
          fare: Number(values.tarif),
          lengthKm: values.panjangRute,
          tanggalPencatatan: values.tanggalPencatatan.format("YYYY-MM-DD"),
          dokumenPerwal: dokumenPerwal,
        };
        await updateRoute(routeId, payload);
        messageApi.success("Data rute berhasil diperbarui!", 1);
        setTimeout(() => {
          navigate("/dashboard/rute");
        }, 1000);
      } else {
        // Create
        const payload: CreateRouteRequest = {
          routeId: values.idRute,
          routeName: values.namaRute,
          layananId: values.layanan,
          fare: values.tarif,
          lengthKm: values.panjangRute,
          tanggalPencatatan: values.tanggalPencatatan.format("YYYY-MM-DD"),
          dokumenPerwal: dokumenPerwal,
        };
        await createRoute(payload);
        messageApi.success("Data rute berhasil ditambahkan!", 1);
        setTimeout(() => {
          navigate("/dashboard/rute");
        }, 1000);
      }
    } catch (error: any) {
      messageApi.error(error.message, 2);
    }
  };

  const onFinishFailed = () => {
    messageApi.warning("Form belum lengkap, periksa kembali!", 2);
  };

  // Handler untuk upload file
  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
      messageApi.success(`File "${file.name}" berhasil diunggah!`, 1);
    } catch (err: any) {
      messageApi.error(err.message || "Gagal mengunggah file", 2);
    }
    return false; // mencegah auto upload antd
  };

  // Handler untuk remove file
  const handleRemove = () => {
    if (isEditMode) {
      // Jika di mode edit, reset upload state tapi pertahankan currentDocument
      resetUpload();
    } else {
      // Jika di mode create, reset upload state saja
      resetUpload();
    }
  };

  // Tentukan fileList untuk Upload component
  const getFileList = () => {
    if (uploadedFile) {
      // Jika ada file baru yang diupload
      return [{ name: uploadedFile.filename, uid: "-1" }];
    } else if (isEditMode && currentDocument) {
      // Jika mode edit dan ada dokumen yang sudah ada
      const fileName = currentDocument.split("/").pop() || "document.pdf";
      return [{ name: fileName, uid: "-2" }];
    }
    return [];
  };

  // Tentukan apakah required berdasarkan mode
  const isDocumentRequired = !isEditMode; // Hanya required untuk create

  const pageTitle = isEditMode ? "Edit Data Rute" : "Tambah Data Rute";
  const cardTitle = isEditMode ? "Form Edit Rute" : "Form Tambah Rute";
  const pageSubtitle = isEditMode
    ? "Silakan perbarui data rute sesuai kebutuhan."
    : "Silakan isi data rute secara lengkap.";

  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {contextHolder}
      <Card title={cardTitle} className="shadow-md rounded-lg">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          size="middle"
          autoComplete="off"
        >
          {/* === Tanggal Pencatatan === */}
          <Form.Item
            name="tanggalPencatatan"
            label="Tanggal Pencatatan"
            rules={[
              { required: true, message: "Tanggal pencatatan wajib diisi!" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Pilih tanggal"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          {/* === Layanan === */}
          <Form.Item
            name="layanan"
            label="Layanan"
            rules={[{ required: true, message: "Pilih salah satu layanan!" }]}
          >
            <Select
              placeholder="Pilih Layanan"
              loading={loadingLayanan}
              optionFilterProp="children"
            >
              {layanan.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* === ID Rute === */}
          <Form.Item
            name="idRute"
            label="ID Rute"
            rules={[{ required: true, message: "ID Rute wajib diisi!" }]}
          >
            <Input placeholder="Masukkan ID Rute" readOnly={isEditMode} />
          </Form.Item>

          {/* === Nama Rute === */}
          <Form.Item
            name="namaRute"
            label="Nama Rute"
            rules={[{ required: true, message: "Nama Rute wajib diisi!" }]}
          >
            <Input placeholder="Masukkan Nama Rute" />
          </Form.Item>

          {/* === Panjang Rute & Tarif === */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="panjangRute"
                label="Panjang Rute (KM)"
                rules={[
                  { required: true, message: "Panjang rute wajib diisi!" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Masukkan panjang rute"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tarif"
                label="Tarif (Rp.)"
                rules={[{ required: true, message: "Tarif wajib diisi!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Masukkan tarif"
                  formatter={(value) =>
                    `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value: any) => value.replace(/[^0-9]/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* === Dokumen Peraturan Wali Kota === */}
          <Form.Item
            name="dokumen"
            label="Dokumen Peraturan Wali Kota"
            rules={[
              {
                required: isDocumentRequired,
                message: "Unggah dokumen wajib!",
              },
            ]}
            extra={
              isEditMode ? "Kosongkan jika tidak ingin mengubah dokumen" : ""
            }
          >
            <Dragger
              name="file"
              multiple={false}
              accept=".pdf"
              beforeUpload={handleUpload}
              fileList={getFileList()}
              onRemove={handleRemove}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                {isEditMode && currentDocument
                  ? "Dokumen sudah tersedia. Unggah file baru untuk mengganti"
                  : "Unggah file PDF atau seret dan lepas"}
              </p>
              <p className="ant-upload-hint">
                {isEditMode && currentDocument
                  ? `Dokumen saat ini: ${currentDocument.split("/").pop()}`
                  : "PDF maksimal 10MB"}
              </p>
            </Dragger>
          </Form.Item>

          {/* === Tombol Aksi === */}
          <Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  block
                  onClick={() => {
                    form.resetFields();
                    resetSelectedRoute();
                    resetUpload();
                    setCurrentDocument(null);
                    navigate(-1);
                  }}
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "#FF0000",
                    color: "#FF0000",
                  }}
                >
                  Batal
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
                  loading={isLoading || isUploading}
                  disabled={isUploading}
                >
                  {isEditMode ? "Perbarui" : "Tambah"}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default RuteForm;
