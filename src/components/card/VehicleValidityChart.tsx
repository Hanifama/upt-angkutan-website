import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ArmadaSummary } from "../../interfaces/armada";

interface VehicleValidityChartProps {
  summary: ArmadaSummary | null;
}

const COLORS = {
  "Surat Tanda Nomor Kendaraan": "#6497B1",
  "Uji Kelayakan Kendaraan": "#005B96",
  "Izin Kartu Pengawasan Kendaraan": "#03396C",
};

const VehicleValidityChart: React.FC<VehicleValidityChartProps> = ({
  summary,
}) => {
  const chartData =
    summary?.detailPerLayanan.map((layanan) => ({
      key: layanan.layananId ?? layanan.layananNama,
      nama: layanan.layananNama,
      stnk: layanan.totalDenganLicensePlate,
      ujiKendaraan: layanan.totalDenganKirNumber,
      izinKartu: layanan.totalDenganSipaNumber,
      icon: layanan.icon ?? undefined,
      color: layanan.color ?? "#005B96",
    })) ?? [];

  const barSize = Math.max(20, 400 / chartData.length);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const data = chartData.find((item) => item.key === payload.value);

    return (
      <g transform={`translate(${x},${y + 10})`}>
        <foreignObject
          x={-30}
          y={0}
          width={60}
          height={60}
          style={{ overflow: "visible" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "8px",
              color: "#333",
              overflow: "hidden",
            }}
          >
            {data?.icon && (
              <img
                src={data.icon}
                alt={data.nama}
                width={22}
                height={22}
                style={{ marginBottom: 2 }}
              />
            )}
            <span
              style={{
                display: "block",
                whiteSpace: "normal", // biar wrap ke bawah, bukan horizontal
                wordBreak: "break-word",
              }}
            >
              {data?.nama}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = chartData.find((item) => item.key === label);

      return (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "10px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            minWidth: "180px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            {data?.icon && (
              <img src={data.icon} alt={data.nama} width={24} height={24} />
            )}
            <span
              style={{ fontWeight: "bold", fontSize: "13px", color: "#222" }}
            >
              {data ? data.nama : label}
            </span>
          </div>

          {payload.map((item: any, index: number) => (
            <p
              key={index}
              style={{ fontSize: "12px", margin: "2px 0", color: "#333" }}
            >
              {item.name}: <strong>{item.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        height: 390,
        scrollbarWidth: "thin",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 0, bottom: 50 }}
        >
          <XAxis
            dataKey="key"
            tick={(props) => <CustomXAxisTick {...props} />}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="top"
            align="left"
            wrapperStyle={{
              top: 0,
              left: 0,
              marginBottom: 10,
              paddingLeft: 10,
              fontSize: "11px",
              lineHeight: "1.2",
            }}
            iconType="circle"
          />
          {[
            {
              key: "stnk",
              name: "Surat Tanda Nomor Kendaraan",
              color: COLORS["Surat Tanda Nomor Kendaraan"],
            },
            {
              key: "ujiKendaraan",
              name: "Uji Kelayakan Kendaraan",
              color: COLORS["Uji Kelayakan Kendaraan"],
            },
            {
              key: "izinKartu",
              name: "Izin Kartu Pengawasan Kendaraan",
              color: COLORS["Izin Kartu Pengawasan Kendaraan"],
            },
          ].map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              barSize={barSize}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VehicleValidityChart;
