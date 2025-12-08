import React, { useState } from "react";
import { Card, Col, Row, Radio } from "antd";
import CustomTable from "../../../components/table/CustomTableDashboard";

interface DashboardCard {
  value: number | string;
  title: string;
  subInfo?: string[];
}

// Data cards per category
const dashboardCards: Record<string, DashboardCard[]> = {
  Armada: [
    {
      value: 32,
      title: "Total Armada Trans Metro Bandung",
      subInfo: ["Armada Aktif: 25", "Armada Non Aktif: 7"],
    },
    {
      value: 28,
      title: "Armada Lainnya",
      subInfo: ["Armada Aktif: 20", "Armada Non Aktif: 8"],
    },
    {
      value: 15,
      title: "Armada Pendukung",
      subInfo: ["Armada Aktif: 10", "Armada Non Aktif: 5"],
    },
  ],
  "Rute/Jalur": [
    {
      value: 9,
      title: "Total Rute Trans Metro Bandung",
      subInfo: ["Armada Aktif: 7", "Armada Non Aktif: 2"],
    },
    {
      value: 6,
      title: "Rute Tambahan",
      subInfo: ["Armada Aktif: 5", "Armada Non Aktif: 1"],
    },
    {
      value: 3,
      title: "Rute Pendukung",
      subInfo: ["Armada Aktif: 2", "Armada Non Aktif: 1"],
    },
  ],
  Pengemudi: [
    {
      value: 52,
      title: "Total Pengemudi Trans Metro Bandung",
      subInfo: ["Aktif: 48", "Non Aktif: 4"],
    },
    {
      value: 40,
      title: "Pengemudi Shift Pagi",
      subInfo: ["Aktif: 38", "Non Aktif: 2"],
    },
    {
      value: 12,
      title: "Pengemudi Shift Malam",
      subInfo: ["Aktif: 10", "Non Aktif: 2"],
    },
  ],
  Penumpang: [
    {
      value: 52000,
      title: "Penumpang Per Bulan Trans Metro Bandung",
      subInfo: ["Rata-rata per Hari: 3340"],
    },
    {
      value: 34000,
      title: "Penumpang Bulan Lalu",
      subInfo: ["Rata-rata per Hari: 1133"],
    },
    {
      value: 6000,
      title: "Penumpang Khusus",
      subInfo: ["Rata-rata per Hari: 200"],
    },
  ],
};

const performanceCards = [
  { value: "5 menit", title: "Headway", subInfo: ["Standar: 5 Menit"] },
  { value: "4 menit", title: "Lay Over Time", subInfo: ["Standar: 5 Menit"] },
  {
    value: "90%",
    title: "Kapasitas",
    subInfo: ["Standar : 85%"],
  },
  {
    value: "90 Menit",
    title: "Time Travel",
    subInfo: ["Standar: 90 Menit"],
  },
  { value: "40Km/Jam", title: "Kecepatan", subInfo: ["Standar: 30Km/Jam"] },
  {
    value: "31%",
    title: "Load Factor",
    subInfo: ["Standar: 85%"],
  },
  { value: "5", title: "Penumpang/KM", subInfo: ["Standar: 7"] },
];

const DashboardPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("Armada");

  return (
    <div>
      {/* Kotak pertama: Statistik Layanan */}
      <Card
        title="Statistik Layanan Per-Bulan September"
        styles={{ body: { padding: "10px 10px 40px 24px" } }}
        style={{ marginBottom: 20 }}
      >
        <Radio.Group
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mb-2 flex space-x-4"
        >
          {["Armada", "Rute/Jalur", "Pengemudi", "Penumpang"].map((item) => {
            const isActive = selectedCategory === item;
            return (
              <Radio.Button
                key={item}
                value={item}
                style={{
                  borderRadius: 0,
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  padding: "0.5rem 1rem 2rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#000000" : "#9CA3AF",
                  borderBottom: isActive
                    ? "2px solid #2E3192"
                    : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {item}
              </Radio.Button>
            );
          })}
        </Radio.Group>

        {/* Cards */}
        <Row gutter={16} style={{ marginTop: "30px" }}>
          {dashboardCards[selectedCategory].map((card) => (
            <Col span={8} key={card.title}>
              <Card>
                {/* Value */}
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "#2E3192" }}
                >
                  {card.value}
                </h2>
                {/* Title */}
                <p className="font-semibold mb-1" style={{ color: "#000000" }}>
                  {card.title}
                </p>
                {/* Sub Info */}
                {card.subInfo?.map((info, idx) => (
                  <p key={idx} className="text-gray-500 text-sm">
                    {info}
                  </p>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Kotak kedua: Tabel */}
      <Card title="Informasi Kinerja Transportasi Per-Bulan September">
        {/* Cards */}
        <div className="flex gap-4 overflow-x-auto mb-6 hide-scrollbar">
          {performanceCards.map((card, idx) => (
            <Card key={idx} style={{ flex: "0 0 13%", minWidth: 200 }}>
              {/* Value */}
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "#2E3192" }}
              >
                {card.value}
              </h2>
              {/* Title */}
              <p className="font-semibold mb-1" style={{ color: "#000000" }}>
                {card.title}
              </p>
              {/* Sub Info */}
              {card.subInfo?.map((info, i) => (
                <p key={i} className="text-gray-500 text-sm">
                  {info}
                </p>
              ))}
            </Card>
          ))}
        </div>

        {/* Tabel User List */}
        <CustomTable />
      </Card>
    </div>
  );
};

export default DashboardPage;
