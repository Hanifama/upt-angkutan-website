import React, { useEffect, useState } from "react";
import { Card, Select, Table, Button, Tag, message, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useArmadaStore } from "../../../store/useArmadaStore";
import { useLayananStore } from "../../../store/useLayananStore";
import type { Armada, GetArmadaParams } from "../../../interfaces/armada";

import CustomModal from "../../../components/_shared/CustomModal";
import busNotfound from "../../../assets/404.jpeg";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const getDateStatus = (date?: string) => {
  if (!date) return "unknown";
  const today = new Date();
  const expiredDate = new Date(date);
  const diffTime = expiredDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "soon";
  return "active";
};

const renderDateStatus = (date?: string) => {
  if (!date) return <span>-</span>;
  const status = getDateStatus(date);
  let statusText: string | null = null;
  let statusClass = "";
  if (status === "expired") {
    statusText = "Tidak Aktif";
    statusClass = "text-red-600";
  } else if (status === "soon") {
    statusText = "Segera Habis";
    statusClass = "text-yellow-500";
  }
  return (
    <div className="flex flex-col">
      <span>{date.split("T")[0]}</span>
      {statusText && (
        <span className={`text-sm font-semibold ${statusClass}`}>
          {statusText}
        </span>
      )}
    </div>
  );
};

const ArmadaPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    armadas,
    fetchArmadas,
    deleteArmada,
    isLoading,
    meta,
    summary,
    filterLayanan,
    setFilterLayanan,
    fetchArmadaSummary,
  } = useArmadaStore();
  const { layanan, fetchLayanan } = useLayananStore();

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [messageApi, contextHolder] = message.useMessage();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleDelete = async (routeId: string) => {
    try {
      await deleteArmada(routeId);
      messageApi.success("Data armada berhasil dihapus!", 2);
    } catch (error: any) {
      messageApi.error(error.message || "Gagal menghapus data armada.", 2);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRouteId) return;
    try {
      await handleDelete(selectedRouteId);
      setModalVisible(false);
      setSelectedRouteId(null);
    } catch {
      alert("Gagal menghapus rute!");
    }
  };

  const handleDeleteClick = (routeId: string) => {
    setSelectedRouteId(routeId);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchLayanan();
    fetchArmadaSummary();
  }, [fetchLayanan, fetchArmadaSummary]);

  useEffect(() => {
    const params: GetArmadaParams = { page: currentPage, limit: pageSize };
    if (filterLayanan !== "Semua Jenis Layanan")
      params.layananId = filterLayanan;
    fetchArmadas(params);
  }, [filterLayanan, currentPage, pageSize, fetchArmadas]);

  const columns: ColumnsType<Armada> = [
    {
      title: "Tanggal Pencatatan",
      dataIndex: "tanggalPencatatan",
      width: 150,
      render: (date: string | null, record) =>
        date ? date.split("T")[0] : record.createdAt.split("T")[0],
    },
    {
      title: "Gambar Armada",
      key: "image",
      width: 150,
      render: (_, record) => {
        const imageUrl =
          record.potoArmada && record.potoArmada.trim() !== ""
            ? record.potoArmada
            : busNotfound;
        return (
          <img
            src={imageUrl}
            alt={record.licensePlate || "Armada"}
            className="rounded-md border object-cover w-24 h-16"
          />
        );
      },
    },
    { title: "No. Kendaraan", dataIndex: "licensePlate", width: 150 },
    { title: "Kapasitas", dataIndex: "kapasitas", width: 150 },
    {
      title: "Tahun Kendaraan",
      dataIndex: "tahunKendaraan",
      width: 150,
      render: (tahun: number | null) => <span>{tahun ?? "-"}</span>,
    },
    {
      title: "Layanan",
      width: 250,
      render: (_, record) => <div>{record.layanan?.nama || "-"}</div>,
    },
    {
      title: "Rute",
      width: 200,
      render: (_, record) => <div>{record.rute?.nama || "-"}</div>,
    },
    {
      title: "STNK Expired",
      dataIndex: "stnkExpiresAt",
      width: 150,
      render: (date: string | null) =>
        date ? renderDateStatus(date) : <span>-</span>,
    },
    {
      title: "KIR Expired",
      dataIndex: "kirExpiresAt",
      width: 150,
      render: (date: string | null) =>
        date ? renderDateStatus(date) : <span>-</span>,
    },
    {
      title: "Kartu Pengawasan",
      dataIndex: "sipaExpiresAt",
      width: 180,
      render: (date: string | null) =>
        date ? renderDateStatus(date) : <span>-</span>,
    },
    {
      title: "Status Armada",
      dataIndex: "status",
      width: 130,
      render: (status: boolean) => (
        <span
          className={`px-2 py-1 rounded-md text-sm font-medium ${
            status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {status ? "Aktif" : "Non Aktif"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: Armada) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/dashboard/armada/edit/${record.id}`)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDeleteClick(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Statistik Armada - Menggunakan data dari store baru */}
      <Card title="Statistik Armada">
        {/* Statistik Armada & Detail Per Layanan (semua jadi satu deretan) */}
        <div>
          <Row gutter={[16, 16]}>
            {/* Total Keseluruhan */}
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <div className="p-5 rounded-lg border border-blue-200 text-center bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between items-center h-full">
                <p className="font-semibold text-center text-blue-800 mb-3">
                  Total Armada
                </p>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-blue-600 leading-none">
                    {summary?.totalKeseluruhan || 0}
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    Total Keseluruhan
                  </span>
                </div>
              </div>
            </Col>

            {/* Detail per layanan */}
            {summary?.detailPerLayanan.map((layanan) => {
              const total = layanan.totalAktif + layanan.totalTidakAktif;

              return (
                <Col
                  key={layanan.layananId || "no-service"}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  xl={4}
                >
                  <div
                    className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition p-5 flex flex-col justify-between items-center h-full ${
                      total === 0 ? "opacity-60" : ""
                    }`}
                  >
                    {/* Nama Layanan */}
                    <p className="font-semibold text-center text-gray-800 mb-3">
                      {layanan.layananNama}
                    </p>

                    {/* Total Armada */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-3xl font-bold leading-none ${
                          total === 0 ? "text-gray-400" : "text-blue-600"
                        }`}
                      >
                        {total}
                      </span>
                      <span className="text-gray-500 text-sm mt-1">
                        Total Armada
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Statistik Dokumen Segera Habis */}
        <div className="mt-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <h3 className="text-yellow-600 text-sm font-medium">
                  STNK Segera Habis
                </h3>
                <p className="text-2xl font-bold text-yellow-800">
                  {summary?.totalStnkSegeraHabis || 0}
                </p>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <h3 className="text-yellow-600 text-sm font-medium">
                  KIR Segera Habis
                </h3>
                <p className="text-2xl font-bold text-yellow-800">
                  {summary?.totalKirSegeraHabis || 0}
                </p>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <h3 className="text-yellow-600 text-sm font-medium">
                  Kartu Pengawasan Segera Habis
                </h3>
                <p className="text-2xl font-bold text-yellow-800">
                  {summary?.totalSipaSegeraHabis || 0}
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Tabel Informasi Armada */}
      <Card title="Informasi Armada">
        <div className="flex gap-4 mb-2 flex-wrap">
          <Select
            value={filterLayanan}
            onChange={(value) => {
              setFilterLayanan(value);
              setCurrentPage(1);
            }}
            className="flex-1 min-w-[200px]"
          >
            <Option value="Semua Jenis Layanan">Semua Jenis Layanan</Option>
            {layanan.map((l) => (
              <Option key={l.id} value={l.id}>
                {l.nama}
              </Option>
            ))}
          </Select>
        </div>

        {filterLayanan !== "Semua Jenis Layanan" && (
          <div className="mb-4 flex gap-2 flex-wrap text-sm">
            <Tag
              closable
              onClose={() => setFilterLayanan("Semua Jenis Layanan")}
              closeIcon={<CloseCircleOutlined />}
              color="blue"
            >
              {layanan.find((l) => l.id === filterLayanan)?.nama ||
                filterLayanan}
            </Tag>
          </div>
        )}

        <Table
          dataSource={armadas}
          columns={columns}
          pagination={false}
          rowKey="id"
          scroll={{ x: "max-content" }}
          loading={isLoading}
          locale={{ emptyText: "Data tidak ditemukan" }}
        />

        <CustomModal
          visible={modalVisible}
          title="Konfirmasi Hapus"
          content="Apakah Anda yakin ingin menghapus armada ini?"
          onOk={handleConfirmDelete}
          onCancel={() => setModalVisible(false)}
        />

        <div className="flex items-center justify-end gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Tampilkan per Halaman:</span>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              options={[
                { value: 5, label: "5" },
                { value: 7, label: "7" },
                { value: 10, label: "10" },
                { value: 20, label: "20" },
              ]}
              style={{ width: 80 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>
              {meta.totalData === 0
                ? "0-0"
                : `${(currentPage - 1) * pageSize + 1}-${Math.min(
                    currentPage * pageSize,
                    meta.totalData
                  )}`}{" "}
              dari {meta.totalData}
            </span>
            <Button
              size="small"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {"<"}
            </Button>
            <Button
              size="small"
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < meta.totalPages ? prev + 1 : prev
                )
              }
              disabled={currentPage === meta.totalPages || meta.totalData === 0}
            >
              {">"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArmadaPage;
