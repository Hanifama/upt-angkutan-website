import React, { useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useSurveyLapanganStore } from "../../../../store/useSurveyLapangan";
import { useLayananStore } from "../../../../store/useLayananStore";
import { useRouteStore } from "../../../../store/useRoutesStore";
import type { CreateSurveyLapanganDinamisPayload } from "../../../../interfaces/surveyLapangan";
import type { Layanan, Route } from "../../../../interfaces/route";

const { Option } = Select;

const SurveyDinamisForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { createSurveyDinamis, isLoading } = useSurveyLapanganStore();
  const { layanan, fetchLayanan } = useLayananStore();
  const { routes, fetchRoutes } = useRouteStore();

  const [selectedLayananId, setSelectedLayananId] = useState<string | null>(
    null
  );

  // HAPUS state yang tidak digunakan - kita hanya butuh loading state saja
  const [isGettingKedatanganLocation, setIsGettingKedatanganLocation] =
    useState(false);
  const [isGettingKeberangkatanLocation, setIsGettingKeberangkatanLocation] =
    useState(false);

  const handleLayananChange = async (layananId: string) => {
    setSelectedLayananId(layananId);
    form.setFieldsValue({ rute: undefined });
    await fetchRoutes({ layananId });
  };

  const handleGetLocation = (type: "kedatangan" | "keberangkatan") => {
    const setIsGettingLocation =
      type === "kedatangan"
        ? setIsGettingKedatanganLocation
        : setIsGettingKeberangkatanLocation;

    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      messageApi.error("Browser kamu tidak mendukung Geolocation!");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // Langsung set nilai form tanpa perlu state tambahan
        if (type === "kedatangan") {
          form.setFieldsValue({
            latitudeKedatangan: latitude.toFixed(6),
            longitudeKedatangan: longitude.toFixed(6),
          });
        } else {
          form.setFieldsValue({
            latitudeKeberangkatan: latitude.toFixed(6),
            longitudeKeberangkatan: longitude.toFixed(6),
          });
        }

        setIsGettingLocation(false);
        messageApi.success(`Lokasi ${type} berhasil diambil!`);
      },
      (err) => {
        messageApi.error(`Gagal mengambil lokasi ${type}: ` + err.message);
        setIsGettingLocation(false);
      }
    );
  };

  const onFinish = async (values: any) => {
    try {
      const payload: CreateSurveyLapanganDinamisPayload = {
        jenisSurvey: "DINAMIS",
        tanggalSurvey: dayjs(values.tanggalSurvey).format("YYYY-MM-DD"),
        namaPenanggungJawab: values.penanggungJawab,
        waktuSurvey: dayjs(values.waktuSurvey).format("HH:mm"),
        idLayanan: values.layanan,
        idRute: values.rute,
        noPlat: values.noPlat,
        namaTitikLokasi: values.namaTitikLokasi,
        waktuKedatangan: values?.waktuKedatangan
          ? dayjs(values.waktuKedatangan).format("HH:mm")
          : undefined,
        waktuKeberangkatan: values?.waktuKeberangkatan
          ? dayjs(values.waktuKeberangkatan).format("HH:mm")
          : undefined,
        lokasiKedatangan:
          values?.latitudeKedatangan && values?.longitudeKedatangan
            ? {
                latitude: parseFloat(values.latitudeKedatangan),
                longitude: parseFloat(values.longitudeKedatangan),
              }
            : undefined,
        lokasiKeberangkatan:
          values?.latitudeKeberangkatan && values?.longitudeKeberangkatan
            ? {
                latitude: parseFloat(values.latitudeKeberangkatan),
                longitude: parseFloat(values.longitudeKeberangkatan),
              }
            : undefined,
        jumlahPenumpangNaik: values?.jumlahPenumpangNaik ?? 0,
        jumlahPenumpangTurun: values?.jumlahPenumpangTurun ?? 0,
      };

      const response = await createSurveyDinamis(payload);

      if (response && response.status === true) {
        messageApi.success("Survey dinamis berhasil ditambahkan!", 2, () => {
          navigate("/dashboard/survey-lapangan");
        });
      } else {
        messageApi.error(
          Array.isArray(response?.message)
            ? response.message.join(", ")
            : response?.message || "Gagal menambahkan survey dinamis!"
        );
      }
    } catch (error) {
      console.error("Error submit:", error);
      messageApi.error("Terjadi kesalahan saat menambah survey dinamis!", 2);
    }
  };

  const onFinishFailed = () => {
    messageApi.warning("Form belum lengkap, periksa kembali!", 2);
  };

  return (
    <DashboardLayout
      pageTitle="Tambah Data Survey Dinamis"
      pageSubtitle="Silahkan isi data anda."
    >
      {contextHolder}
      <Card>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          size="middle"
        >
          {/* Header Survey */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="tanggalSurvey"
                label="Tanggal Survey"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="penanggungJawab"
                label="Nama Penanggung Jawab"
                rules={[{ required: true }]}
              >
                <Input placeholder="Masukkan nama" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="waktuSurvey"
                label="Waktu Survey"
                rules={[{ required: true }]}
              >
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          {/* Informasi Kendaraan */}
          <Card title="Informasi Kendaraan" className="mb-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="layanan"
                  label="Layanan"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Pilih Layanan"
                    onOpenChange={(open) => {
                      if (open && layanan.length === 0) fetchLayanan();
                    }}
                    onChange={handleLayananChange}
                  >
                    {layanan.map((item: Layanan) => (
                      <Option key={item.id} value={item.id}>
                        {item.nama}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="noPlat"
                  label="Nomor Polisi Kendaraan"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Masukkan nomor plat" />
                </Form.Item>
              </Col>
            </Row>

            {/* Row untuk Rute dan Nama Titik Lokasi */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="rute"
                  label="Rute"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder={
                      selectedLayananId
                        ? "Pilih Rute dari layanan ini"
                        : "Pilih layanan terlebih dahulu"
                    }
                    disabled={!selectedLayananId}
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
              <Col span={12}>
                <Form.Item
                  name="namaTitikLokasi"
                  label="Nama Titik Lokasi"
                  tooltip="Masukkan nama lokasi (contoh: Terminal, Halte A, dll)"
                >
                  <Input placeholder="Contoh: Terminal" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Informasi Perjalanan */}
          <Card type="inner" title="Informasi Perjalanan" className="mb-4">
            {/* Kedatangan Section */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold mb-4">Kedatangan</h4>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="waktuKedatangan" label="Waktu Kedatangan">
                    <TimePicker style={{ width: "100%" }} format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Lokasi Kedatangan */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="latitudeKedatangan" label="Latitude">
                    <Input placeholder="Latitude" readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="longitudeKedatangan" label="Longitude">
                    <Input placeholder="Longitude" readOnly />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  onClick={() => handleGetLocation("kedatangan")}
                  loading={isGettingKedatanganLocation}
                  block
                  icon={
                    isGettingKedatanganLocation ? (
                      <Spin size="small" />
                    ) : undefined
                  }
                >
                  Ambil Lokasi Kedatangan
                </Button>
              </Form.Item>

              <Form.Item
                name="jumlahPenumpangNaik"
                label="Jumlah Penumpang Naik"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>
            </div>

            {/* Keberangkatan Section */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Keberangkatan</h4>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="waktuKeberangkatan"
                    label="Waktu Keberangkatan"
                  >
                    <TimePicker style={{ width: "100%" }} format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Lokasi Keberangkatan */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="latitudeKeberangkatan" label="Latitude">
                    <Input placeholder="Latitude" readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="longitudeKeberangkatan" label="Longitude">
                    <Input placeholder="Longitude" readOnly />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  onClick={() => handleGetLocation("keberangkatan")}
                  loading={isGettingKeberangkatanLocation}
                  block
                  icon={
                    isGettingKeberangkatanLocation ? (
                      <Spin size="small" />
                    ) : undefined
                  }
                >
                  Ambil Lokasi Keberangkatan
                </Button>
              </Form.Item>

              <Form.Item
                name="jumlahPenumpangTurun"
                label="Jumlah Penumpang Turun"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>
            </div>
          </Card>

          {/* Buttons */}
          <Form.Item>
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => navigate(-1)}
                style={{
                  borderColor: "#FF0000",
                  color: "#FF0000",
                  borderRadius: 4,
                  padding: "0.375rem 0.75rem",
                }}
                className="w-1/2"
              >
                Batal
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-1/2 rounded-lg"
                style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
              >
                Tambah
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default SurveyDinamisForm;
