import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

import LogoDishub from "../../assets/LogoDishub.svg";
import LogoJabar from "../../assets/LogoJabar.svg";
import { useAuthStore } from "../../store/useAuthStore"; // <-- import store

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [emailValue, setEmailValue] = useState<string>("");

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Ambil action dari Zustand
  const { forgotPassword } = useAuthStore();

  const onFinish = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      messageApi.success("Email reset terkirim!");
      setEmailValue("");
    } catch (error: any) {
      messageApi.error(error.message || "Gagal mengirim email reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {contextHolder}
      <div className="p-15 w-full max-w-xl">
        {/* Logos */}
        <div className="flex justify-center space-x-6 mb-6">
          <img src={LogoJabar} alt="Logo Jabar" className="h-20" />
          <img src={LogoDishub} alt="Logo Dishub" className="h-20" />
        </div>

        {/* Judul & Subtitle */}
        <div className="text-left mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#2E3192" }}>
            Dashboard Angkutan Umum Kota Bandung
          </h1>
          <p className="text-xs text-gray-500">
            Selamat datang, masukan Akun anda untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <Form<ForgotPasswordFormValues>
          name="forgot-password"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label={
              <span>
                Email {emailValue && <span className="text-red-500">*</span>}
              </span>
            }
            name="email"
            rules={[
              { required: true, message: "Mohon masukkan email!" },
              { type: "email", message: "Email tidak valid!" },
            ]}
          >
            <Input
              placeholder="Masukkan email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "5px" }}>
            <p className="text-xs text-gray-500">
              *Begitu permintaan dikirim, password baru akan dikirim melalui
              email
            </p>
          </Form.Item>

          {/* Tombol Kirim */}
          <Form.Item style={{ marginBottom: "10px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="rounded-lg"
              style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
            >
              Kirim
            </Button>
          </Form.Item>

          {/* Tombol Batal */}
          <Form.Item>
            <Button
              type="default"
              block
              onClick={() => navigate("/login")}
              className="rounded-lg"
              style={{
                borderColor: "#EF4444",
                color: "#EF4444",
                backgroundColor: "transparent",
              }}
            >
              Batal
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
