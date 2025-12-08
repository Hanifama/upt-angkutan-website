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
import type { CreateSurveyLapanganStatisPayload } from "../../../../interfaces/surveyLapangan";
import type { Layanan, Route } from "../../../../interfaces/route";

const { Option } = Select;

const SurveyStatisForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { createSurveyStatis, isLoading } = useSurveyLapanganStore();
  const { layanan, fetchLayanan } = useLayananStore();
  const { routes, fetchRoutes } = useRouteStore();

  const [selectedLayananId, setSelectedLayananId] = useState<string | null>(
    null
  );

  // Lokasi (latitude & longitude) - Hanya satu lokasi untuk statis
  const [location, setLocation] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleLayananChange = async (layananId: string) => {
    setSelectedLayananId(layananId);
    form.setFieldsValue({ rute: undefined });
    await fetchRoutes({ layananId });
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      messageApi.error("Browser kamu tidak mendukung Geolocation!");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        form.setFieldsValue({
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        });
        setIsGettingLocation(false);
        messageApi.success("Lokasi berhasil diambil!");
      },
      (err) => {
        messageApi.error("Gagal mengambil lokasi: " + err.message);
        setIsGettingLocation(false);
      }
    );
  };

  const onFinish = async (values: any) => {
    try {
      const payload: CreateSurveyLapanganStatisPayload = {
        jenisSurvey: "STATIS",
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
        titikLokasi:
          values.latitude && values.longitude
            ? {
                latitude: parseFloat(values.latitude),
                longitude: parseFloat(values.longitude),
              }
            : undefined,
        jumlahPenumpang: values.jumlahPenumpang ?? 0,
      };

      const response = await createSurveyStatis(payload);

      if (response && response.status === true) {
        messageApi.success("Survey statis berhasil ditambahkan!", 2, () => {
          navigate("/dashboard/survey-lapangan");
        });
      } else {
        messageApi.error(
          Array.isArray(response?.message)
            ? response.message.join(", ")
            : response?.message || "Gagal menambahkan survey statis!"
        );
      }
    } catch (error) {
      console.error("Error submit:", error);
      messageApi.error("Terjadi kesalahan saat menambah survey statis!", 2);
    }
  };

  const onFinishFailed = () => {
    messageApi.warning("Form belum lengkap, periksa kembali!", 2);
  };

  return (
    <DashboardLayout
      pageTitle="Tambah Data Survey Statis"
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="waktuKedatangan" label="Waktu Kedatangan">
                  <TimePicker style={{ width: "100%" }} format="HH:mm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="waktuKeberangkatan"
                  label="Waktu Keberangkatan"
                >
                  <TimePicker style={{ width: "100%" }} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="jumlahPenumpang" label="Jumlah Penumpang">
              <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>

            {/* Latitude & Longitude otomatis */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="latitude" label="Latitude">
                  <Input
                    placeholder="Latitude"
                    readOnly
                    value={location.latitude}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="longitude" label="Longitude">
                  <Input
                    placeholder="Longitude"
                    readOnly
                    value={location.longitude}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                onClick={handleGetLocation}
                loading={isGettingLocation}
                block
                icon={isGettingLocation ? <Spin size="small" /> : undefined}
              >
                Ambil Lokasi Sekarang
              </Button>
            </Form.Item>
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

export default SurveyStatisForm;
