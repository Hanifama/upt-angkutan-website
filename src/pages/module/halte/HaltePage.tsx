import React, { useEffect, useState } from "react";
import { 
  Card, 
  Select, 
  Table, 
  Button, 
  Input, 
  Tag, 
  message, 
  Space,
  Popconfirm 
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  CloseCircleOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined 
} from "@ant-design/icons";
import { useHalteStore } from "../../../store/useHalteStore";
import { useLayananStore } from "../../../store/useLayananStore";
import type { Halte } from "../../../interfaces/halte";
import { useRouteStore } from "../../../store/useRoutesStore";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const HaltePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    halte, 
    meta, 
    isLoading, 
    fetchHalteList,
    deleteHalte 
  } = useHalteStore();
  const { layanan, fetchLayanan } = useLayananStore();
  const { routes, fetchRoutes } = useRouteStore();

  // Filters
  const [selectedLayanan, setSelectedLayanan] = useState<string>("");
  const [selectedRute, setSelectedRute] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Pagination
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading untuk delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = () => {
    fetchHalteList({
      routeId: selectedRute,
      layananId: selectedLayanan,
      search,
      page: currentPage,
      limit: pageSize,
    });
  };

  // Load data awal
  useEffect(() => {
    fetchLayanan();
  }, []);

  // Fetch rute berdasarkan layananId
  useEffect(() => {
    if (selectedLayanan) {
      fetchRoutes({ layananId: selectedLayanan });
    }
  }, [selectedLayanan]);

  // Refresh halte list
  useEffect(() => {
    fetchData();
  }, [selectedLayanan, selectedRute, search, currentPage, pageSize]);

  // Handle Delete Halte
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteHalte(id);
      messageApi.success("Halte berhasil dihapus");
      // Jika setelah delete data habis di halaman ini, kembali ke halaman sebelumnya
      if (halte.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: any) {
      messageApi.error(error.message || "Gagal menghapus halte");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Edit Halte
  const handleEdit = (id: string) => {
    navigate(`/dashboard/halte/edit/${id}`);
  };

  // Handle View Detail
  const handleView = (id: string) => {
    navigate(`/dashboard/halte/detail/${id}`);
  };

  const columns: ColumnsType<Halte> = [
    {
      title: "No",
      width: 60,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Nama Halte",
      dataIndex: "nama",
      width: 180,
    },
    {
      title: "Layanan",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-1 flex-wrap">
          {record.layanan?.map((l) => (
            <Tag key={l.id} color="blue">
              {l.nama}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Rute",
      width: 200,
      render: (_, record) => (
        <div className="flex gap-1 flex-wrap">
          {record.routes?.map((r) => (
            <Tag key={r.id} color="green">
              {r.nama}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      width: 120,
      render: (_, record) => (
        <span
          className={`px-2 py-1 rounded-md text-sm font-medium ${
            record.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {record.status ? "Aktif" : "Non Aktif"}
        </span>
      ),
    },
    {
      title: "Aksi",
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {/* <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            title="Lihat Detail"
          /> */}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            title="Edit"
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Hapus Halte"
            description="Apakah Anda yakin ingin menghapus halte ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
            okButtonProps={{ danger: true, loading: deletingId === record.id }}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
              danger
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}

      <Card title="Daftar Halte">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FILTER LAYANAN */}
          <Select
            placeholder="Pilih Layanan"
            value={selectedLayanan || undefined}
            onChange={(val) => {
              setSelectedLayanan(val);
              setSelectedRute([]);
              setCurrentPage(1);
            }}
            virtual={false}
            allowClear
            onClear={() => {
              setSelectedLayanan("");
              setSelectedRute([]);
            }}
          >
            {layanan.map((l) => (
              <Option key={l.id} value={l.id}>
                {l.nama}
              </Option>
            ))}
          </Select>

          {/* FILTER RUTE */}
          <Select
            mode="multiple"
            placeholder="Filter Rute"
            value={selectedRute}
            disabled={!selectedLayanan}
            onChange={(val) => {
              setSelectedRute(val);
              setCurrentPage(1);
            }}
            virtual={false}
            allowClear
          >
            {routes.map((r) => (
              <Option key={r.routeId} value={r.routeId}>
                {r.routeName}
              </Option>
            ))}
          </Select>

          <Input.Search
            placeholder="Cari halte..."
            allowClear
            onSearch={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            onChange={(e) => {
              if (!e.target.value) {
                setSearch("");
                setCurrentPage(1);
              }
            }}
          />
        </div>

        {/* TAGS */}
        <div className="flex gap-2 flex-wrap mt-3">
          {/* tag layanan */}
          {selectedLayanan && (
            <Tag
              color="blue"
              closable
              onClose={() => setSelectedLayanan("")}
              closeIcon={<CloseCircleOutlined />}
            >
              {layanan.find((l) => l.id === selectedLayanan)?.nama}
            </Tag>
          )}

          {/* tag rute */}
          {selectedRute.map((id) => (
            <Tag
              key={id}
              color="green"
              closable
              onClose={() =>
                setSelectedRute(selectedRute.filter((x) => x !== id))
              }
              closeIcon={<CloseCircleOutlined />}
            >
              {routes.find((r) => r.routeId === id)?.routeName}
            </Tag>
          ))}
        </div>

        <Table
          dataSource={halte}
          columns={columns}
          pagination={false}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: "Data halte tidak ditemukan" }}
        />

        {/* Pagination */}
        <div className="flex justify-end gap-4 mt-4 text-sm">
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
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
          <Button
            size="small"
            onClick={() =>
              setCurrentPage((p) => (p < meta.totalPages ? p + 1 : p))
            }
            disabled={currentPage === meta.totalPages}
          >
            {">"}
          </Button>

          <Select
            value={pageSize}
            onChange={(v) => {
              setPageSize(v);
              setCurrentPage(1);
            }}
            style={{ width: 80 }}
            options={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};

export default HaltePage;