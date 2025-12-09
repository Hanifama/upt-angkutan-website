import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CarOutlined,
  IdcardOutlined,
  UserOutlined,
  LinkOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import LogoSidebar from "../../assets/LogoSidebar.svg";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");

  // Semua menu yang tersedia
  const allMenuItems = [
    {
      key: "/dashboard/home",
      icon: <AppstoreOutlined style={{ fontSize: "20px" }} />,
      label: "Dashboard",
      roles: ["admin-upt", "koperasi"], // bisa diakses oleh kedua role
    },
    {
      key: "/dashboard/survey-lapangan",
      icon: <BarChartOutlined style={{ fontSize: "20px" }} />,
      label: "Survey Lapangan",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/rute",
      icon: <EnvironmentOutlined style={{ fontSize: "20px" }} />,
      label: "Rute",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/halte",
      icon: <ShopOutlined style={{ fontSize: "20px" }} />,
      label: "Halte",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/armada",
      icon: <CarOutlined style={{ fontSize: "20px" }} />,
      label: "Armada",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/pengemudi",
      icon: <IdcardOutlined style={{ fontSize: "20px" }} />,
      label: "Pengemudi",
      roles: ["admin-upt", "koperasi"], // kedua role boleh
    },
    {
      key: "/dashboard/link",
      icon: <LinkOutlined style={{ fontSize: "20px" }} />,
      label: "Link Informasi",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/keluhan",
      icon: <MessageOutlined style={{ fontSize: "20px" }} />,
      label: "Keluhan Pengguna",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/management-user",
      icon: <UserOutlined style={{ fontSize: "20px" }} />,
      label: "Management User",
      roles: ["admin-upt"], // hanya admin UPT
    },
    {
      key: "/dashboard/profile",
      icon: <UserOutlined style={{ fontSize: "20px" }} />,
      label: "Profile",
      roles: ["admin-upt", "koperasi"], // kedua role boleh
    },
  ];

  // Filter menu berdasarkan role yang sedang login
  const filteredMenu = useMemo(() => {
    // kalau belum login, jangan tampilkan apa-apa
    if (!userRole) return [];

    // kalau admin-upt -> semua menu
    if (userRole === "admin-upt") return allMenuItems;

    // kalau koperasi -> hanya menu yang punya role itu
    return allMenuItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  const getSelectedKey = () => {
    const path = location.pathname;
    const matched = allMenuItems.find((item) => path.startsWith(item.key));
    return matched ? matched.key : "";
  };

  return (
    <Sider
      width={240}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 10,
        background: "#ffffff",
        borderRight: "1px solid #E9EAF2",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center py-6 px-8">
        <img src={LogoSidebar} alt="Logo Dishub" className="h-11" />
      </div>

      {/* Garis di tengah */}
      <div className="h-[1px] bg-gray-200 mb-4 w-6/7 mx-auto rounded-full" />

      {/* Menu */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        onClick={({ key }) => navigate(key)}
        items={filteredMenu}
        style={{
          backgroundColor: "#ffffff",
          borderRight: "none",
        }}
        className="custom-sidebar-menu"
      />
    </Sider>
  );
};

export default Sidebar;
