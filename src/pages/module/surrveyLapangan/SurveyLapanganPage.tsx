import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Radio, Button, Spin } from "antd";
import AnalisaKinerjaTable from "./table/CustomTableAnalisisKinerja";
import RiwayatSurveyDinamisTable from "./table/CustomTableSurveyDinamasis";
import CustomTableSurveyStatis from "./table/CustomTableSurveyStatis";
import { PlusOutlined } from "@ant-design/icons";
import { useSurveyLapanganStore } from "../../../store/useSurveyLapangan";
import { useKinerjaTransportasiStore } from "../../../store/useKinerjaTransportasi";

interface Props {
  activeTab: "analisis" | "dinamis" | "statis";
  onTabChange: (tab: "analisis" | "dinamis" | "statis") => void;
}

const SurveyLapanganPage: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { fetchSurveyLapangan, isLoading, clearError, setFilterJenis } =
    useSurveyLapanganStore();

  const { fetchKinerjaList, setFilterLayanan } = useKinerjaTransportasiStore();

  useEffect(() => {
    clearError();

    if (activeTab === "analisis") {
      setFilterLayanan("Semua Layanan");
      fetchKinerjaList();
    } else if (activeTab === "dinamis") {
      fetchSurveyLapangan("DINAMIS");
      setFilterJenis("DINAMIS");
    } else if (activeTab === "statis") {
      fetchSurveyLapangan("STATIS");
      setFilterJenis("STATIS");
    }
  }, [
    activeTab,
    fetchSurveyLapangan,
    fetchKinerjaList,
    clearError,
    setFilterLayanan,
    setFilterJenis,
  ]);

  const tabs = [
    { key: "analisis", label: "Tabel Analisis Kinerja" },
    { key: "dinamis", label: "Tabel Riwayat Survey Dinamis" },
    { key: "statis", label: "Tabel Riwayat Survey Statis" },
  ];

  return (
    <Card
      title="Informasi Survey Lapangan"
      extra={
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate("/dashboard/survey-lapangan/tambah/survey-dinamis")
            }
            style={{
              backgroundColor: "#2E3192",
              borderColor: "#2E3192",
              color: "#FFFFFF",
            }}
          >
            Survey Dinamis
          </Button>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate("/dashboard/survey-lapangan/tambah/survey-statis")
            }
            style={{
              borderColor: "#2E3192",
              color: "#2E3192",
              backgroundColor: "transparent",
            }}
          >
            Survey Statis
          </Button>
        </div>
      }
    >
      <Radio.Group
        value={activeTab}
        onChange={(e) => onTabChange(e.target.value)}
        style={{ marginBottom: 25 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const [isHover, setIsHover] = React.useState(false);

          return (
            <Radio.Button
              key={tab.key}
              value={tab.key}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              style={{
                borderRadius: 0,
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                boxShadow: "none",
                backgroundColor: "transparent",
                padding: "0.5rem 1rem 2rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive || isHover ? "#2E3192" : "#6B7280",
                borderBottom: isActive
                  ? "2px solid #2E3192"
                  : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </Radio.Button>
          );
        })}
      </Radio.Group>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {activeTab === "analisis" && <AnalisaKinerjaTable />}
          {activeTab === "dinamis" && <RiwayatSurveyDinamisTable />}
          {activeTab === "statis" && <CustomTableSurveyStatis />}
        </>
      )}
    </Card>
  );
};

export default SurveyLapanganPage;
