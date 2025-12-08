import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import LogoDishub from "../../assets/LogoDishub.svg";
import LogoJabar from "../../assets/LogoJabar.svg";

import { useAuthStore } from "../../store/useAuthStore";
import type { LoginRequest } from "../../interfaces/auth";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Ambil method login dari store
  const loginUser = useAuthStore((state) => state.loginUser);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      // Panggil login via store
      await loginUser({ email: values.email, password: values.password });

      messageApi.success("Login berhasil!");

      // Setelah login, navigasi ke dashboard
      setTimeout(() => {
        navigate("/dashboard/home");
      }, 500);
    } catch (error: any) {
      messageApi.error(error.message || "Email atau password salah!");
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
            Selamat datang, masukkan akun Anda untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <Form<LoginRequest>
          name="login"
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
            required={false}
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

          <Form.Item
            label={
              <span>
                Password{" "}
                {passwordValue && <span className="text-red-500">*</span>}
              </span>
            }
            name="password"
            required={false}
            rules={[{ required: true, message: "Mohon masukkan password!" }]}
          >
            <Input.Password
              placeholder="Masukkan password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <div className="text-right mb-4">
              <Link
                to="/forgot-password"
                className="text-sm hover:underline"
                style={{ color: "#2E3192" }}
              >
                Lupa password?
              </Link>
            </div>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="rounded-lg"
              style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
            >
              Masuk
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
