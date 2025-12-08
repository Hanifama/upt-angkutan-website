import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { PictureOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";

import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useArmadaStore } from "../../../../store/useArmadaStore";
import { useLayananStore } from "../../../../store/useLayananStore";
import { useRouteStore } from "../../../../store/useRoutesStore";
import { useUploadStore } from "../../../../store/useUploadStore";
import type { Layanan, Route } from "../../../../interfaces/route";

import dayjs from "dayjs";

const { Option } = Select;

const ArmadaForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedLayananId, setSelectedLayananId] = useState<string | null>(
    null
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { layanan, fetchLayanan } = useLayananStore();
  const { routes, fetchRoutes } = useRouteStore();
  const { createArmada, updateArmada, getArmadaById, isLoading } =
    useArmadaStore();
  const {
    uploadFile,
    uploadedFile,
    isLoading: isUploading,
    resetUpload,
  } = useUploadStore();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  /** Handle Layanan Change */
  const handleLayananChange = async (layananId: string) => {
    setSelectedLayananId(layananId);
    form.setFieldsValue({ rute: undefined, ruteId: undefined });
    await fetchRoutes({ layananId });
  };

  /** Load detail saat edit */
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLoadingDetail(true);

      getArmadaById(id)
        .then(async (data) => {
          if (data) {
            form.setFieldsValue({
              tanggalPencatatan: data.tanggalPencatatan
                ? dayjs(data.tanggalPencatatan)
                : null,
              nomorPolisi: data.licensePlate,
              tahunKendaraan: data.tahunKendaraan,
              kapasitas: data.kapasitas,
              masaBerlakuUjiKelayakan: data.kirExpiresAt
                ? dayjs(data.kirExpiresAt)
                : null,
              nomorUjiKelayakan: data.kirNumber,
              nomorIzinKartu: data.sipaNumber,
              masaBerlakuIzinKartu: data.sipaExpiresAt
                ? dayjs(data.sipaExpiresAt)
                : null,
              layanan: data.layanan?.id,
              rute: data.rute?.nama,
              ruteId: data.rute?.id,
            });

            if (data.potoArmada) setPreviewImage(data.potoArmada);

            if (data.layanan?.id) {
              setSelectedLayananId(data.layanan?.id);
              await fetchRoutes({ layananId: data.layanan?.id });
            }
          }
        })
        .finally(() => setLoadingDetail(false));
    }
  }, [id]);

  /** Upload File Manual */
  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
      messageApi.success("File berhasil diunggah!", 2);
      if (uploadedFile?.withUrl) setPreviewImage(uploadedFile.withUrl);
    } catch (err: any) {
      messageApi.error(err.message || "Gagal mengunggah file", 2);
    }
  };

  /** Submit Form */
  const onFinish = async (values: any) => {
    try {
      const rawPayload = {
        licensePlate: values.nomorPolisi,
        layananId: values.layanan || undefined,
        routeId: values.ruteId || undefined,
        kapasitas: Number(values.kapasitas) || 0,
        tahunKendaraan: values.tahunKendaraan
          ? Number(values.tahunKendaraan)
          : undefined,
        stnkExpiresAt: values.masaBerlakuUjiKelayakan
          ? values.masaBerlakuUjiKelayakan.format("YYYY-MM-DD")
          : undefined,
        kirExpiresAt: values.masaBerlakuUjiKelayakan
          ? values.masaBerlakuUjiKelayakan.format("YYYY-MM-DD")
          : undefined,
        sipaExpiresAt: values.masaBerlakuIzinKartu
          ? values.masaBerlakuIzinKartu.format("YYYY-MM-DD")
          : undefined,
        tanggalPencatatan: values.tanggalPencatatan
          ? values.tanggalPencatatan.format("YYYY-MM-DD")
          : undefined,
        sipaNumber: values.nomorIzinKartu || undefined,
        kirNumber: values.nomorUjiKelayakan || undefined,
        tersedia: true,
        status: true,
        potoArmada: uploadedFile?.withUrl || previewImage || undefined,
      };

      const cleanPayload = (payload: any) => {
        const result: any = {};
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            result[key] = value;
          }
        });
        return result;
      };

      const payload = isEditMode ? cleanPayload(rawPayload) : rawPayload;

      if (isEditMode && id) {
        await updateArmada(id, payload);
        messageApi.success("Armada berhasil diperbarui!", 1); // tampil 1 detik
        setTimeout(() => navigate("/dashboard/armada"), 1000); // delay 1 detik
      } else {
        const result = await createArmada(payload);
        if (result) {
          messageApi.success("Armada berhasil ditambahkan!", 1);
          resetUpload();
          setTimeout(() => navigate("/dashboard/armada"), 1000);
        }
      }
    } catch (error: any) {
      messageApi.error(
        error.message || "Terjadi kesalahan. Coba lagi nanti!",
        2
      );
    }
  };

  /** Form validation failed */
  const onFinishFailed = (errorInfo: any) => {
    // Tampilkan pesan error pertama
    if (errorInfo.errorFields?.length) {
      const firstError = errorInfo.errorFields[0];
      messageApi.error(
        firstError.errors[0] || "Terdapat field yang belum diisi!",
        2
      );
    }
  };

  if (loadingDetail) {
    return (
      <DashboardLayout pageTitle="Memuat Data Armada...">
        <div className="flex justify-center py-16">
          <Spin tip="Memuat data armada..." />
        </div>
      </DashboardLayout>
    );
  }

  const pageTitle = isEditMode ? "Edit Data Armada" : "Tambah Data Armada";
  const cardTitle = isEditMode ? "Form Edit Armada" : "Form Tambah Armada";
  const pageSubtitle = isEditMode
    ? "Silakan perbarui data armada sesuai kebutuhan."
    : "Silakan isi data armada secara lengkap.";

  return (
    <DashboardLayout pageTitle={pageTitle} pageSubtitle={pageSubtitle}>
      {contextHolder}
      <Card title={cardTitle} className="shadow-md rounded-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {/* === TANGGAL PENCATATAN === */}
          <h3 className="font-semibold text-base mt-2 mb-2">
            Tanggal Pencatatan
          </h3>
          <Form.Item
            name="tanggalPencatatan"
            rules={[{ required: true, message: "Tanggal wajib diisi!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Pilih Tanggal Pencatatan"
            />
          </Form.Item>

          {/* === INFORMASI KENDARAAN === */}
          <h3 className="font-semibold text-base mt-6 mb-2">
            Informasi Kendaraan
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nomor Polisi"
                name="nomorPolisi"
                rules={[
                  { required: true, message: "Nomor Polisi wajib diisi!" },
                ]}
              >
                <Input placeholder="Masukkan nomor polisi (contoh: D 1234 AB)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tahun Kendaraan"
                name="tahunKendaraan"
                rules={[
                  { required: true, message: "Tahun kendaraan wajib diisi!" },
                ]}
              >
                <Input placeholder="Masukkan tahun kendaraan (contoh: 2020)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Kapasitas"
                name="kapasitas"
                rules={[{ required: true, message: "Kapasitas wajib diisi!" }]}
              >
                <Input
                  type="number"
                  placeholder="Masukkan kapasitas (contoh: 25)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Masa Berlaku Uji Kelayakan (KIR)"
                name="masaBerlakuUjiKelayakan"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal masa berlaku"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* === INFORMASI IZIN KARTU === */}
          <h3 className="font-semibold text-base mt-6 mb-2">
            Informasi Izin Kartu
          </h3>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nomor Izin Kartu (SIPA)" name="nomorIzinKartu">
                <Input placeholder="Masukkan nomor izin kartu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Masa Berlaku Izin Kartu (SIPA)"
                name="masaBerlakuIzinKartu"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal masa berlaku"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* === LAYANAN & RUTE === */}
          <h3 className="font-semibold text-base mt-6 mb-2">Layanan & Rute</h3>
          <Form.Item
            label="Layanan"
            name="layanan"
            rules={[{ required: true, message: "Pilih layanan kendaraan!" }]}
          >
            <Select
              placeholder="Pilih Layanan"
              onOpenChange={(open) => {
                if (open && layanan.length === 0) fetchLayanan();
              }}
              onChange={handleLayananChange}
              virtual={false}
            >
              {layanan.map((item: Layanan) => (
                <Option key={item.id} value={item.id}>
                  {item.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="ID Rute" name="ruteId">
                <Input disabled placeholder="ID rute" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nama Rute"
                name="rute"
                rules={[{ required: true, message: "Rute wajib dipilih!" }]}
              >
                <Select
                  placeholder={
                    selectedLayananId
                      ? "Pilih Rute dari layanan ini"
                      : "Pilih layanan terlebih dahulu"
                  }
                  disabled={!selectedLayananId}
                  onChange={(value) => form.setFieldsValue({ ruteId: value })}
                  virtual={false}
                >
                  {routes.map((item: Route) => (
                    <Option key={item.routeId} value={item.routeId}>
                      {item.routeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* === UPLOAD FOTO === */}
          <h3 className="font-semibold text-base mt-6 mb-2">Foto Kendaraan</h3>
          <Form.Item name="fotoArmada">
            <Dragger
              name="file"
              multiple={false}
              accept=".png,.jpg,.jpeg"
              beforeUpload={(file) => {
                handleUpload(file);
                return false;
              }}
              showUploadList={{ showRemoveIcon: true }}
            >
              {isUploading ? (
                <Spin tip="Mengunggah..." />
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <PictureOutlined style={{ color: "#2E3192" }} />
                  </p>
                  <p className="ant-upload-text">
                    Unggah foto kendaraan atau seret ke sini
                  </p>

                  {/* Tampilkan nama file */}
                  {uploadedFile && (
                    <p className="text-green-600 mt-2 text-sm">
                      {uploadedFile.filename} berhasil diunggah
                    </p>
                  )}

                  {/* Tampilkan preview gambar */}
                  {previewImage && (
                    <div className="mt-2 flex justify-center">
                      <img
                        src={previewImage}
                        alt="Preview Foto Armada"
                        className="max-h-60 object-contain border rounded"
                      />
                    </div>
                  )}
                </>
              )}
            </Dragger>
          </Form.Item>

          {/* === BUTTONS === */}
          <Form.Item className="mt-6">
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  block
                  onClick={() => navigate(-1)}
                  style={{
                    borderColor: "#FF4D4F",
                    color: "#FF4D4F",
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
                  loading={isLoading || isUploading}
                  style={{
                    backgroundColor: "#2E3192",
                    borderColor: "#2E3192",
                  }}
                >
                  Simpan
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default ArmadaForm;
