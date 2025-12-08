import React, { useEffect } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Spin,
} from "antd";
import { FormOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useKeluhanPenggunaStore } from "../../store/useKeluhanPenggunaStore";
import { useLayananStore } from "../../store/useLayananStore";

const { Option } = Select;
const { TextArea } = Input;

const FormKeluhan: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { createKeluhanPengguna, isLoading } = useKeluhanPenggunaStore();
  const {
    layanan,
    fetchLayanan,
    isLoading: layananLoading,
    error: layananError,
  } = useLayananStore();

  // Ambil daftar layanan saat component mount
  useEffect(() => {
    fetchLayanan();
  }, [fetchLayanan]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        namaLengkap: values.namaLengkap,
        jenisLayanan: values.layanan,
        tanggalKejadian: dayjs(values.tanggalKejadian).format("YYYY-MM-DD"),
        keterangan: values.keterangan,
      };

      await createKeluhanPengguna(payload);

      messageApi.success("Keluhan berhasil dikirim!", 2, () => {
        form.resetFields();
      });
    } catch (error) {
      messageApi.error("Gagal mengirim keluhan, coba lagi nanti!", 2);
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FormOutlined />
            Form Keluhan Pengguna
          </div>
        }
        className="shadow-md rounded-2xl p-6 bg-white flex flex-col w-full"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="flex-1 flex flex-col justify-between"
        >
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="namaLengkap"
                label="Nama Lengkap"
                rules={[
                  { required: true, message: "Nama lengkap wajib diisi" },
                ]}
              >
                <Input placeholder="Masukkan nama lengkap Anda" />
              </Form.Item>

              <Form.Item
                name="layanan"
                label="Layanan Transportasi"
                rules={[
                  { required: true, message: "Pilih layanan transportasi" },
                ]}
              >
                {layananLoading ? (
                  <Spin />
                ) : layananError ? (
                  <div className="text-red-500">{layananError}</div>
                ) : (
                  <Select placeholder="Pilih layanan transportasi">
                    {layanan.map((item) => (
                      <Option key={item.id} value={item.nama}>
                        {item.nama}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>

            <Form.Item
              name="tanggalKejadian"
              label="Tanggal Kejadian"
              rules={[{ required: true, message: "Pilih tanggal kejadian" }]}
            >
              <DatePicker
                placeholder="Pilih tanggal kejadian"
                className="w-full"
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Form.Item
              name="keterangan"
              label="Keterangan"
              rules={[
                { required: true, message: "Tuliskan keterangan kejadian" },
              ]}
            >
              <TextArea rows={2} placeholder="Tuliskan detail kejadian..." />
            </Form.Item>
          </div>

          <Form.Item className="flex justify-end mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
            >
              Kirim
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default FormKeluhan;
