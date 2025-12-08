import React, { useMemo, useState } from "react";
import { Card, Row, Col, Select, Empty, Spin } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { KinerjaTransportasiData } from "../../interfaces/kinerjaTransportasi";

const { Option } = Select;

interface PassengerStatisticsProps {
  statistik: KinerjaTransportasiData | null;
  isLoading: boolean;
}

const PassengerStatistics: React.FC<PassengerStatisticsProps> = ({
  statistik,
  isLoading,
}) => {
  const [selectedService, setSelectedService] = useState<string>("semua");

  // Update logic untuk lineData
  const lineData = useMemo(() => {
    if (!statistik || !statistik.detailPerLayanan.length) return [];

    // Ambil semua bulan yang tersedia dari breakdownBulanan pertama
    const bulanList =
      statistik.detailPerLayanan[0]?.breakdownBulanan?.map(
        (item) => item.bulan
      ) || [];

    return bulanList.map((bulan) => {
      const row: Record<string, any> = { bulan };
      statistik.detailPerLayanan.forEach((layanan) => {
        // Cari data bulan yang sesuai dari array breakdownBulanan
        const bulanData = layanan.breakdownBulanan?.find(
          (item) => item.bulan === bulan
        );
        row[layanan.namaLayanan] = bulanData?.total ?? 0;
      });
      return row;
    });
  }, [statistik]);

  // === Custom Dot dengan Icon ===
  const renderCustomDot = (icon: string) => (props: any) => {
    const { cx, cy } = props;
    return <image href={icon} x={cx - 10} y={cy - 10} width={20} height={20} />;
  };

  // === Kondisi loading dan kosong (setelah hook semua dipanggil) ===
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin tip="Memuat data penumpang..." />
      </div>
    );
  }

  if (!statistik) {
    return <Empty description="Data penumpang belum tersedia" />;
  }

  const pieData = [
    {
      name: "Penumpang Harian",
      value: statistik.totalPenumpangHarian ?? 0,
      color: "#005B96",
    },
    {
      name: "Penumpang Bulanan",
      value: statistik.totalPenumpangBulanan ?? 0,
      color: "#6497B1",
    },
    {
      name: "Penumpang Tahunan",
      value: statistik.totalPenumpangTahunan ?? 0,
      color: "#B3CDE0",
    },
  ];

  const totalPie = pieData.reduce((acc, cur) => acc + cur.value, 0);
  const rataRataPenumpang = Math.round(totalPie / pieData.length);

  const filteredLayanan =
    selectedService === "semua"
      ? statistik.detailPerLayanan
      : statistik.detailPerLayanan.filter(
          (l) => l.namaLayanan === selectedService
        );

  return (
    <Row gutter={[16, 16]}>
      {/* KIRI: Pie Chart */}
      <Col xs={24} md={8}>
        <Card title={`Penumpang Tahun ${statistik.tahun}`}>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={3}
                >
                  {pieData.map((item, i) => (
                    <Cell key={i} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-sm">
            <div className="flex justify-between font-semibold mb-2">
              <span>Rata-rata Penumpang</span>
              <span className="text-blue-700">
                {rataRataPenumpang.toLocaleString()}
              </span>
            </div>

            <ul className="space-y-1">
              {pieData.map((item, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    {item.name}
                  </span>
                  <span>{(item.value ?? 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Col>

      {/* KANAN: Line Chart */}
      <Col xs={24} md={16}>
        <Card title="Grafik Total Penumpang per Bulan">
          <div className="mb-4 w-full">
            <Select
              value={selectedService}
              style={{ width: "100%" }}
              onChange={(val) => setSelectedService(val)}
            >
              <Option value="semua">Semua Layanan</Option>
              {statistik.detailPerLayanan.map((item) => (
                <Option key={item.layananId} value={item.namaLayanan}>
                  {item.namaLayanan}
                </Option>
              ))}
            </Select>
          </div>

          {/* Icon Grid Legend */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {filteredLayanan.map((item) => (
              <div
                key={item.layananId}
                className="flex items-center justify-start gap-2 h-8"
              >
                <img
                  src={item.icon}
                  alt={item.namaLayanan}
                  className="w-5 h-5"
                />
                <span
                  className="text-xs font-medium leading-none"
                  style={{ color: item.color }}
                >
                  {item.namaLayanan}
                </span>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                {filteredLayanan.map((item) => (
                  <Line
                    key={item.layananId}
                    type="monotone"
                    dataKey={item.namaLayanan}
                    stroke={item.color}
                    strokeWidth={2}
                    dot={renderCustomDot(item.icon)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default PassengerStatistics;
