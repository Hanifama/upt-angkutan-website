import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Table,
  Button,
  Input,
  Tag,
  Spin,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useDriverStore } from "../../../store/useDriverStore";
import CustomModal from "../../../components/_shared/CustomModal";
import type { Driver } from "../../../interfaces/driver";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const PengemudiPage: React.FC = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const {
    drivers,
    fetchDrivers,
    statistics,
    fetchDriverStatistics,
    deleteDriver,
    meta,
    isLoading,
  } = useDriverStore();

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [messageApi, contextHolder] = message.useMessage();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Build params untuk fetch
  const buildParams = () => {
    const params: any = {};

    if (filterStatus && filterStatus !== "Semua Status") {
      params.status = filterStatus.toLowerCase();
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    return params;
  };

  // Fetch data initial
  useEffect(() => {
    if (!hasFetched.current) {
      const params = buildParams();
      fetchDrivers(currentPage, pageSize, params);
      fetchDriverStatistics();
      hasFetched.current = true;
    }
  }, []);

  // Fetch data ketika filter/search berubah
  useEffect(() => {
    const params = buildParams();
    fetchDrivers(1, pageSize, params);
    setCurrentPage(1);
  }, [filterStatus, pageSize]);

  // Debounce untuk search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const params = buildParams();
      await fetchDrivers(1, pageSize, params);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch data ketika pagination berubah
  useEffect(() => {
    const params = buildParams();
    fetchDrivers(currentPage, pageSize, params);
  }, [currentPage]);

  const handleDelete = async (driverId: string) => {
    try {
      await deleteDriver(driverId);
      messageApi.success("Data pengemudi berhasil dihapus!", 2);

      // Refresh data setelah delete
      const params = buildParams();
      const newPage =
        drivers.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);
      fetchDrivers(newPage, pageSize, params);
    } catch (error: any) {
      messageApi.error(error.message || "Gagal menghapus data pengemudi.", 2);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDriverId) return;
    await handleDelete(selectedDriverId);
    setModalVisible(false);
    setSelectedDriverId(null);
  };

  const handleDeleteClick = (driverId: string) => {
    setSelectedDriverId(driverId);
    setModalVisible(true);
  };

  const reverseSimMapping: Record<string, string> = {
    SIM_A: "A",
    SIM_B1: "B1",
    SIM_B2: "B2",
    SIM_C1: "C1",
    SIM_C2: "C2",
    SIM_D: "D",
  };

  const simColorMapping: Record<string, string> = {
    SIM_A: "blue",
    SIM_B1: "green",
    SIM_B2: "cyan",
    SIM_C1: "orange",
    SIM_C2: "magenta",
    SIM_D: "purple",
  };

  const columns: ColumnsType<Driver> = [
    {
      title: "No Pegawai",
      dataIndex: "nomorPegawai",
      key: "nomorPegawai",
    },
    {
      title: "Nama",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
    },
    {
      title: "Usia",
      dataIndex: "umur",
      key: "umur",
    },
    {
      title: "Pendidikan",
      dataIndex: "pendidikanTerakhir",
      key: "pendidikanTerakhir",
    },
    {
      title: "SIM",
      key: "sim",
      render: (_, record) => {
        if (!record.simData || record.simData.length === 0) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {record.simData.map((sim, index) => {
              const readableSim =
                reverseSimMapping[sim.jenisSim] || sim.jenisSim;
              const color = simColorMapping[sim.jenisSim] || "default";
              return (
                <Tag color={color} key={index}>
                  SIM {readableSim}
                </Tag>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Masa Berlaku SIM",
      key: "masaBerlakuSim",
      render: (_, record) => {
        if (!record.simData || record.simData.length === 0) return "-";
        return (
          <div className="flex flex-col gap-1">
            {record.simData.map((sim, index) => {
              const color = simColorMapping[sim.jenisSim] || "default";
              const readableSim =
                reverseSimMapping[sim.jenisSim] || sim.jenisSim;
              return (
                <Tag color={color} key={index}>
                  SIM {readableSim}:{" "}
                  {new Date(sim.simExpiresAt).toLocaleDateString("id-ID")}
                </Tag>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let bgColor = status === "aktif" ? "#D1FAE5" : "#FECACA";
        let textColor = status === "aktif" ? "#059669" : "#B91C1C";
        return (
          <span
            className="px-2 py-1 rounded-full font-semibold text-sm"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {status === "aktif" ? "Aktif" : "Tidak Aktif"}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              navigate(`/dashboard/pengemudi/edit/${record.userId}`)
            }
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDeleteClick(record.userId)}
          />
        </div>
      ),
    },
  ];

  if (isLoading && !hasFetched.current) {
    return <Spin size="large" className="w-full text-center mt-10" />;
  }

  return (
    <div>
      {contextHolder}

      {/* Statistik Pengemudi */}
      <Card title="Statistik Pengemudi" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#2E3192" }}>
                {statistics?.totalPengemudi || 0}
              </p>
              <p className="text-sm text-gray-500">Total Pengemudi</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#2E3192" }}>
                {statistics?.totalPengemudiAktif || 0}
              </p>
              <p className="text-sm text-gray-500">Pengemudi Aktif</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#B91C1C" }}>
                {statistics?.totalPengemudiTidakAktif || 0}
              </p>
              <p className="text-sm text-gray-500">Pengemudi Tidak Aktif</p>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Filter & Tabel */}
      <Card title="Daftar Pengemudi">
        <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            className="flex-1"
            placeholder="Pilih Status"
          >
            <Option value="">Semua Status</Option>
            <Option value="Aktif">Aktif</Option>
            <Option value="Tidak Aktif">Tidak Aktif</Option>
          </Select>

          <Input
            placeholder="Cari berdasarkan nama atau nomor pegawai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            allowClear
          />
        </div>

        {/* Badge filter aktif */}
        <div className="mb-4 flex gap-2 text-sm flex-wrap">
          {filterStatus && (
            <Tag
              closable
              onClose={() => setFilterStatus("")}
              closeIcon={<CloseCircleOutlined />}
              color="blue"
            >
              Status: {filterStatus}
            </Tag>
          )}
          {searchTerm && (
            <Tag
              closable
              onClose={() => setSearchTerm("")}
              closeIcon={<CloseCircleOutlined />}
              color="green"
            >
              Pencarian: {searchTerm}
            </Tag>
          )}
        </div>

        <Table
          dataSource={drivers}
          columns={columns}
          pagination={false}
          rowKey="userId"
          loading={isLoading}
          locale={{ emptyText: "Data tidak ditemukan" }}
        />

        <CustomModal
          visible={modalVisible}
          title="Konfirmasi Hapus"
          content="Apakah Anda yakin ingin menghapus pengemudi ini?"
          onOk={handleConfirmDelete}
          onCancel={() => setModalVisible(false)}
        />

        {/* Custom Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm flex-wrap gap-4">
          <div>
            Menampilkan {Math.min(meta.totalData, 1)}-
            {Math.min(currentPage * pageSize, meta.totalData)} dari{" "}
            {meta.totalData} data
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Baris per halaman:</span>
              <Select
                value={pageSize}
                onChange={(value) => {
                  setPageSize(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 50, label: "50" },
                ]}
                style={{ width: 80 }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {"<"}
              </Button>
              <span>
                Halaman {currentPage} dari {meta.totalPages || 1}
              </span>
              <Button
                size="small"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={
                  currentPage === meta.totalPages || meta.totalData === 0
                }
              >
                {">"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PengemudiPage;
