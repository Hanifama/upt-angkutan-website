import {
  ClockCircleOutlined,
  FacebookFilled,
  InstagramFilled,
  MailOutlined,
  PhoneOutlined,
  TikTokFilled,
  YoutubeFilled,
} from "@ant-design/icons";
import { Button, Layout } from "antd";
import { Footer } from "antd/es/layout/layout";
import React from "react";
import { Outlet } from "react-router-dom";
import logoDishub from "../assets/LogoDishub.svg";

const { Header, Content } = Layout;

interface CenteredLayoutProps {
  pageTitle?: string;
  pageSubtitle?: string;

  showLogin?: boolean;

  onLogin?: () => void;

  children?: React.ReactNode;
}

const DashboardCenteredLayout: React.FC<CenteredLayoutProps> = ({
  pageTitle = "Page Title",
  pageSubtitle,
  showLogin = false,
  onLogin,
  children,
}) => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#E9EAF2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
      }}
    >
      <Layout
        style={{
          background: "#f3f4f6",
          borderRadius: "12px",
          maxWidth: "min(1100px, 90vw)",
          width: "100%",
        }}
      >
        <div className="w-full bg-[#E9EAF2] text-[#242E3A] flex justify-between items-center px-6 py-1.5 text-sm">
          {/* Left */}
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <img
              src={logoDishub}
              alt="Logo Dishub"
              className="w-6 h-6 object-contain"
            />
            Dinas Perhubungan Kota Bandung
          </div>

          {/* Right */}
          <div className="flex gap-6">
            <div className="flex items-center gap-1">
              <ClockCircleOutlined /> 08:00 - 16:00 WIB
            </div>
            <div className="flex items-center gap-1">
              <PhoneOutlined /> (022) 87509898
            </div>
            <div className="flex items-center gap-1">
              <MailOutlined /> dishub@bandung.go.id
            </div>
          </div>
        </div>

        {/* Header */}
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#fff",
            borderRadius: "12px 12px 0 0",
            borderBottom: "1px solid #d1d5db",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px",
          }}
        >
          {/* Page Title */}
          <div className="flex flex-col flex-1 pr-4">
            <span className="text-xl font-bold mb-1">{pageTitle}</span>
            {pageSubtitle && (
              <span className="text-sm text-gray-500">{pageSubtitle}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {showLogin && (
              <Button
                type="primary"
                style={{
                  backgroundColor: "#2E3192",
                  borderColor: "#2E3192",
                }}
                onClick={onLogin}
              >
                Masuk
              </Button>
            )}
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            paddingTop: "5px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
            background: "#E9EAF2",
          }}
        >
          {children ?? <Outlet />}
        </Content>
      </Layout>
      <Footer
        style={{
          background: "#E9EAF2",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-10 px-4 md:px-6 py-6">
          {/* Kiri */}
          <div className="flex flex-col md:flex-row items-start gap-4 md:basis-2/5">
            <img
              src={logoDishub}
              alt="Logo Dishub"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Dinas Perhubungan Kota Bandung
              </h1>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed max-w-md">
                Mewujudkan Transportasi Kota Bandung yang Modern, Amanah, dan
                Berkeadaban untuk Mobilitas Nyaman dan Kehidupan Masyarakat yang
                lebih Sejahtera.
              </p>
            </div>
          </div>

          {/* Kanan */}
          <div className="md:basis-3/5 text-gray-700 text-sm space-y-2">
            <strong>Alamat</strong>
            <p className="text-md">
              Jl. Pendamping SOR GBLA, Rancabolang, Gedebage, Kota Bandung, Jawa
              Barat, 409294
            </p>

            <div className="flex flex-row flex-wrap items-center gap-8">
              <p className="flex items-center gap-2">
                <ClockCircleOutlined /> Jam Operasional: 08:00 - 16:00 WIB
              </p>
              <p className="flex items-center gap-2">
                <PhoneOutlined /> (022) 87509898
              </p>
              <p className="flex items-center gap-2">
                <MailOutlined /> dishub@bandung.go.id
              </p>
            </div>
          </div>
        </div>

        {/* Garis Pembatas */}
        <hr className="border-t border-gray-300 mx-6 md:mx-12" />

        <div className="pt-6 text-center">
          <h4 className="font-semibold text-gray-700 mb-5">
            Sosial Media Kami
          </h4>

          <div className="flex justify-center flex-wrap gap-8 text-gray-500">
            {/* Instagram */}
            <a
              href="#"
              className="flex items-center space-x-2 group"
              aria-label="Instagram"
            >
              <InstagramFilled className="text-xl text-gray-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                Instagram
              </span>
            </a>

            {/* Facebook */}
            <a
              href="#"
              className="flex items-center space-x-2 group"
              aria-label="Facebook"
            >
              <FacebookFilled className="text-xl text-gray-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                Facebook
              </span>
            </a>

            {/* TikTok */}
            <a
              href="#"
              className="flex items-center space-x-2 group"
              aria-label="TikTok"
            >
              <TikTokFilled className="text-xl text-gray-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                TikTok
              </span>
            </a>

            {/* YouTube */}
            <a
              href="#"
              className="flex items-center space-x-2 group"
              aria-label="YouTube"
            >
              <YoutubeFilled className="text-xl text-gray-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                YouTube
              </span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 Dinas Perhubungan Kota Bandung
        </div>
      </Footer>
    </Layout>
  );
};

export default DashboardCenteredLayout;
