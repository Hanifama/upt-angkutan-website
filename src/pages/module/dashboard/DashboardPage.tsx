import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, DatePicker, Select } from "antd";
import {
  AimOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  IdcardOutlined,
  TeamOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import SummaryCard from "../../../components/card/SummaryArmada";
import ServiceCard from "../../../components/card/ServiceCard";
import VehicleValidityChart from "../../../components/card/VehicleValidityChart";
import RuteCard from "../../../components/card/RuteCard";
import { ExampleDriverStatistics } from "../../../components/card/DriverStatistics";
import PassengerStatistics from "../../../components/card/PassengerStatistics";
import KinerjaTransportasi from "../../../components/card/KinerjaTransportasi";

import dayjs from "dayjs";

const { Option } = Select;

import { useArmadaStore } from "../../../store/useArmadaStore";
import { useDriverStore } from "../../../store/useDriverStore";
import { useRouteStore } from "../../../store/useRoutesStore";
import { useLayananStore } from "../../../store/useLayananStore";
import { useKinerjaTransportasiStore } from "../../../store/useKinerjaTransportasi";

const DashboardPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const {
    summary,
    fetchArmadaSummary,
    isLoading: isLoadingArmada,
  } = useArmadaStore();

  const {
    statistics: driverStatistics,
    fetchDriverStatistics,
    isLoading: isLoadingDriver,
  } = useDriverStore();

  const {
    routes,
    statistics: routeStatistics,
    fetchRoutes,
    fetchRouteStatisticsSummary,
    isLoading: isLoadingRoute,
  } = useRouteStore();

  const { layanan, fetchLayanan } = useLayananStore();

  const {
    statistik,
    fetchStatistikPenumpang,
    statistikRataRata,
    fetchStatistikRataRata,
    isLoading: isLoadingKinerja,
    isLoadingRataRata,
  } = useKinerjaTransportasiStore();

  useEffect(() => {
    const tahunSekarang = new Date().getFullYear();

    fetchArmadaSummary();
    fetchDriverStatistics();
    fetchRoutes();
    fetchRouteStatisticsSummary();
    fetchLayanan();
    fetchStatistikPenumpang(tahunSekarang);
    fetchStatistikRataRata(tahunSekarang);
  }, [
    fetchArmadaSummary,
    fetchDriverStatistics,
    fetchRouteStatisticsSummary,
    fetchLayanan,
    fetchRoutes,
    fetchStatistikPenumpang,
    fetchStatistikRataRata,
  ]);

  // fungsi card penumpang angkutan umum
  const handleYearChange = (date: any) => {
    if (date) {
      setSelectedYear(date.year());
    } else {
      setSelectedYear(new Date().getFullYear());
    }
  };

  //fungsi card kinerja transportasi
  const [selectedLayanan, setSelectedLayanan] = useState<string>("ALL");

  return (
    <div>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TruckOutlined style={{ fontSize: 20, color: "#005B96" }} />
            <span style={{ fontWeight: 600, fontSize: "16px" }}>
              Armada Angkutan Umum
            </span>
          </div>
        }
        style={{ marginBottom: 20 }}
        data-export-card="main"
      >
        <Row
          gutter={24}
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <Col span={6}>
            <SummaryCard summary={summary} isLoading={isLoadingArmada} />
          </Col>
          <Col span={18}>
            <Card title="Total Armada per-Layanan" style={{ height: "100%" }}>
              <Row gutter={[16, 16]}>
                {summary?.detailPerLayanan.map((layanan, idx) => {
                  // console.log("DEBUG layanan:", layanan);
                  return (
                    <Col span={12} key={layanan.layananId ?? idx}>
                      <ServiceCard
                        nama={layanan.layananNama}
                        aktif={layanan.totalAktif}
                        total={layanan.totalAktif + layanan.totalTidakAktif}
                        color={layanan.color ?? "#005B96"}
                        icon={layanan.icon ?? undefined}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>
        <Card title="Masa berlaku dokumen kendaraan per-layanan">
          <VehicleValidityChart summary={summary} />
        </Card>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AimOutlined style={{ fontSize: 20, color: "#005B96" }} />
            <span style={{ fontWeight: 600, fontSize: "16px" }}>
              Rute / Jalur Terdaftar
            </span>
          </div>
        }
        style={{ marginBottom: 20 }}
        data-export-card="main"
      >
        <RuteCard
          data={routes}
          layanan={layanan}
          statistics={routeStatistics}
          isLoading={isLoadingRoute}
        />
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <IdcardOutlined style={{ fontSize: 20, color: "#005B96" }} />
            <span className="font-semibold">Pengemudi Terdaftar</span>
          </div>
        }
        style={{ marginBottom: 20 }}
        className="export-card"
        data-export-card="main"
      >
        <ExampleDriverStatistics
          statistics={driverStatistics}
          isLoading={isLoadingDriver}
        />
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined style={{ fontSize: 20, color: "#005B96" }} />
            <span className="font-semibold">Penumpang Angkutan Umum</span>
          </div>
        }
        extra={
          <div className="flex items-center gap-2">
            <DatePicker
              picker="year"
              placeholder="Pilih Tahun"
              value={dayjs(selectedYear?.toString(), "YYYY")}
              onChange={handleYearChange}
              className="rounded-lg"
            />
            <Button
              type="default"
              icon={<ArrowRightOutlined className="text-black" />}
              className="rounded-full bg-gray-200 p-2 flex items-center justify-center"
              onClick={() => fetchStatistikPenumpang(selectedYear)}
            />
          </div>
        }
        style={{ marginBottom: 20 }}
        className="export-card"
        data-export-card="main"
      >
        <PassengerStatistics
          statistik={statistik}
          isLoading={isLoadingKinerja}
        />
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <BarChartOutlined style={{ fontSize: 20, color: "#005B96" }} />
            <span className="font-semibold">Kinerja Transportasi</span>
          </div>
        }
        extra={
          <div>
            {/* Filter Layanan */}
            <Select
              value={selectedLayanan}
              onChange={setSelectedLayanan}
              style={{ width: 220 }}
              virtual={false}
            >
              <Option key="ALL" value="ALL">
                Semua Layanan
              </Option>
              {layanan?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.nama}
                </Option>
              ))}
            </Select>

            <DatePicker
              picker="year"
              placeholder="Pilih Tahun"
              value={dayjs(selectedYear?.toString(), "YYYY")}
              onChange={handleYearChange}
              className="rounded-lg"
            />
            <Button
              type="default"
              icon={<ArrowRightOutlined className="text-black" />}
              className="rounded-full bg-gray-200 p-2 flex items-center justify-center"
              onClick={() => fetchStatistikRataRata(selectedYear)}
            />
          </div>
        }
        style={{ marginBottom: 20 }}
        data-export-card="main"
      >
        <KinerjaTransportasi
          statistik={statistikRataRata}
          isLoading={isLoadingRataRata}
          selectedLayanan={selectedLayanan}
          selectedYear={selectedYear}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
