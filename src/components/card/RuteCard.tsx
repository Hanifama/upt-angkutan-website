import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  Row,
  Col,
  Select,
  Spin,
  Empty,
  Tooltip as AntTooltip,
  message,
  Button,
} from "antd";
import { PushpinOutlined, CameraOutlined } from "@ant-design/icons";

import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
  GeoJSON,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix untuk marker icon di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

import type { Route, RouteStatisticsSummary } from "../../interfaces/route";
import type { Layanan } from "../../interfaces/layanan";
import { useRouteStore } from "../../store/useRoutesStore";
import { useHalteStore } from "../../store/useHalteStore";

// Props interface untuk RuteCard
interface RuteCardProps {
  data: Route[];
  layanan: Layanan[];
  statistics: RouteStatisticsSummary | null;
  isLoading: boolean;
}

// Type untuk Leaflet map dengan akses ke _layers
interface ExtendedMap extends L.Map {
  _layers: { [key: number]: L.Layer };
}

function ResizeMapEffect() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

// Component untuk mendengarkan event zoom
function MapZoomListener({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

// Component untuk auto-center map
function MapAutoCenter({
  geojsonData,
  selectedRouteId,
  selectedLayananId,
  displayRoutes,
}: {
  geojsonData: any;
  selectedRouteId: string | null;
  selectedLayananId: string | null;
  displayRoutes: Route[];
}) {
  const map = useMap() as ExtendedMap;

  useEffect(() => {
    if (selectedLayananId && geojsonData && selectedRouteId) {
      // Mode spesifik layanan - center ke rute yang dipilih
      try {
        setTimeout(() => {
          const geoJSONLayer = Object.values(map._layers).find((layer: any) => {
            if (layer instanceof L.GeoJSON) {
              const features = layer.getLayers();
              return features.some(
                (feature: any) =>
                  feature.feature?.properties?.routeId === selectedRouteId
              );
            }
            return false;
          }) as L.GeoJSON;

          if (geoJSONLayer) {
            const bounds = geoJSONLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [20, 20] });
            }
          }
        }, 300);
      } catch (error) {
        console.error("Error centering map:", error);
      }
    } else if (!selectedLayananId && displayRoutes.length > 0) {
      // Mode semua layanan - center ke semua rute
      try {
        setTimeout(() => {
          const geoJSONLayers = Object.values(map._layers).filter(
            (layer: any) => layer instanceof L.GeoJSON
          ) as L.GeoJSON[];

          if (geoJSONLayers.length > 0) {
            const group = new L.FeatureGroup(geoJSONLayers);
            const groupBounds = group.getBounds();
            if (groupBounds.isValid()) {
              map.fitBounds(groupBounds, { padding: [30, 30] });
            }
          } else {
            // Fallback ke default center jika tidak ada GeoJSON
            map.setView([-6.93, 107.61], 13);
          }
        }, 500);
      } catch (error) {
        console.error("Error centering map for all routes:", error);
      }
    }
  }, [geojsonData, selectedRouteId, selectedLayananId, displayRoutes, map]);

  return null;
}

// Custom hook untuk manage GeoJSON data dengan bounds calculation
const useGeoJSONData = (
  selectedRouteId: string | null,
  routes: Route[],
  selectedLayananId: string | null
) => {
  const [geoJsonData, setGeoJsonData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tentukan routes mana yang perlu di-load
    const routesToLoad = selectedLayananId
      ? routes.filter((route) => route.routeId === selectedRouteId)
      : routes;

    let completedRequests = 0;
    const totalRequests = routesToLoad.length;

    if (totalRequests === 0) return;

    setLoading(true);

    routesToLoad.forEach((route) => {
      if (!route?.linkGeojson) {
        console.warn(`Route ${route.routeId} tidak memiliki linkGeojson`);
        completedRequests++;
        if (completedRequests === totalRequests) setLoading(false);
        return;
      }

      if (geoJsonData[route.routeId]) {
        completedRequests++;
        if (completedRequests === totalRequests) setLoading(false);
        return;
      }

      fetch(route.linkGeojson)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch GeoJSON");
          return res.json();
        })
        .then((data) => {
          if (data.features) {
            data.features = data.features.map((feature: any) => ({
              ...feature,
              properties: {
                ...feature.properties,
                routeId: route.routeId,
                routeName: route.routeName,
                layananName: route.layanan.nama,
                status: route.status,
                fare: route.fare,
              },
            }));
          } else if (data.type === "Feature") {
            data.properties = {
              ...data.properties,
              routeId: route.routeId,
              routeName: route.routeName,
              layananName: route.layanan.nama,
              status: route.status,
              fare: route.fare,
            };
          }

          setGeoJsonData((prev) => ({
            ...prev,
            [route.routeId]: data,
          }));
        })
        .catch((error) => {
          console.error(
            `Error fetching GeoJSON for route ${route.routeId}:`,
            error
          );
        })
        .finally(() => {
          completedRequests++;
          if (completedRequests === totalRequests) setLoading(false);
        });
    });
  }, [selectedRouteId, routes, selectedLayananId]);

  return { geoJsonData, loading };
};

const { Option } = Select;

const RuteCard: React.FC<RuteCardProps> = ({
  data: initialRoutes,
  layanan,
  statistics,
  isLoading: initialLoading,
}) => {
  const {
    routesByLayanan,
    fetchRoutesByLayanan,
    clearRoutesByLayanan,
    isLoading: storeLoading,
  } = useRouteStore();

  const { halte, fetchHalte } = useHalteStore();

  const [selectedLayananId, setSelectedLayananId] = useState<string | null>(
    null
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const mapRef = useRef<L.Map | null>(null);

  const displayRoutes = selectedLayananId ? routesByLayanan : initialRoutes;
  const isLoading = initialLoading || storeLoading;

  const [isExporting, setIsExporting] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Effect untuk fetch halte ketika route berubah
  useEffect(() => {
    if (selectedRouteId) {
      fetchHalte(selectedRouteId);
    } else if (!selectedLayananId && displayRoutes.length > 0) {
      const allRouteIds = displayRoutes.map((route) => route.routeId);
      if (allRouteIds.length > 0) {
        fetchHalte(allRouteIds);
      }
    }
  }, [selectedRouteId, selectedLayananId, displayRoutes, fetchHalte]);

  // Helper function untuk mendapatkan warna berdasarkan layananId
  const getColorByLayanan = (layananId: string): string => {
    const layananItem = layanan.find((l) => l.id === layananId);
    return layananItem?.color || "#2E3192";
  };

  const getColorByRoute = (route: Route): string => {
    return getColorByLayanan(route.layanan.id);
  };

  // Filter halte berdasarkan rute yang sedang ditampilkan
  const getFilteredHalte = () => {
    if (selectedRouteId) {
      return halte.filter((halteItem) =>
        halteItem.routes.some((route) => route.id === selectedRouteId)
      );
    } else if (!selectedLayananId) {
      return halte;
    }
    return halte.filter((halteItem) =>
      halteItem.routes.some((route) =>
        displayRoutes.some((displayRoute) => displayRoute.routeId === route.id)
      )
    );
  };

  const filteredHalte = getFilteredHalte();

  // Filter halte berdasarkan zoom level
  const getVisibleHalte = () => {
    // Tentukan zoom threshold untuk menampilkan halte
    const zoomThreshold = selectedLayananId && selectedRouteId ? 14 : 15;

    // Jika zoom level cukup tinggi, tampilkan semua halte
    if (currentZoom >= zoomThreshold) {
      return filteredHalte;
    }

    // Jika zoom level rendah, batasi jumlah halte yang ditampilkan
    if (currentZoom >= 13) {
      // Tampilkan maksimal 20 halte pada zoom level menengah
      return filteredHalte.slice(0, 20);
    }

    // Pada zoom level sangat rendah, jangan tampilkan halte sama sekali
    return [];
  };

  const visibleHalte = getVisibleHalte();

  // Custom icon untuk halte - menggunakan warna dari layanan atau circle default
  const createHalteIcon = (halteItem: any) => {
    const primaryLayanan =
      halteItem.layanan.length > 0
        ? layanan.find(
            (layananItem) => layananItem.id === halteItem.layanan[0].id
          )
        : null;

    const primaryColor = primaryLayanan?.color || "#2E3192";
    const logoSrc = primaryLayanan?.icon || "/fallback-logo.png";

    const html = `
    <div style="
      background-color: ${primaryColor};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    ">
      <img 
        src="${logoSrc}" 
        style="width: 20px; height: 20px; object-fit: contain;" 
      />

      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 10px;
        height: 10px;
        background: ${halteItem.status ? "#10B981" : "#EF4444"};
        border: 2px solid white;
        border-radius: 50%;
      "></div>
    </div>
  `;

    return new L.DivIcon({
      html,
      className: "custom-halte-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Style CSS untuk marker halte
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-halte-icon {
        background: transparent;
        border: none;
      }
      .leaflet-marker-icon {
        transition: transform 0.2s ease;
      }
      .leaflet-marker-icon:hover {
        transform: scale(1.2);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handler ketika layanan dipilih
  const handleLayananSelect = async (layananId: string | null) => {
    setSelectedLayananId(layananId);
    setSelectedRouteId(null);

    if (layananId) {
      await fetchRoutesByLayanan(layananId);
    } else {
      clearRoutesByLayanan();
    }
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  useEffect(() => {
    if (selectedLayananId && displayRoutes.length > 0) {
      const firstRouteId = displayRoutes[0].routeId;
      setSelectedRouteId(firstRouteId);
    } else {
      setSelectedRouteId(null);
    }
  }, [selectedLayananId, displayRoutes]);

  // Siapkan data untuk pie chart dari statistics dengan null check
  const pieData = statistics?.detailPerLayanan
    ? statistics.detailPerLayanan.map((item) => ({
        name: item.layananNama,
        value: item.totalRute,
        color: getColorByLayanan(item.layananId),
      }))
    : [];

  // Fallback values untuk statistics
  const totalRuteAktif = statistics?.totalAktif || 0;
  const totalRuteTidakAktif = statistics?.totalTidakAktif || 0;
  const totalKeseluruhanRute = statistics?.totalKeseluruhan || 0;
  const detailPerLayanan = statistics?.detailPerLayanan || [];

  const totalArmadaAktif = statistics?.totalAktifArmada || 0;
  const totalArmadaTidakAktif = statistics?.totalTidakAktifArmada || 0;
  const totalKeseluruhanArmada = statistics?.totalKeseluruhanArmada || 0;

  // Export to PDF function (sama seperti sebelumnya)
  const exportToPDF = async () => {
    if (!mapContainerRef.current) {
      message.error("Map container tidak ditemukan");
      return;
    }

    setIsExporting(true);
    message.loading({ content: "Membuat PDF...", key: "pdf", duration: 0 });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = await htmlToImage.toPng(mapContainerRef.current, {
        backgroundColor: "#ffffff",
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          const isLeafletControl =
            node.classList?.contains("leaflet-control-zoom") ||
            node.classList?.contains("leaflet-control-attribution");
          return !isLeafletControl;
        },
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // HEADER - TENGAH
      pdf.setFontSize(18);
      pdf.text("PETA RUTE UPT MANAJEMEN ANGKUTAN", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFontSize(10);

      // INFORMASI UMUM - KOLOM KIRI (LEBIH SEMPIT)
      let leftY = 30;
      const leftColumnX = 20;

      pdf.text(
        `Tanggal: ${new Date().toLocaleString("id-ID")}`,
        leftColumnX,
        leftY
      );
      leftY += 6;

      pdf.text(
        `Layanan: ${
          selectedLayananId
            ? layanan.find((l) => l.id === selectedLayananId)?.nama ||
              "Terpilih"
            : "Semua Layanan"
        }`,
        leftColumnX,
        leftY
      );
      leftY += 6;

      pdf.text(`Total Rute: ${displayRoutes.length}`, leftColumnX, leftY);
      leftY += 6;

      // Tambahkan informasi halte
      if (halte.length > 0) {
        pdf.text(`Total Halte: ${halte.length}`, leftColumnX, leftY);
        leftY += 6;
      }

      // INFORMASI STATISTIK - KOLOM KIRI (untuk mode semua layanan)
      if (!selectedLayananId) {
        pdf.text(`Mode: Menampilkan semua rute`, leftColumnX, leftY);
        leftY += 6;

        const aktifCount = displayRoutes.filter(
          (r) => r.status === "active"
        ).length;
        const tidakAktifCount = displayRoutes.filter(
          (r) => r.status !== "active"
        ).length;

        pdf.text(`Rute Aktif: ${aktifCount}`, leftColumnX, leftY);
        leftY += 5;

        pdf.text(`Rute Tidak Aktif: ${tidakAktifCount}`, leftColumnX, leftY);
        leftY += 6;
      }

      // INFORMASI RUTE TERPILIH - KOLOM KANAN (LEBIH LEBAR)
      let rightY = 30;
      const rightColumnX = 100;
      const rightColumnWidth = pageWidth - rightColumnX - 20;

      if (selectedRouteId && selectedLayananId) {
        const selectedRoute = displayRoutes.find(
          (route) => route.routeId === selectedRouteId
        );
        if (selectedRoute) {
          // JUDUL RUTE TERPILIH
          pdf.setFont("helvetica", "bold");
          pdf.text("RUTE TERPILIH", rightColumnX, rightY);
          pdf.setFont("helvetica", "normal");
          rightY += 7;

          // NAMA RUTE DENGAN TEXT WRAPPING
          const namaRuteText = `Nama: ${selectedRoute.routeName}`;
          const splitNamaRute = pdf.splitTextToSize(
            namaRuteText,
            rightColumnWidth
          );
          pdf.text(splitNamaRute, rightColumnX, rightY);
          rightY += splitNamaRute.length * 5 + 2;

          // INFORMASI LAINNYA
          pdf.text(
            `Status: ${
              selectedRoute.status === "active" ? "Aktif" : "Tidak Aktif"
            }`,
            rightColumnX,
            rightY
          );
          rightY += 5;

          // pdf.text(
          //   `Tarif: Rp ${selectedRoute.fare.toLocaleString()}`,
          //   rightColumnX,
          //   rightY
          // );
          // rightY += 5;

          // pdf.text(
          //   `Layanan: ${selectedRoute.layanan.nama}`,
          //   rightColumnX,
          //   rightY
          // );
          // rightY += 5;

          // Informasi halte untuk rute ini
          const halteForRoute = halte.filter((halteItem) =>
            halteItem.routes.some((route) => route.id === selectedRouteId)
          );
          if (halteForRoute.length > 0) {
            pdf.text(
              `Jumlah Halte: ${halteForRoute.length}`,
              rightColumnX,
              rightY
            );
            rightY += 5;
          }

          // Tambahan informasi jika ada
          // if (
          //   selectedRoute.coordinates &&
          //   selectedRoute.coordinates.length > 0
          // ) {
          //   pdf.text(
          //     `Jumlah titik: ${selectedRoute.coordinates.length}`,
          //     rightColumnX,
          //     rightY
          //   );
          //   rightY += 5;
          // }
        }
      }

      // GARIS PEMISAH
      const separatorY = Math.max(leftY, rightY) + 3;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, separatorY, pageWidth - 20, separatorY);

      // GAMBAR PETA - posisi Y disesuaikan dengan konten terpanjang
      const imgStartY = separatorY + 5;
      const imgWidth = pageWidth - 40;
      const imgHeight = pageHeight - imgStartY - 10;

      pdf.addImage(dataUrl, "PNG", 20, imgStartY, imgWidth, imgHeight);

      // FOOTER
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Dibuat oleh Sistem UPT MANAJEMEN ANGKUTAN - ${new Date().getFullYear()}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );

      const timestamp = new Date()
        .toLocaleString("id-ID")
        .replace(/[/:\\]/g, "-");
      pdf.save(`peta-rute-${timestamp}.pdf`);

      message.success({ content: "PDF berhasil diunduh!", key: "pdf" });
    } catch (error) {
      console.error("Error creating PDF:", error);
      try {
        await fallbackPDF();
      } catch (fallbackError) {
        console.error("Fallback PDF error:", fallbackError);
        message.error({ content: "Gagal membuat PDF", key: "pdf" });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const fallbackPDF = async () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    // HEADER - TENGAH
    pdf.setFontSize(18);
    pdf.text("PETA RUTE UPT MANAJEMEN ANGKUTAN", pageWidth / 2, 20, {
      align: "center",
    });

    pdf.setFontSize(10);

    // INFORMASI UMUM - KOLOM KIRI
    let leftY = 30;
    const leftColumnX = 20;

    pdf.text(
      `Tanggal: ${new Date().toLocaleString("id-ID")}`,
      leftColumnX,
      leftY
    );
    leftY += 6;

    pdf.text(
      `Layanan: ${
        selectedLayananId
          ? layanan.find((l) => l.id === selectedLayananId)?.nama || "Terpilih"
          : "Semua Layanan"
      }`,
      leftColumnX,
      leftY
    );
    leftY += 6;

    pdf.text(`Total Rute: ${displayRoutes.length}`, leftColumnX, leftY);
    leftY += 6;

    // Tambahkan informasi halte
    if (halte.length > 0) {
      pdf.text(`Total Halte: ${halte.length}`, leftColumnX, leftY);
      leftY += 6;
    }

    // INFORMASI STATISTIK - KOLOM KIRI (untuk mode semua layanan)
    if (!selectedLayananId) {
      const aktifCount = displayRoutes.filter(
        (r) => r.status === "active"
      ).length;
      const tidakAktifCount = displayRoutes.filter(
        (r) => r.status !== "active"
      ).length;

      pdf.text(`Rute Aktif: ${aktifCount}`, leftColumnX, leftY);
      leftY += 5;

      pdf.text(`Rute Tidak Aktif: ${tidakAktifCount}`, leftColumnX, leftY);
      leftY += 6;
    }

    // INFORMASI RUTE TERPILIH - KOLOM KANAN
    let rightY = 30;
    const rightColumnX = 100;
    const rightColumnWidth = pageWidth - rightColumnX - 20;

    if (selectedRouteId && selectedLayananId) {
      const selectedRoute = displayRoutes.find(
        (route) => route.routeId === selectedRouteId
      );
      if (selectedRoute) {
        pdf.setFont("helvetica", "bold");
        pdf.text("RUTE TERPILIH", rightColumnX, rightY);
        pdf.setFont("helvetica", "normal");
        rightY += 7;

        // NAMA RUTE DENGAN TEXT WRAPPING
        const namaRuteText = `Nama: ${selectedRoute.routeName}`;
        const splitNamaRute = pdf.splitTextToSize(
          namaRuteText,
          rightColumnWidth
        );
        pdf.text(splitNamaRute, rightColumnX, rightY);
        rightY += splitNamaRute.length * 5 + 2;

        pdf.text(
          `Status: ${
            selectedRoute.status === "active" ? "Aktif" : "Tidak Aktif"
          }`,
          rightColumnX,
          rightY
        );
        rightY += 5;

        pdf.text(
          `Tarif: Rp ${selectedRoute.fare.toLocaleString()}`,
          rightColumnX,
          rightY
        );
        rightY += 5;

        pdf.text(
          `Layanan: ${selectedRoute.layanan.nama}`,
          rightColumnX,
          rightY
        );

        // Informasi halte untuk rute ini
        const halteForRoute = halte.filter((halteItem) =>
          halteItem.routes.some((route) => route.id === selectedRouteId)
        );
        if (halteForRoute.length > 0) {
          rightY += 5;
          pdf.text(
            `Jumlah Halte: ${halteForRoute.length}`,
            rightColumnX,
            rightY
          );
        }
      }
    }

    // INFORMASI TIDAK ADA GAMBAR
    const infoY = Math.max(leftY, rightY) + 10;
    pdf.setTextColor(255, 0, 0);
    pdf.text("⚠️ PETA TIDAK DAPAT DITAMPILKAN", pageWidth / 2, infoY, {
      align: "center",
    });
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "Screenshot peta tidak tersedia, silakan coba lagi atau gunakan fitur export lainnya",
      pageWidth / 2,
      infoY + 6,
      { align: "center" }
    );

    const timestamp = new Date()
      .toLocaleString("id-ID")
      .replace(/[/:\\]/g, "-");
    pdf.save(`peta-rute-info-${timestamp}.pdf`);

    message.success({ content: "PDF info berhasil diunduh!", key: "pdf" });
  };

  const { geoJsonData } = useGeoJSONData(
    selectedRouteId,
    displayRoutes,
    selectedLayananId
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!isLoading && displayRoutes.length === 0 && !statistics) {
    return (
      <div className="flex justify-center items-center h-64">
        <Empty description="Tidak ada data rute" />
      </div>
    );
  }

  return (
    <Row gutter={24}>
      {/* Kiri: Ringkasan Total Rute */}
      <Col span={7}>
        <Card
          title={
            <span className="flex items-center gap-2">
              Ringkasan Total Rute
            </span>
          }
        >
          {pieData.length > 0 ? (
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} Rute`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      padding: "8px 12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <Empty description="Tidak ada data statistik" />
            </div>
          )}

          <div className="mt-4">
            <div className="flex px-2 font-semibold mb-2 text-gray-700 text-[10px] gap-4">
              <div className="flex-1 text-left min-w-0"></div>
              <div className="w-12 text-right">Rute</div>
              <div className="w-5 text-right">Armada</div>
            </div>

            <div className="w-full p-2">
              {[
                {
                  label: "Jumlah",
                  color: "text-blue-600",
                  valueRoute: totalKeseluruhanRute,
                  valueArmada: totalKeseluruhanArmada,
                },
                {
                  label: "Aktif",
                  color: "text-green-600",
                  valueRoute: totalRuteAktif,
                  valueArmada: totalArmadaAktif,
                },
                {
                  label: "Tidak Aktif",
                  color: "text-red-600",
                  valueRoute: totalRuteTidakAktif,
                  valueArmada: totalArmadaTidakAktif,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center">
                  <div className="flex-1 text-gray-700 text-sm min-w-0">
                    {item.label}
                  </div>
                  <div
                    className={`w-12 flex justify-end font-semibold text-sm ${item.color}`}
                  >
                    {item.valueRoute}
                  </div>
                  <div
                    className={`w-12 flex justify-end font-semibold text-sm ${item.color}`}
                  >
                    {item.valueArmada}
                  </div>
                </div>
              ))}
            </div>

            {detailPerLayanan.length > 0 ? (
              <div className="space-y-1">
                {detailPerLayanan.map((item) => {
                  const layananColor = getColorByLayanan(item.layananId);
                  return (
                    <div
                      key={item.layananId}
                      className="flex items-center py-1 px-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex-1 flex items-center gap-2 text-sm text-gray-700 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: layananColor }}
                        />
                        <div className="relative group w-full">
                          <span className="truncate block">
                            {item.layananNama}
                          </span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
                            {item.layananNama}
                          </div>
                        </div>
                      </div>
                      <div className="w-12 flex justify-end font-semibold text-sm text-gray-900">
                        {item.totalRute}
                      </div>
                      <div className="w-12 flex justify-end font-semibold text-sm text-gray-900">
                        {item.totalArmada}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2 text-center text-gray-500 py-2 text-sm">
                Tidak ada data detail layanan
              </div>
            )}
          </div>
        </Card>
      </Col>

      {/* Kanan: Jalur / Rute Terdaftar */}
      <Col span={17}>
        <div className="flex px-1 gap-2 flex-wrap">
          <div
            onClick={() => handleLayananSelect(null)}
            className={`cursor-pointer flex items-center gap-2 transition-all ${
              selectedLayananId === null
                ? "bg-white border border-gray-300 px-3"
                : "bg-gray-100 hover:bg-gray-200 rounded-full p-3"
            }`}
          >
            <div className="flex items-center justify-center">
              <PushpinOutlined className="w-5 h-5 text-gray-600" />
            </div>
            {selectedLayananId === null && (
              <span className="font-medium text-gray-800 whitespace-nowrap">
                Semua Layanan
              </span>
            )}
          </div>

          {layanan.map((item) => {
            const isActive = selectedLayananId === item.id;
            const layananColor = getColorByLayanan(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleLayananSelect(item.id)}
                className={`cursor-pointer flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-white border border-gray-300 px-3 py-2 rounded-full"
                    : "bg-gray-100 hover:bg-gray-200 rounded-full p-3"
                }`}
              >
                <div className="flex items-center justify-center">
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.nama}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: layananColor }}
                    />
                  )}
                </div>
                {isActive && (
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    {item.nama}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Card className="relative">
          {selectedLayananId && displayRoutes.length > 0 && (
            <>
              <div className="absolute top-4 right-4 z-[1] p-3 border-gray-200 max-w-xs w-full">
                <div className="mb-2">
                  <Select
                    value={selectedRouteId}
                    className="w-full"
                    onChange={handleRouteSelect}
                    placeholder="Pilih Rute"
                    size="middle"
                    virtual={false}
                    loading={isLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {displayRoutes.map((route) => (
                      <Option key={route.routeId} value={route.routeId}>
                        {route.routeName}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="absolute top-8 left-20 z-[1000] rounded-lg shadow-lg p-2">
                <AntTooltip title="Export Peta ke PDF">
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    loading={isExporting}
                    onClick={exportToPDF}
                    size="middle"
                    style={{
                      backgroundColor: "#2E3192",
                      borderColor: "#2E3192",
                    }}
                  />
                </AntTooltip>
              </div>
            </>
          )}

          <div
            ref={mapContainerRef}
            className="rounded-lg overflow-hidden border border-gray-200 relative z-0"
          >
            <MapContainer
              center={[-6.93, 107.61]}
              zoom={13}
              style={{ height: "630px", width: "100%" }}
              ref={mapRef}
            >
              <ResizeMapEffect />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* Zoom Listener */}
              <MapZoomListener onZoomChange={setCurrentZoom} />

              <MapAutoCenter
                geojsonData={
                  selectedRouteId ? geoJsonData[selectedRouteId] : null
                }
                selectedRouteId={selectedRouteId}
                selectedLayananId={selectedLayananId}
                displayRoutes={displayRoutes}
              />

              {/* TAMPILKAN MARKER HALTE HANYA PADA ZOOM TERTENTU */}
              {visibleHalte.map((halteItem) => (
                <Marker
                  key={halteItem.id}
                  position={[
                    halteItem.location.latitude,
                    halteItem.location.longitude,
                  ]}
                  icon={createHalteIcon(halteItem)}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <strong className="text-xs">
                        <span>Halte: </span>
                        {halteItem.nama}
                      </strong>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <span>Status:</span>
                          <span
                            className={`font-medium ${
                              halteItem.status
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {halteItem.status ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                        {/* {halteItem.routes.length > 0 && (
                          <div>
                            <span>Melayani Rute:</span>
                            <div className="mt-1 space-y-1">
                              {halteItem.routes.map((route) => (
                                <div
                                  key={route.id}
                                  className="bg-gray-100 px-2 py-1 rounded text-xs"
                                >
                                  Nama Rute : {route.nama}
                                </div>
                              ))}
                            </div>
                          </div>
                        )} */}
                        {/* {halteItem.layanan.length > 0 && (
                          <div>
                            <span>Layanan:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {halteItem.layanan.map((layananItem) => {
                                const layananColor = getColorByLayanan(
                                  layananItem.id
                                );
                                return (
                                  <span
                                    key={layananItem.id}
                                    className="px-2 py-1 rounded text-xs text-white font-medium"
                                    style={{ backgroundColor: layananColor }}
                                  >
                                    {layananItem.nama}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Mode Semua Layanan */}
              {!selectedLayananId && displayRoutes.length > 0 && (
                <>
                  {displayRoutes.map((route) => {
                    const geojson = geoJsonData[route.routeId];
                    const routeColor = getColorByRoute(route);

                    if (geojson) {
                      return (
                        <GeoJSON
                          key={route.routeId}
                          data={geojson}
                          style={{
                            color: routeColor,
                            weight: 4,
                            opacity: 0.7,
                          }}
                          onEachFeature={(feature, layer) => {
                            if (feature.properties) {
                              layer.bindPopup(`
                                <div class="p-2 min-w-[200px]">
                                  <strong class="text-sm">${
                                    feature.properties.routeName ||
                                    route.routeName
                                  }</strong><br/>
                                  <div class="mt-1 text-xs">
                                    <div class="flex items-center gap-1">
                                      <span>Layanan:</span>
                                      <span class="font-medium">${
                                        feature.properties.layananName ||
                                        route.layanan.nama
                                      }</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                      <span>Status:</span>
                                      <span class="font-medium ${
                                        feature.properties.status === "active"
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }">
                                        ${
                                          feature.properties.status === "active"
                                            ? "Aktif"
                                            : "Tidak Aktif"
                                        }
                                      </span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                      <span>Tarif:</span>
                                      <span class="font-medium">Rp ${(
                                        feature.properties.fare || route.fare
                                      ).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              `);
                            }
                          }}
                        />
                      );
                    } else if (
                      route.coordinates &&
                      route.coordinates.length > 0
                    ) {
                      return (
                        <Polyline
                          key={route.routeId}
                          positions={route.coordinates.map((coord) => [
                            coord.latitude,
                            coord.longitude,
                          ])}
                          color={routeColor}
                          weight={3}
                          opacity={0.6}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Info box di pojok kiri bawah */}
                  <div className="leaflet-bottom leaflet-left">
                    <div className="leaflet-control leaflet-bar bg-white p-2 text-xs">
                      <div>
                        <strong>Menampilkan {displayRoutes.length} rute</strong>
                      </div>
                      <div>
                        <strong>
                          {visibleHalte.length} dari {filteredHalte.length}{" "}
                          halte
                          {currentZoom < 15 &&
                            " (zoom in untuk melihat lebih banyak)"}
                        </strong>
                      </div>
                      <div className="text-gray-500">
                        Zoom: {currentZoom.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-2 left-12 z-[1000] rounded-lg shadow-lg p-2">
                    <AntTooltip title="Export Peta ke PDF">
                      <Button
                        type="primary"
                        icon={<CameraOutlined />}
                        loading={isExporting}
                        onClick={exportToPDF}
                        size="middle"
                        style={{
                          backgroundColor: "#2E3192",
                          borderColor: "#2E3192",
                        }}
                      />
                    </AntTooltip>
                  </div>
                </>
              )}

              {/* Mode Spesifik Layanan */}
              {selectedLayananId && selectedRouteId && (
                <>
                  {displayRoutes
                    .filter((route) => route.routeId === selectedRouteId)
                    .map((route) => {
                      const geojson = geoJsonData[route.routeId];
                      const routeColor = getColorByRoute(route);

                      if (geojson) {
                        return (
                          <GeoJSON
                            key={route.routeId}
                            data={geojson}
                            style={{
                              color: routeColor,
                              weight: 6,
                              opacity: 0.8,
                            }}
                            onEachFeature={(feature, layer) => {
                              if (feature.properties) {
                                layer.bindPopup(`
                                  <div class="p-2">
                                    <strong>${
                                      feature.properties.routeName ||
                                      route.routeName
                                    }</strong><br/>
                                    Layanan: ${
                                      feature.properties.layananName ||
                                      route.layanan.nama
                                    }<br/>
                                    Status: ${
                                      feature.properties.status === "active"
                                        ? "Aktif"
                                        : "Tidak Aktif"
                                    }<br/>
                                    Tarif: Rp ${(
                                      feature.properties.fare || route.fare
                                    ).toLocaleString()}
                                  </div>
                                `);
                              }
                            }}
                          />
                        );
                      } else if (
                        route.coordinates &&
                        route.coordinates.length > 0
                      ) {
                        return (
                          <Polyline
                            key={route.routeId}
                            positions={route.coordinates.map((coord) => [
                              coord.latitude,
                              coord.longitude,
                            ])}
                            color={routeColor}
                            weight={5}
                            opacity={0.8}
                          />
                        );
                      }
                      return null;
                    })}

                  {/* Info box di pojok kiri bawah */}
                  <div className="leaflet-bottom leaflet-left">
                    <div className="leaflet-control leaflet-bar bg-white p-2 text-xs">
                      <div>
                        <strong>
                          {visibleHalte.length} dari {filteredHalte.length}{" "}
                          halte pada rute ini
                          {currentZoom < 14 &&
                            " (zoom in untuk melihat halte lebih banyak)"}
                        </strong>
                      </div>
                      <div className="text-gray-500">
                        Zoom: {currentZoom.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {displayRoutes.length === 0 && (
                <div className="leaflet-bottom leaflet-left">
                  <div className="leaflet-control leaflet-bar bg-white p-2 text-xs">
                    Tidak ada rute yang tersedia
                  </div>
                </div>
              )}
            </MapContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default RuteCard;
