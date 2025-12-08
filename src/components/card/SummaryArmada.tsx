import React from "react";
import { Card, Spin } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ArmadaSummary } from "../../interfaces/armada";

const COLORS = ["#005B96", "#6497B1"];

interface SummaryCardProps {
  summary?: ArmadaSummary | null;
  isLoading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, isLoading }) => {
  const total = summary?.totalKeseluruhan ?? 0;
  const aktif = summary?.totalAktif ?? 0;
  const nonAktif = summary?.totalTidakAktif ?? 0;

  const pieData = [
    { name: "Aktif", value: aktif },
    { name: "Tidak Aktif", value: nonAktif },
  ];

  return (
    <Card title="Ringkasan Total Armada">
      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Spin />
        </div>
      ) : (
        <>
          <div className="w-full h-[200px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={2}
                  label={false}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-sm mt-2">
            <div className="flex justify-between">
              <span className="font-semibold">Total Armada:</span>
              <span className="font-semibold">{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#005B96" }}
                ></span>
                Armada Aktif:
              </span>
              <span>{aktif}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#6497B1" }}
                ></span>
                Armada Tidak Aktif:
              </span>
              <span>{nonAktif}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default SummaryCard;
