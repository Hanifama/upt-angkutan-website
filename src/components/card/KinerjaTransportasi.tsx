import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Empty,
  Spin,
  Button,
  message,
  DatePicker,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CameraOutlined } from "@ant-design/icons";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import type { KinerjaTransportasiAverageItem } from "../../interfaces/kinerjaTransportasiAvarage";
import dayjs from "dayjs";
import { useKinerjaTransportasiStore } from "../../store/useKinerjaTransportasi";

const { Option } = Select;

interface KinerjaTransportasiProps {
  statistik: KinerjaTransportasiAverageItem[] | null;
  isLoading: boolean;
  selectedLayanan: string;
  selectedYear: number;
}

const KinerjaTransportasi: React.FC<KinerjaTransportasiProps> = ({
  statistik,
  isLoading,
  selectedLayanan,
  selectedYear,
}) => {
  const [selectedRute, setSelectedRute] = useState<string>("ALL");
  const [selectedTahun, setSelectedTahun] = useState<dayjs.Dayjs>(
    dayjs(selectedYear.toString(), "YYYY")
  );
  const [isExporting, setIsExporting] = useState(false);

  // Gunakan store
  const { fetchStatistikRataRata } = useKinerjaTransportasiStore();

  // Ref untuk capture seluruh component
  const exportRef = useRef<HTMLDivElement>(null);

  // Reset selectedRute ketika selectedLayanan berubah
  useEffect(() => {
    setSelectedRute("ALL");
  }, [selectedLayanan]);

  // Update selectedTahun ketika selectedYear dari parent berubah
  useEffect(() => {
    setSelectedTahun(dayjs(selectedYear.toString(), "YYYY"));
  }, [selectedYear]);

  // Handle perubahan tahun - fetch data baru dari store
  const handleTahunChange = async (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedTahun(date);
      const tahun = date.year();

      try {
        // Fetch data statistik rata-rata berdasarkan tahun yang dipilih
        await fetchStatistikRataRata(tahun);
        message.success(`Data untuk tahun ${tahun} berhasil dimuat`);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Gagal memuat data untuk tahun yang dipilih");
      }
    }
  };

  // Dapatkan daftar layanan dari data API
  const layananList = statistik || [];

  // === FUNGSI EXPORT TO PDF ===
  const exportToPDF = async () => {
    if (!exportRef.current) {
      message.error("Component tidak ditemukan untuk di-export");
      return;
    }

    setIsExporting(true);
    message.loading({
      content: "Menyiapkan laporan PDF...",
      key: "pdf",
      duration: 0,
    });

    try {
      // Tunggu sebentar untuk memastikan semua chart ter-render
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Capture dengan konfigurasi yang lebih baik
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        backgroundColor: "#ffffff",
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        skipAutoScale: false,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        filter: () => true,
      });

      // Buat PDF dengan orientation landscape
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // === HEADER ===
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("LAPORAN KINERJA TRANSPORTASI", pageWidth / 2, 15, {
        align: "center",
      });

      // === INFORMASI FILTER ===
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      let infoY = 25;
      const leftColumnX = 20;
      const rightColumnX = pageWidth / 2 + 10;

      // Informasi filter - KOLOM KIRI
      pdf.text(
        `Tanggal Export: ${new Date().toLocaleString("id-ID")}`,
        leftColumnX,
        infoY
      );
      infoY += 4;

      pdf.text(
        `Layanan: ${
          selectedLayanan === "ALL"
            ? "Semua Layanan"
            : statistik?.find((l) => l.layananId === selectedLayanan)
                ?.namaLayanan || selectedLayanan
        }`,
        leftColumnX,
        infoY
      );
      infoY += 4;

      if (selectedRute !== "ALL") {
        pdf.text(`Rute: ${selectedRute}`, leftColumnX, infoY);
        infoY += 4;
      }

      pdf.text(`Tahun: ${selectedTahun.year()}`, leftColumnX, infoY);
      infoY += 4;

      // Informasi statistik umum - KOLOM KANAN
      let rightY = 25;
      const totalLayanan = statistik?.length || 0;

      pdf.text(`Total Layanan: ${totalLayanan}`, rightColumnX, rightY);
      rightY += 4;

      // === GAMBAR CHART ===
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Hitung aspect ratio
      const imgAspectRatio = 1.6;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth / imgAspectRatio;

      // Pastikan tidak melebihi tinggi page
      const maxImgHeight = pageHeight - infoY - 20;
      const finalImgHeight = Math.min(imgHeight, maxImgHeight);
      const finalImgWidth = finalImgHeight * imgAspectRatio;

      // Center the image
      const imgX = (pageWidth - finalImgWidth) / 2;
      const imgY = infoY + 5;

      // Add image
      pdf.addImage(dataUrl, "PNG", imgX, imgY, finalImgWidth, finalImgHeight);

      // === FOOTER ===
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Dibuat oleh Sistem UPT MANAJEMEN ANGKUTAN - Halaman 1/1 - ${new Date().getFullYear()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Simpan PDF
      const timestamp = new Date()
        .toLocaleString("id-ID")
        .replace(/[/:\\]/g, "-");
      pdf.save(`laporan-kinerja-${timestamp}.pdf`);

      message.success({ content: "PDF berhasil diunduh!", key: "pdf" });
    } catch (error) {
      console.error("Error creating PDF:", error);
      message.error({ content: "Gagal membuat PDF", key: "pdf" });
    } finally {
      setIsExporting(false);
    }
  };

  // Fungsi untuk mendapatkan data yang difilter berdasarkan selectedLayanan
  const getFilteredData = () => {
    if (selectedLayanan === "ALL") {
      return layananList;
    }

    const filtered = layananList.find(
      (layanan) => layanan.layananId === selectedLayanan
    );

    return filtered ? [filtered] : [];
  };

  const filteredLayanan = getFilteredData();

  // Dapatkan daftar rute berdasarkan layanan yang dipilih
  const getRuteList = () => {
    if (selectedLayanan === "ALL") {
      return [{ key: "ALL", label: "Semua Rute" }];
    }

    const layanan = filteredLayanan[0];
    if (!layanan) return [{ key: "ALL", label: "Semua Rute" }];

    const ruteOptions = layanan.rute.map((rute) => ({
      key: rute.nama,
      label: rute.nama,
    }));

    return [{ key: "ALL", label: "Semua Rute" }, ...ruteOptions];
  };

  const ruteList = getRuteList();

  // Fungsi untuk mendapatkan data statistik statis berdasarkan rute
  const getStatistikStatis = () => {
    if (selectedLayanan === "ALL") {
      const firstLayanan = layananList[0];
      return firstLayanan?.statistikStatis || [];
    } else {
      const layanan = filteredLayanan[0];
      if (!layanan) return [];

      if (selectedRute === "ALL") {
        return layanan.statistikStatis;
      } else {
        const rute = layanan.rute.find((r) => r.nama === selectedRute);
        if (!rute) return layanan.statistikStatis;

        return [
          {
            key: "headway",
            label: "Headway",
            value: `${rute.headway} Menit`,
            standar:
              layanan.statistikStatis.find((s) => s.key === "headway")
                ?.standar || "10 Menit",
          },
          {
            key: "layOverTime",
            label: "Lay Over Time",
            value: `${rute.layOverTime} Menit`,
            standar:
              layanan.statistikStatis.find((s) => s.key === "layOverTime")
                ?.standar || "5 Menit",
          },
          {
            key: "travelTime",
            label: "Travel Time",
            value: `${rute.travelTime} Menit`,
            standar:
              layanan.statistikStatis.find((s) => s.key === "travelTime")
                ?.standar || "35 Menit",
          },
          {
            key: "loadFactor",
            label: "Load Factor",
            value: `${rute.loadFactor.rataRata}%`,
            standar:
              layanan.statistikStatis.find((s) => s.key === "loadFactor")
                ?.standar || "60%",
          },
        ];
      }
    }
  };

  // Fungsi untuk mendapatkan data statistik dinamis berdasarkan rute
  const getStatistikDinamis = () => {
    if (selectedLayanan === "ALL") {
      const firstLayanan = layananList[0];
      return firstLayanan?.statistikDinamis || [];
    } else {
      const layanan = filteredLayanan[0];
      if (!layanan) return [];

      if (selectedRute === "ALL") {
        return layanan.statistikDinamis;
      } else {
        const rute = layanan.rute.find((r) => r.nama === selectedRute);
        if (!rute) return layanan.statistikDinamis;

        const jarakTempuh =
          layanan.statistikDinamis.find((s) => s.key === "jarakTempuh")
            ?.value || "0 Km";
        const kecepatan =
          layanan.statistikDinamis.find((s) => s.key === "kecepatan")?.value ||
          "0 Km/Jam";

        const penumpangPerKmValue = Math.round(
          rute.penumpang.rataRata / (parseInt(jarakTempuh) || 1)
        );

        return [
          {
            key: "jarakTempuh",
            label: "Jarak Tempuh",
            value: jarakTempuh,
            standar:
              layanan.statistikDinamis.find((s) => s.key === "jarakTempuh")
                ?.standar || "15 Km",
          },
          {
            key: "kecepatan",
            label: "Kecepatan",
            value: kecepatan,
            standar:
              layanan.statistikDinamis.find((s) => s.key === "kecepatan")
                ?.standar || "20 Km/Jam",
          },
          {
            key: "penumpangPerKm",
            label: "Penumpang/Km",
            value: `${penumpangPerKmValue} Penumpang/Km`,
            standar:
              layanan.statistikDinamis.find((s) => s.key === "penumpangPerKm")
                ?.standar || "3 Penumpang/Km",
          },
        ];
      }
    }
  };

  const statistikStatis = getStatistikStatis();
  const statistikDinamis = getStatistikDinamis();

  // Title prefix dengan informasi rute
  const statisPrefix =
    selectedLayanan === "ALL"
      ? "Data statis rata-rata"
      : selectedRute === "ALL"
      ? `Data statis rata-rata ${
          filteredLayanan[0]?.namaLayanan || selectedLayanan
        }`
      : `Data statis rute ${selectedRute} - ${
          filteredLayanan[0]?.namaLayanan || selectedLayanan
        }`;

  const dinamisPrefix =
    selectedLayanan === "ALL"
      ? "Data dinamis rata-rata"
      : selectedRute === "ALL"
      ? `Data dinamis rata-rata ${
          filteredLayanan[0]?.namaLayanan || selectedLayanan
        }`
      : `Data dinamis rute ${selectedRute} - ${
          filteredLayanan[0]?.namaLayanan || selectedLayanan
        }`;

  // Fungsi helper untuk title card
  const getCardTitle = (baseTitle: string) => {
    if (!selectedLayanan) return baseTitle;

    if (selectedRute === "ALL" || !selectedRute) {
      return `${baseTitle} (Tahun ${selectedTahun.year()})`;
    }

    if (selectedTahun) {
      return `${baseTitle} (${selectedTahun.year()})`;
    }

    return `${baseTitle} (Tahun ${selectedTahun})`;
  };

  // Custom XAxis Tick Component
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const ruteName = payload.value;

    const getTextWidth = (text: string) => {
      const avgCharWidth = 6;
      return text.length * avgCharWidth;
    };

    const calculateWidth = (text: string) => {
      const baseWidth = 80;
      const textWidth = getTextWidth(text);
      return Math.max(baseWidth, Math.min(textWidth + 20, 150));
    };

    const calculateHeight = (text: string) => {
      const textWidth = getTextWidth(text);
      return textWidth > 100 ? 70 : 50;
    };

    if (selectedLayanan === "ALL") {
      const layanan = layananList.find(
        (layanan) => layanan.namaLayanan === ruteName
      );
      const displayName = layanan?.namaLayanan || ruteName;
      const icon = layanan?.icon;

      const containerWidth = calculateWidth(displayName);
      const containerHeight = calculateHeight(displayName);

      return (
        <g transform={`translate(${x},${y})`}>
          <foreignObject
            x={-containerWidth / 2}
            y={0}
            width={containerWidth}
            height={containerHeight}
            style={{ overflow: "visible" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "2px",
                textAlign: "center",
                height: "100%",
                padding: "2px",
              }}
            >
              {icon && (
                <img
                  src={icon}
                  alt={displayName}
                  width={16}
                  height={16}
                  style={{
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "9px",
                  color: "#333",
                  lineHeight: "1.1",
                  fontWeight: "500",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  maxWidth: "100%",
                }}
                title={displayName}
              >
                {displayName}
              </span>
            </div>
          </foreignObject>
        </g>
      );
    } else {
      const layanan = filteredLayanan[0];
      const icon = layanan?.icon;

      const containerWidth = calculateWidth(ruteName);
      const containerHeight = calculateHeight(ruteName);

      return (
        <g transform={`translate(${x},${y})`}>
          <foreignObject
            x={-containerWidth / 2}
            y={0}
            width={containerWidth}
            height={containerHeight}
            style={{ overflow: "visible" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "2px",
                textAlign: "center",
                height: "100%",
                padding: "2px",
              }}
            >
              {icon && (
                <img
                  src={icon}
                  alt={layanan?.namaLayanan}
                  width={16}
                  height={16}
                  style={{
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "8px",
                  color: "#333",
                  lineHeight: "1.1",
                  fontWeight: "500",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  maxWidth: "100%",
                }}
                title={ruteName}
              >
                {ruteName}
              </span>
            </div>
          </foreignObject>
        </g>
      );
    }
  };

  // ==== Data Grafik menggunakan useMemo ====
  const grafikWaktuData = useMemo(() => {
    if (selectedLayanan === "ALL") {
      return layananList.map((layanan) => {
        const avg = layanan.rute.reduce(
          (acc, r) => {
            acc.Headway += r.headway;
            acc["Lay Over Time"] += r.layOverTime;
            acc["Travel Time"] += r.travelTime;
            return acc;
          },
          { Headway: 0, "Lay Over Time": 0, "Travel Time": 0 }
        );

        const total = layanan.rute.length;
        return {
          rute: layanan.namaLayanan,
          Headway: Math.round(avg.Headway / total),
          "Lay Over Time": Math.round(avg["Lay Over Time"] / total),
          "Travel Time": Math.round(avg["Travel Time"] / total),
        };
      });
    } else {
      const layanan = filteredLayanan[0];
      if (!layanan) return [];

      if (selectedRute === "ALL") {
        return layanan.rute.map((r) => ({
          rute: r.nama,
          Headway: r.headway,
          "Lay Over Time": r.layOverTime,
          "Travel Time": r.travelTime,
        }));
      } else {
        const rute = layanan.rute.find((r) => r.nama === selectedRute);
        if (!rute) return [];

        return [
          {
            rute: rute.nama,
            Headway: rute.headway,
            "Lay Over Time": rute.layOverTime,
            "Travel Time": rute.travelTime,
          },
        ];
      }
    }
  }, [selectedLayanan, selectedRute, filteredLayanan, layananList]);

  const grafikLoadFactorData = useMemo(() => {
    if (selectedLayanan === "ALL") {
      return layananList.map((layanan) => {
        const avg = layanan.rute.reduce(
          (acc, r) => {
            acc.Awal += r.loadFactor.awal;
            acc.Akhir += r.loadFactor.akhir;
            acc["Rata-rata"] += r.loadFactor.rataRata;
            return acc;
          },
          { Awal: 0, Akhir: 0, "Rata-rata": 0 }
        );

        const total = layanan.rute.length;
        return {
          rute: layanan.namaLayanan,
          Awal: Math.round(avg.Awal / total),
          Akhir: Math.round(avg.Akhir / total),
          "Rata-rata": Math.round(avg["Rata-rata"] / total),
        };
      });
    } else {
      const layanan = filteredLayanan[0];
      if (!layanan) return [];

      if (selectedRute === "ALL") {
        return layanan.rute.map((r) => ({
          rute: r.nama,
          Awal: r.loadFactor.awal,
          Akhir: r.loadFactor.akhir,
          "Rata-rata": r.loadFactor.rataRata,
        }));
      } else {
        const rute = layanan.rute.find((r) => r.nama === selectedRute);
        if (!rute) return [];

        return [
          {
            rute: rute.nama,
            Awal: rute.loadFactor.awal,
            Akhir: rute.loadFactor.akhir,
            "Rata-rata": rute.loadFactor.rataRata,
          },
        ];
      }
    }
  }, [selectedLayanan, selectedRute, filteredLayanan, layananList]);

  const grafikPenumpangData = useMemo(() => {
    if (selectedLayanan === "ALL") {
      return layananList.map((layanan) => {
        const avg = layanan.rute.reduce(
          (acc, r) => {
            acc.Naik += r.penumpang.naik;
            acc.Turun += r.penumpang.turun;
            acc["Rata-rata"] += r.penumpang.rataRata;
            return acc;
          },
          { Naik: 0, Turun: 0, "Rata-rata": 0 }
        );

        const total = layanan.rute.length;
        return {
          rute: layanan.namaLayanan,
          Naik: Math.round(avg.Naik / total),
          Turun: Math.round(avg.Turun / total),
          "Rata-rata": Math.round(avg["Rata-rata"] / total),
        };
      });
    } else {
      const layanan = filteredLayanan[0];
      if (!layanan) return [];

      if (selectedRute === "ALL") {
        return layanan.rute.map((r) => ({
          rute: r.nama,
          Naik: r.penumpang.naik,
          Turun: r.penumpang.turun,
          "Rata-rata": r.penumpang.rataRata,
        }));
      } else {
        const rute = layanan.rute.find((r) => r.nama === selectedRute);
        if (!rute) return [];

        return [
          {
            rute: rute.nama,
            Naik: rute.penumpang.naik,
            Turun: rute.penumpang.turun,
            "Rata-rata": rute.penumpang.rataRata,
          },
        ];
      }
    }
  }, [selectedLayanan, selectedRute, filteredLayanan, layananList]);

  // Hitung lebar chart berdasarkan jumlah data
  const calculateChartWidth = (data: any[]) => {
    const baseWidth = 100; // Lebar dasar per item dalam persen
    const minWidth = 100; // Lebar minimum
    const calculatedWidth = Math.max(minWidth, data.length * baseWidth);
    return `${calculatedWidth}%`;
  };

  // === Kondisi loading dan kosong ===
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin tip="Memuat data kinerja transportasi..." />
      </div>
    );
  }

  if (!statistik || statistik.length === 0) {
    return <Empty description="Data kinerja transportasi belum tersedia" />;
  }

  // Jika tidak ada data yang cocok
  if (selectedLayanan !== "ALL" && filteredLayanan.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            Data tidak ditemukan untuk layanan: {selectedLayanan}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div ref={exportRef} className="export-optimized">
      {/* Filter Rute dan Tahun */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Filter Rute */}
        {selectedLayanan !== "ALL" && (
          <div>
            <Select
              value={selectedRute}
              onChange={(value) => setSelectedRute(value)}
              style={{ width: 350 }}
              virtual={false}
            >
              {ruteList.map((rute) => (
                <Option key={rute.key} value={rute.key}>
                  {rute.label}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {/* Filter Tahun muncul setelah pilih rute spesifik */}
        {selectedRute !== "ALL" && (
          <div>
            <DatePicker
              picker="year"
              placeholder="Pilih Tahun"
              value={selectedTahun}
              onChange={handleTahunChange}
              style={{ width: 250 }}
              className="rounded-lg"
              format="YYYY"
              allowClear={false}
            />
          </div>
        )}
      </div>

      {/* 1️⃣ Statistik Data Statis Rata-rata  */}
      <Card
        title={statisPrefix}
        style={{ marginBottom: 20 }}
        extra={
          <Button
            type="primary"
            icon={<CameraOutlined />}
            loading={isExporting}
            onClick={exportToPDF}
            size="middle"
            style={{ backgroundColor: "#2E3192", borderColor: "#2E3192" }}
          >
            Export PDF
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statistikStatis.map((stat) => (
            <Col key={stat.key} xs={24} sm={12} md={6}>
              <Card>
                <p className="text-2xl font-bold text-center text-[#2E3192]">
                  {stat.value}
                </p>
                <p className="text-center text-gray-600">{stat.label}</p>
                <p className="text-center text-sm text-gray-400">
                  Standar: {stat.standar}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 2️⃣ Grafik Headway, LOT, Travel Time */}
      <Card
        title={getCardTitle("Grafik Statis Rata-rata")}
        style={{ marginBottom: 20 }}
      >
        {/* Custom Legend di kiri atas */}
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#005B96" }}
            ></span>
            <span className="text-sm font-medium">Headway</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#6497B1" }}
            ></span>
            <span className="text-sm font-medium">Lay Over Time(LOT)</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#03396C" }}
            ></span>
            <span className="text-sm font-medium">Travel Time</span>
          </div>
        </div>

        {/* Container dengan scroll horizontal */}
        <div className="overflow-x-auto">
          <div
            style={{
              width: calculateChartWidth(grafikWaktuData),
              minWidth: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={grafikWaktuData}
                margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rute"
                  tick={<CustomXAxisTick />}
                  interval={0}
                  height={80}
                />
                <YAxis tickFormatter={(value) => `${value} Menit`} />
                <Tooltip formatter={(value) => `${value} Menit`} />
                <Bar dataKey="Headway" fill="#005B96" />
                <Bar dataKey="Lay Over Time" fill="#6497B1" />
                <Bar dataKey="Travel Time" fill="#03396C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* 3️⃣ Grafik Load Factor */}
      <Card
        title={getCardTitle("Grafik Load Factor Rata-rata")}
        style={{ marginBottom: 20 }}
      >
        {/* Custom Legend di kiri atas */}
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#005B96" }}
            ></span>
            <span className="text-sm font-medium">Awal</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#6497B1" }}
            ></span>
            <span className="text-sm font-medium">Akhir</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#03396C" }}
            ></span>
            <span className="text-sm font-medium">Rata-rata Load Factor</span>
          </div>
        </div>

        {/* Container dengan scroll horizontal */}
        <div className="overflow-x-auto">
          <div
            style={{
              width: calculateChartWidth(grafikLoadFactorData),
              minWidth: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={grafikLoadFactorData}
                margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rute"
                  tick={<CustomXAxisTick />}
                  interval={0}
                  height={80}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="Awal" fill="#005B96" />
                <Bar dataKey="Akhir" fill="#6497B1" />
                <Bar dataKey="Rata-rata" fill="#03396C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* 4️⃣ Statistik Data Dinamis Rata-rata  */}
      <Card title={dinamisPrefix} style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {statistikDinamis.map((stat) => (
            <Col key={stat.key} xs={24} sm={12} md={8}>
              <Card>
                <p className="text-2xl font-bold text-center text-[#2E3192]">
                  {stat.value}
                </p>
                <p className="text-center text-gray-600">{stat.label}</p>
                <p className="text-center text-sm text-gray-400">
                  Standar: {stat.standar}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 5️⃣ Grafik Penumpang */}
      <Card
        title={getCardTitle("Grafik Penumpang Naik dan Turun")}
        style={{ marginBottom: 20 }}
      >
        {/* Custom Legend di kiri atas */}
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#005B96" }}
            ></span>
            <span className="text-sm font-medium">Penumpang Naik</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#6497B1" }}
            ></span>
            <span className="text-sm font-medium">Penumpang Turun</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#03396C" }}
            ></span>
            <span className="text-sm font-medium">Rata-rata Penumpang</span>
          </div>
        </div>

        {/* Container dengan scroll horizontal */}
        <div className="overflow-x-auto">
          <div
            style={{
              width: calculateChartWidth(grafikPenumpangData),
              minWidth: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={grafikPenumpangData}
                margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rute"
                  tick={<CustomXAxisTick />}
                  interval={0}
                  height={80}
                />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Bar dataKey="Naik" fill="#005B96" />
                <Bar dataKey="Turun" fill="#6497B1" />
                <Bar dataKey="Rata-rata" fill="#03396C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KinerjaTransportasi;
