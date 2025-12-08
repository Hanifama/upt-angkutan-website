import { Button, Layout, Input, message } from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/_shared/Sidebar";

const { Header, Content } = Layout;

interface DashboardLayoutProps {
  pageTitle?: string;
  pageSubtitle?: string;

  showExport?: boolean;
  showImport?: boolean;
  showAdd?: boolean;
  showDateFilter?: boolean;

  onAdd?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onDateFilter?: (date: string) => void;

  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  pageTitle = "Dashboard",
  pageSubtitle,
  showExport = false,
  showImport = false,
  showAdd = false,
  showDateFilter = false,
  onAdd,
  onExport,
  onImport,
  onDateFilter,
  children,
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleExportClick = () => {
    if (onExport) onExport();
    else messageApi.info("Mohon maaf, fitur sedang dikembangkan.");
  };

  const handleImportClick = () => {
    if (onImport) onImport();
    else messageApi.info("Mohon maaf, fitur sedang dikembangkan.");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#e5e7eb" }}>
      {contextHolder}
      <Sidebar />

      <Layout style={{ background: "#f3f4f6", padding: "16px 24px" }}>
        <Header
          style={{
            padding: "50px 25px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #d1d5db",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex flex-col flex-1 pr-4">
            <span className="text-xl font-bold mb-2">{pageTitle}</span>
            {pageSubtitle && (
              <span className="text-sm text-gray-500">{pageSubtitle}</span>
            )}
          </div>

          <div className="flex gap-2">
            {showDateFilter && (
              <Input
                type="date"
                style={{
                  minWidth: 250,
                  borderColor: "#000000",
                  color: "#2E3192",
                  borderRadius: 4,
                  padding: "0.375rem 0.75rem",
                }}
                onChange={(e) => onDateFilter?.(e.target.value)}
              />
            )}

            {showExport && (
              <Button
                icon={<DownloadOutlined />}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#2E3192",
                  color: "#2E3192",
                }}
                onClick={handleExportClick}
              >
                Export Data
              </Button>
            )}

            {showImport && (
              <Button
                icon={<UploadOutlined />}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#2E3192",
                  color: "#2E3192",
                }}
                onClick={handleImportClick}
              >
                Import Data
              </Button>
            )}

            {showAdd && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: "#2E3192",
                  borderColor: "#2E3192",
                  color: "#ffffff",
                }}
                onClick={onAdd}
              >
                Tambah Data
              </Button>
            )}
          </div>
        </Header>

        <Content style={{ marginTop: "10px" }}>
          {children ?? <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
