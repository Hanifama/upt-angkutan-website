import { Button } from "antd";
import { FrownOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
      {/* Ikon besar */}
      <FrownOutlined className="text-blue-500 text-8xl mb-6" />

      {/* Judul */}
      <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-8">
        Maaf, halaman yang Anda cari tidak ditemukan.
      </p>

      {/* Tombol */}
      <div className="flex gap-3">
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          className="!rounded-lg !px-6 !py-2"
          onClick={() => navigate(-1)}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
};

export default Dashboard404;
