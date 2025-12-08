import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Checkbox,
  Row,
  Col,
  Select,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useDriverStore } from "../../../../store/useDriverStore";
import dayjs from "dayjs";

const { Option } = Select;

const PengemudiForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const params = useParams<{ userId: string }>();
  const [selectedSims, setSelectedSims] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const {
    createDriver,
    updateDriver,
    fetchDriverById,
    selectedDriver,
    isLoading,
    resetSelectedDriver,
  } = useDriverStore();

  const isEdit = !!params.userId;

  const simMapping: Record<string, string> = {
    A: "SIM_A",
    B1: "SIM_B1",
    B2: "SIM_B2",
    C1: "SIM_C1",
    C2: "SIM_C2",
    D: "SIM_D",
  };

  const reverseSimMapping: Record<string, string> = {
    SIM_A: "A",
    SIM_B1: "B1",
    SIM_B2: "B2",
    SIM_C1: "C1",
    SIM_C2: "C2",
    SIM_D: "D",
  };

  const pendidikanOptions = [
    "Sekolah Dasar",
    "SMP/Sederajat",
    "SMA/Sederajat",
    "S1/Sederajat",
  ];

  useEffect(() => {
    if (isEdit && params.userId) {
      fetchDriverById(params.userId);
    }
    return () => resetSelectedDriver();
  }, [params.userId]);

  useEffect(() => {
    if (!selectedDriver) return;

    try {
      let simList: string[] = [];
      let simDetails: Record<string, any> = {};

      // format array of object
      if (Array.isArray(selectedDriver.simData)) {
        simList = selectedDriver.simData.map(
          (item: any) => reverseSimMapping[item.jenisSim] || item.jenisSim
        );

        simDetails = selectedDriver.simData.reduce((acc: any, item: any) => {
          const simKey = reverseSimMapping[item.jenisSim] || item.jenisSim;
          acc[`nomorSim_${simKey}`] = item.nomorSim;
          acc[`masaBerlakuSim_${simKey}`] = item.simExpiresAt
            ? dayjs(item.simExpiresAt)
            : null;
          return acc;
        }, {});
      }
      // format lama (jenisSim tunggal)
      else if (selectedDriver.jenisSim) {
        simList = Array.isArray(selectedDriver.jenisSim)
          ? selectedDriver.jenisSim.map(
              (sim: string) => reverseSimMapping[sim] || sim
            )
          : [
              reverseSimMapping[selectedDriver.jenisSim] ||
                selectedDriver.jenisSim,
            ];
      }

      // Set semua field ke form
      form.setFieldsValue({
        namaLengkap: selectedDriver.namaLengkap,
        email: selectedDriver.email,
        nomorTelepon: selectedDriver.nomorTelepon,
        alamat: selectedDriver.alamat,
        nomorPegawai: selectedDriver.nomorPegawai,
        pendidikan: selectedDriver.pendidikanTerakhir,
        tanggalLahir: selectedDriver.tanggalLahir
          ? dayjs(selectedDriver.tanggalLahir)
          : null,
        tanggalPencatatan: selectedDriver.tanggalPencatatan
          ? dayjs(selectedDriver.tanggalPencatatan)
          : null,
        nomorSertifikat: selectedDriver.nomorSertifikatPengemudi,
        masaBerlakuSertifikat: selectedDriver.sertifikatPengemudiExpiresAt
          ? dayjs(selectedDriver.sertifikatPengemudiExpiresAt)
          : null,
        jenisSim: simList,
        ...simDetails,
      });

      setSelectedSims(simList);
    } catch (error) {
      console.error("Error parsing SIM data:", error);
    }
  }, [selectedDriver]);

  const handleSimChange = (checkedValues: string[]) =>
    setSelectedSims(checkedValues);

  const onFinish = async (values: any) => {
    try {
      // Build simData array
      const simDataPayload = selectedSims.map((sim) => ({
        jenisSim: simMapping[sim],
        nomorSim: values[`nomorSim_${sim}`],
        simExpiresAt: dayjs(values[`masaBerlakuSim_${sim}`]).format(
          "YYYY-MM-DD"
        ),
      }));

      const payload = {
        namaLengkap: values.namaLengkap,
        email: values.email,
        nomorTelepon: values.nomorTelepon,
        password: values.password || "Password_123&",
        nomorPegawai: values.nomorPegawai || "",
        alamat: values.alamat || "",
        pendidikanTerakhir: values.pendidikan || "",
        simData: simDataPayload,
        nomorSertifikatPengemudi: values.nomorSertifikat || "",
        sertifikatPengemudiExpiresAt: values.masaBerlakuSertifikat
          ? dayjs(values.masaBerlakuSertifikat).format("YYYY-MM-DD")
          : "",
        tanggalLahir: values.tanggalLahir
          ? dayjs(values.tanggalLahir).format("YYYY-MM-DD")
          : "",
        tanggalPencatatan: values.tanggalPencatatan
          ? dayjs(values.tanggalPencatatan).format("YYYY-MM-DD")
          : "",
        status: "aktif",
      };

      console.log("Payload yang dikirim:", payload);

      // Eksekusi create atau update
      if (isEdit && params.userId) {
        await updateDriver(params.userId, payload);
        messageApi.success("Data pengemudi berhasil diperbarui!", 1);
      } else {
        await createDriver(payload);
        messageApi.success("Data pengemudi berhasil disimpan!", 1);
      }

      // Tunggu 1 detik
      setTimeout(() => {
        navigate("/dashboard/pengemudi");
      }, 1000);
    } catch (error: any) {
      messageApi.error(error.message || "Terjadi kesalahan!", 2);
    }
  };

  const onFinishFailed = () => {
    messageApi.warning("Form belum lengkap, periksa kembali!", 2);
  };

  return (
    <DashboardLayout
      pageTitle={isEdit ? "Edit Data Pengemudi" : "Tambah Data Pengemudi"}
      pageSubtitle={
        isEdit
          ? "Silakan perbarui data pengemudi sesuai kebutuhan."
          : "Silakan isi data pengemudi secara lengkap."
      }
    >
      {contextHolder}

      <Card
        title={isEdit ? "Form Edit Pengemudi" : "Form Tambah Pengemudi"}
        className="shadow-md rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {/* Tanggal Pencatatan */}
          <Form.Item
            label="Tanggal Pencatatan"
            name="tanggalPencatatan"
            rules={[{ required: true, message: "Tanggal wajib diisi!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Pilih Tanggal Pencatatan"
            />
          </Form.Item>

          <h3 style={{ fontWeight: 600, fontSize: "16px", marginTop: "24px" }}>
            Informasi Pengemudi Berdasarkan KTP
          </h3>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nama Lengkap"
                name="namaLengkap"
                rules={[
                  { required: true, message: "Nama Lengkap wajib diisi!" },
                ]}
              >
                <Input placeholder="Masukkan nama lengkap" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tanggal Lahir"
                name="tanggalLahir"
                rules={[
                  { required: true, message: "Tanggal lahir wajib diisi!" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih Tanggal Lahir"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Nomor Pegawai" name="nomorPegawai" rules={[]}>
            <Input placeholder="Masukkan nomor pegawai" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email wajib diisi!" },
              { type: "email", message: "Email tidak valid!" },
            ]}
          >
            <Input placeholder="Masukkan email" />
          </Form.Item>

          <Form.Item
            label="Nomor Telepon"
            name="nomorTelepon"
            rules={[{ required: true, message: "Nomor telepon wajib diisi!" }]}
          >
            <Input placeholder="Masukkan nomor telepon" />
          </Form.Item>

          <Form.Item label="Pendidikan Terakhir" name="pendidikan">
            <Select placeholder="Pilih Pendidikan Terakhir">
              {pendidikanOptions.map((pendidikan) => (
                <Option key={pendidikan} value={pendidikan}>
                  {pendidikan}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Alamat" name="alamat">
            <Input.TextArea placeholder="Masukkan alamat lengkap" rows={3} />
          </Form.Item>

          <h3 style={{ fontWeight: 600, fontSize: "16px", marginTop: "24px" }}>
            Informasi Kepemilikan Sertifikat Pengemudi
          </h3>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nomor Sertifikat Pengemudi"
                name="nomorSertifikat"
                rules={[
                  { required: true, message: "Nomor sertifikat wajib diisi!" },
                ]}
              >
                <Input placeholder="Masukkan nomor sertifikat" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Masa Berlaku Sertifikat Pengemudi"
                name="masaBerlakuSertifikat"
                rules={[
                  {
                    required: true,
                    message: "Masa berlaku sertifikat wajib diisi!",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih Masa Berlaku Sertifikat"
                />
              </Form.Item>
            </Col>
          </Row>

          <h3 style={{ fontWeight: 600, fontSize: "16px", marginTop: "24px" }}>
            Informasi Kepemilikan SIM
          </h3>

          <Form.Item label="Jenis SIM" name="jenisSim">
            <Checkbox.Group onChange={handleSimChange}>
              <Row gutter={[16, 8]}>
                {["A", "B1", "B2", "C1", "C2", "D"].map((sim) => (
                  <Col key={sim} span={8}>
                    <Checkbox value={sim}>SIM {sim}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          {selectedSims.length > 0 && (
            <>
              <h3
                style={{
                  fontWeight: 600,
                  fontSize: "16px",
                  marginTop: "16px",
                }}
              >
                Detail SIM
              </h3>
              {selectedSims.map((sim) => (
                <Row key={sim} gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={`Nomor SIM ${sim}`}
                      name={`nomorSim_${sim}`}
                      rules={[
                        {
                          required: true,
                          message: `Nomor SIM ${sim} wajib diisi!`,
                        },
                      ]}
                    >
                      <Input placeholder={`Masukkan nomor SIM ${sim}`} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={`Masa Berlaku SIM ${sim}`}
                      name={`masaBerlakuSim_${sim}`}
                      rules={[
                        {
                          required: true,
                          message: `Masa berlaku SIM ${sim} wajib diisi!`,
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder={`Pilih Masa Berlaku SIM ${sim}`}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </>
          )}

          <Form.Item style={{ marginTop: "24px" }}>
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
                  loading={isLoading}
                  htmlType="submit"
                  style={{
                    backgroundColor: "#2E3192",
                    borderColor: "#2E3192",
                  }}
                >
                  {isEdit ? "Perbarui" : "Simpan"}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default PengemudiForm;
