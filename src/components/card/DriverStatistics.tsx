import React from "react";
import { Card, Row, Col, Spin } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DriverStatisticsSummary } from "../../interfaces/driver";

interface ExampleDriverStatisticsProps {
  statistics: DriverStatisticsSummary | null;
  isLoading: boolean;
}

interface DriverStatisticsProps {
  title: string;
  totalLabel: string;
  totalValue: number;
  data: { name: string; value: number; color: string }[];
}

const DriverStatistics: React.FC<DriverStatisticsProps> = ({
  title,
  totalLabel,
  totalValue,
  data,
}) => {
  return (
    <Card title={title}>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={3}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            {/* <Legend /> */}
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center space-y-1 text-sm">
        <p className="font-semibold">{totalLabel}</p>
        <p className="text-lg font-bold">{totalValue}</p>
        <ul className="mt-2 space-y-1">
          {data.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </span>
              <span className="font-medium">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export const ExampleDriverStatistics: React.FC<
  ExampleDriverStatisticsProps
> = ({ statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!statistics) {
    return <p>Data pengemudi tidak tersedia</p>;
  }

  const usiaData = [
    {
      name: "Rentang 17-30 Tahun",
      value: statistics.statistikUsia.rentang_17_30,
      color: "#005B96",
    },
    {
      name: "Rentang 31-40 Tahun",
      value: statistics.statistikUsia.rentang_31_40,
      color: "#6497B1",
    },
    {
      name: "Lebih dari 40 Tahun",
      value: statistics.statistikUsia.lebih_dari_40,
      color: "#03396C",
    },
    {
      name: "Tidak Tercatat",
      value: statistics.statistikUsia.tidak_tercatat,
      color: "#FF7F50",
    },
  ];

  const simData = [
    {
      name: "Memiliki SIM",
      value: statistics.statistikSim.memilikiSim,
      color: "#005B96",
    },
    {
      name: "Tidak Memiliki SIM",
      value: statistics.statistikSim.tidakMemilikiSim,
      color: "#6497B1",
    },
    {
      name: "SIM Expired",
      value: statistics.statistikSim.simExpired,
      color: "#03396C",
    },
  ];

  const sertifikatData = [
    {
      name: "Memiliki Sertifikat",
      value: statistics.statistikSertifikat.memilikiSertifikat,
      color: "#005B96",
    },
    {
      name: "Tidak Memiliki Sertifikat",
      value: statistics.statistikSertifikat.tidakMemilikiSertifikat,
      color: "#6497B1",
    },
    {
      name: "Sertifikat Expired",
      value: statistics.statistikSertifikat.sertifikatExpired,
      color: "#03396C",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <DriverStatistics
          title="Usia Pengemudi"
          totalLabel="Total Pengemudi"
          totalValue={statistics.totalPengemudi}
          data={usiaData}
        />
      </Col>

      <Col xs={24} md={8}>
        <DriverStatistics
          title="Surat Izin Mengemudi (SIM)"
          totalLabel="Total Pengemudi"
          totalValue={statistics.totalPengemudi}
          data={simData}
        />
      </Col>

      <Col xs={24} md={8}>
        <DriverStatistics
          title="Sertifikat Pengemudi"
          totalLabel="Total Pengemudi"
          totalValue={statistics.totalPengemudi}
          data={sertifikatData}
        />
      </Col>
    </Row>
  );
};
