import React, { useEffect, useState } from "react";

import { Card, Row, Col, Select, Table, Button, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import {
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { useRouteStore } from "../../../store/useRoutesStore";
import { useLayananStore } from "../../../store/useLayananStore";

import type { Route, GetRoutesParams } from "../../../interfaces/route";

import CustomModal from "../../../components/_shared/CustomModal";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const RoutePage: React.FC = () => {
  const navigate = useNavigate();

  const {
    routes,
    fetchRoutes,
    deleteRoute,
    statistics,
    fetchRouteStatisticsSummary,
    isLoading,
    meta,
    filterLayanan,
    filterStatus,
    setFilterLayanan,
    setFilterStatus,
  } = useRouteStore();
  const { layanan, fetchLayanan } = useLayananStore();

  // === message context
  const [messageApi, contextHolder] = message.useMessage();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLayanan();
    fetchRouteStatisticsSummary();
  }, [fetchLayanan, fetchRouteStatisticsSummary]);

  useEffect(() => {
    const params: GetRoutesParams = {
      page: currentPage,
      limit: pageSize,
    };

    if (filterLayanan !== "Semua Layanan") params.layananId = filterLayanan;
    if (filterStatus !== "Semua Status")
      params.status = filterStatus === "Aktif" ? "active" : "inactive";
    if (searchTerm) params.search = searchTerm;

    fetchRoutes(params);
  }, [
    filterLayanan,
    filterStatus,
    searchTerm,
    currentPage,
    pageSize,
    fetchRoutes,
  ]);

  const handleDelete = async (routeId: string) => {
    try {
      await deleteRoute(routeId);
      messageApi.success("Data rute berhasil dihapus!", 2);
    } catch (error: any) {
      messageApi.error(error.message || "Gagal menghapus data rute.", 2);
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

  const columns: ColumnsType<Route> = [
    {
      title: "Tanggal",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (createdAt: string) =>
        new Date(createdAt).toISOString().split("T")[0],
    },
    { title: "Route-ID", dataIndex: "routeId", key: "routeId", width: 100 },
    {
      title: "Nama Rute",
      dataIndex: "routeName",
      key: "routeName",
      width: 220,
    },
    {
      title: "Jenis Layanan",
      dataIndex: ["layanan", "nama"],
      key: "layananNama",
      width: 150,
    },
    {
      title: "Panjang (KM)",
      dataIndex: "lengthKm",
      key: "lengthKm",
      width: 120,
    },
    { title: "Tarif (Rp.)", dataIndex: "fare", key: "fare", width: 130 },
    {
      title: "Dokumen",
      key: "dokumen",
      width: 150,
      render: (_, record: Route) =>
        record.dokumenPerwal ? (
          <span className="text-green-800 bg-green-200 font-semibold px-2 py-1 rounded-xl">
            Terlampir
          </span>
        ) : (
          <span className="text-red-800 bg-red-200 font-semibold px-2 py-1 rounded-xl">
            Tidak terlampir
          </span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const color =
          status.toLowerCase() === "active"
            ? { bg: "#D1FAE5", text: "#059669" }
            : { bg: "#FECACA", text: "#B91C1C" };
        return (
          <span
            className="px-2 py-1 rounded-full font-semibold text-sm"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {status.toLowerCase() === "active" ? "Aktif" : "Non-Aktif"}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: any, record: Route) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/dashboard/rute/edit/${record.routeId}`)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDeleteClick(record.routeId)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Card title="Statistik Rute" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#2E3192" }}>
                {statistics?.totalKeseluruhan}
              </p>
              <p className="text-sm text-gray-500">Total Rute</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#2E3192" }}>
                {statistics?.totalAktif}
              </p>
              <p className="text-sm text-gray-500">Rute Aktif</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="text-center">
              <p className="text-2xl font-bold" style={{ color: "red" }}>
                {statistics?.totalTidakAktif}
              </p>
              <p className="text-sm text-gray-500">Rute Non-Aktif</p>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="Informasi Rute">
        <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
          <Select
            value={filterLayanan}
            onChange={(value) => {
              setFilterLayanan(value);
              setCurrentPage(1);
            }}
            className="flex-1"
            virtual={false}
          >
            <Option value="Semua Layanan">Semua Layanan</Option>
            {layanan.map((l) => (
              <Option key={l.id} value={l.id}>
                {l.nama}
              </Option>
            ))}
          </Select>

          <Select
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}
            className="flex-1"
          >
            <Option value="Semua Status">Semua Status</Option>
            <Option value="Aktif">Aktif</Option>
            <Option value="Non-Aktif">Non-Aktif</Option>
          </Select>
        </div>

        <div className="mb-4 flex gap-2 text-sm flex-wrap">
          {filterLayanan !== "Semua Layanan" && (
            <Tag
              closable
              onClose={() => setFilterLayanan("Semua Layanan")}
              closeIcon={<CloseCircleOutlined />}
              color="blue"
            >
              {layanan.find((l) => l.id === filterLayanan)?.nama ||
                filterLayanan}
            </Tag>
          )}
          {filterStatus !== "Semua Status" && (
            <Tag
              closable
              onClose={() => setFilterStatus("Semua Status")}
              closeIcon={<CloseCircleOutlined />}
              color="green"
            >
              {filterStatus}
            </Tag>
          )}
          {searchTerm && (
            <Tag
              closable
              onClose={() => setSearchTerm("")}
              closeIcon={<CloseCircleOutlined />}
              color="purple"
            >
              Cari: {searchTerm}
            </Tag>
          )}
        </div>

        <Table
          dataSource={routes}
          columns={columns}
          pagination={false}
          rowKey="routeId"
          locale={{ emptyText: "Data tidak ditemukan" }}
          scroll={{ x: "max-content" }}
          loading={isLoading}
        />

        <CustomModal
          visible={modalVisible}
          title="Konfirmasi Hapus"
          content="Apakah Anda yakin ingin menghapus rute ini?"
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

export default RoutePage;
