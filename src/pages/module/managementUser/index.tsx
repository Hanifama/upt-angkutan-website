import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Tag,
  message,
  Space,
  Badge,
  Select,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  CalendarOutlined,
  RestOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../../store/useUserStore";
import CustomModal from "../../../components/_shared/CustomModal";

const { Option } = Select;

// Role options dengan warna
const roleOptions = [
  { value: "admin-upt", label: "Admin UPT", color: "blue" },
  { value: "koperasi", label: "Operator Transportasi", color: "green" },
];

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Store integration
  const {
    users,
    meta,
    isLoading,
    filterRole,
    filterStatus,
    searchText,
    fetchUsers,
    deleteUser,
    restoreUser,
    setFilterRole,
    setFilterStatus,
    setSearchText,
  } = useUserStore();

  // Local states
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"delete" | "restore">("delete");

  // Load users on component mount and filter changes
  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, filterRole, filterStatus, searchText]);

  const loadUsers = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };

      // Default: hanya admin-upt & koperasi
      if (filterRole === "Semua Role") {
        params.role = ["admin-upt", "koperasi"];
      } else {
        params.role = filterRole;
      }

      if (filterStatus !== "Semua Status") {
        params.isActive = filterStatus === "Aktif";
      }

      if (searchText) {
        params.search = searchText;
      }

      await fetchUsers(params);
    } catch (error) {
      messageApi.error("Gagal memuat data pengguna");
    }
  };

  const showDeleteModal = (userId: string) => {
    setSelectedUserId(userId);
    setActionType("delete");
    setModalVisible(true);
  };

  const showRestoreModal = (userId: string) => {
    setSelectedUserId(userId);
    setActionType("restore");
    setModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUserId) return;

    try {
      if (actionType === "delete") {
        setDeletingId(selectedUserId);
        const result = await deleteUser(selectedUserId);
        messageApi.success(result.message);
      } else {
        const result = await restoreUser(selectedUserId);
        messageApi.success(result.message);
      }

      loadUsers(); // Refresh data
    } catch (error: any) {
      messageApi.error(
        error.message ||
          `Gagal ${
            actionType === "delete" ? "menghapus" : "mengembalikan"
          } pengguna!`
      );
    } finally {
      setDeletingId(null);
      setModalVisible(false);
      setSelectedUserId(null);
    }
  };

  const handleEdit = (user: any) => {
    navigate(`/dashboard/management-user/edit/${user.userId}`);
  };

  // Columns definition
  const columns: ColumnsType<any> = [
    {
      title: "No",
      width: 60,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "User",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 500 }}>{record.namaLengkap}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              <CalendarOutlined /> {record.umur} tahun
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      width: 120,
      render: (_, record) => {
        const roleOption = roleOptions.find((r) => r.value === record.role);
        return (
          <Tag color={roleOption?.color || "default"}>
            {roleOption?.label || record.role}
          </Tag>
        );
      },
    },
    {
      title: "Kontak",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: "#666" }}>
            <PhoneOutlined /> {record.nomorTelepon}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: "Status",
      width: 100,
      render: (_, record) => (
        <Badge
          status={record.isActive ? "success" : "error"}
          text={
            <span style={{ color: record.isActive ? "#52c41a" : "#ff4d4f" }}>
              {record.isActive ? "Aktif" : "Nonaktif"}
            </span>
          }
        />
      ),
    },
    {
      title: "Tanggal Dibuat",
      width: 140,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {dayjs(record.createdAt).format("DD/MM/YYYY")}
        </div>
      ),
    },
    {
      title: "Aksi",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
            style={{ color: "#1890ff" }}
          />
          {record.deletedAt ? (
            <Button
              type="text"
              size="small"
              icon={<RestOutlined />}
              onClick={() => showRestoreModal(record.userId)}
              title="Kembalikan"
              style={{ color: "#52c41a" }}
            />
          ) : (
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record.userId)}
              loading={deletingId === record.userId}
              danger
              title="Hapus"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Data Table */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <span>Daftar User</span>
          </div>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Cari nama, email, atau telepon..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Pilih Role"
              style={{ width: "100%" }}
              value={filterRole === "Semua Role" ? null : filterRole}
              onChange={(value) => setFilterRole(value || "Semua Role")}
              allowClear
            >
              <Option value="Semua Role">Semua Role</Option>
              {roleOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Status Aktif"
              style={{ width: "100%" }}
              value={filterStatus === "Semua Status" ? null : filterStatus}
              onChange={(value) => setFilterStatus(value || "Semua Status")}
              allowClear
            >
              <Option value="Semua Status">Semua Status</Option>
              <Option value="Aktif">Aktif</Option>
              <Option value="Nonaktif">Nonaktif</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button
              block
              onClick={() => {
                setSearchText("");
                setFilterRole("Semua Role");
                setFilterStatus("Semua Status");
                setDateRange(null);
                setCurrentPage(1);
              }}
            >
              Reset Filter
            </Button>
          </Col>
        </Row>

        {/* Active Filters Tags */}
        {(searchText ||
          filterRole !== "Semua Role" ||
          filterStatus !== "Semua Status" ||
          dateRange) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchText && (
              <Tag closable onClose={() => setSearchText("")}>
                Pencarian: {searchText}
              </Tag>
            )}
            {filterRole !== "Semua Role" && (
              <Tag
                closable
                onClose={() => setFilterRole("Semua Role")}
                color={roleOptions.find((r) => r.value === filterRole)?.color}
              >
                Role: {roleOptions.find((r) => r.value === filterRole)?.label}
              </Tag>
            )}
            {filterStatus !== "Semua Status" && (
              <Tag closable onClose={() => setFilterStatus("Semua Status")}>
                Status: {filterStatus}
              </Tag>
            )}
          </div>
        )}

        <Table
          dataSource={users}
          columns={columns}
          rowKey="userId"
          loading={isLoading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: meta.totalData,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} pengguna`,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
          }}
          locale={{ emptyText: "Tidak ada data pengguna" }}
        />
      </Card>

      {/* Modal Konfirmasi */}
      <CustomModal
        visible={modalVisible}
        title="Konfirmasi Hapus"
        content="Apakah Anda yakin ingin menghapus data ini?"
        onOk={handleConfirmAction}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default UserManagementPage;
