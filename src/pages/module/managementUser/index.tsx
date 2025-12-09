import React, { useState } from "react";
import {
    Card,
    Table,
    Button,
    Input,
    Tag,
    message,
    Space,
    Popconfirm,
    Avatar,
    Badge,
    Select,
    Row,
    Col,
    DatePicker,
    Modal,
    Form,
    Upload,
    Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    SearchOutlined,
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    FilterOutlined,
    DownloadOutlined,
    UploadOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    HomeOutlined,
    KeyOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Interface untuk data user
interface UserData {
    userId: string;
    namaLengkap: string;
    email: string;
    tanggalLahir: string;
    umur: number;
    nomorTelepon: string;
    role: string;
    alamat: string;
    avatar: string | null;
    isActive: boolean;
    deletedAt: string | null;
    status: string | null;
    createdAt: string;
    updatedAt: string;
}

// Data dummy sesuai response API
const dummyUsers: UserData[] = [
    {
        userId: "user-7e239401-838c-45a5-a28d-9a3bf436f014",
        namaLengkap: "Koperasi",
        email: "koperasiupt2@upt.id",
        tanggalLahir: "1999-07-14T17:00:00.000Z",
        umur: 26,
        nomorTelepon: "+628514561433",
        role: "koperasi",
        alamat: "Jl. Soekarno-Hatta No.205, Situsaeur, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40233",
        avatar: null,
        isActive: true,
        deletedAt: null,
        status: null,
        createdAt: "2025-12-07T20:51:27.836Z",
        updatedAt: "2025-12-07T20:51:27.836Z",
    },
    {
        userId: "user-c6193d87-16b9-4515-8b3a-afd70ae734cc",
        namaLengkap: "Koperasi Updated",
        email: "koperasiupt@upt.id",
        tanggalLahir: "1999-07-14T17:00:00.000Z",
        umur: 26,
        nomorTelepon: "+621234567891011",
        role: "koperasi",
        alamat: "Jl. Soekarno-Hatta No.205, Situsaeur, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40233",
        avatar: "https://api-bemo-dev.lskk.co.id/files/1763526300776-702836425-icons.png",
        isActive: true,
        deletedAt: null,
        status: null,
        createdAt: "2025-10-19T20:18:14.456Z",
        updatedAt: "2025-11-18T21:25:17.675Z",
    },
    {
        userId: "user-f5906ef9-cfd9-45a7-8b0d-ba356f00135e",
        namaLengkap: "Admin UPT Manajemen Angkutan",
        email: "adminupt@upt.id",
        tanggalLahir: "1999-07-14T17:00:00.000Z",
        umur: 26,
        nomorTelepon: "+6285145671243",
        role: "admin-upt",
        alamat: "Jl. Soekarno-Hatta No.205, Situsaeur, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40233",
        avatar: "https://api-bemo-dev.lskk.co.id/files/1764598772820-917179056-imagedishub.jpeg",
        isActive: true,
        deletedAt: null,
        status: null,
        createdAt: "2025-10-19T20:16:58.318Z",
        updatedAt: "2025-12-01T07:19:50.809Z",
    },
    {
        userId: "user-8d239401-838c-45a5-a28d-9a3bf436f015",
        namaLengkap: "Operator Transport",
        email: "operator@upt.id",
        tanggalLahir: "1995-03-22T17:00:00.000Z",
        umur: 30,
        nomorTelepon: "+628123456789",
        role: "operator",
        alamat: "Jl. Merdeka No.123, Kota Bandung",
        avatar: null,
        isActive: false,
        deletedAt: null,
        status: "Pending",
        createdAt: "2025-11-01T10:30:00.000Z",
        updatedAt: "2025-11-15T14:20:00.000Z",
    },
    {
        userId: "user-9e239401-838c-45a5-a28d-9a3bf436f016",
        namaLengkap: "Super Admin",
        email: "superadmin@upt.id",
        tanggalLahir: "1988-12-01T17:00:00.000Z",
        umur: 36,
        nomorTelepon: "+628987654321",
        role: "super-admin",
        alamat: "Jl. Sudirman No.45, Jakarta",
        avatar: "https://api-bemo-dev.lskk.co.id/files/1764598772820-917179056-profile.jpg",
        isActive: true,
        deletedAt: null,
        status: "Verified",
        createdAt: "2025-09-10T08:15:00.000Z",
        updatedAt: "2025-12-05T09:45:00.000Z",
    },
];

// Meta data dummy
const dummyMeta = {
    totalPages: 1,
    totalData: 5,
    totalDataPerPage: 5,
    page: 1,
    limit: 10,
};

// Role options dengan warna
const roleOptions = [
    { value: "super-admin", label: "Super Admin", color: "red" },
    { value: "admin-upt", label: "Admin UPT", color: "blue" },
    { value: "koperasi", label: "Koperasi", color: "green" },
    { value: "operator", label: "Operator", color: "orange" },
    { value: "driver", label: "Driver", color: "purple" },
    { value: "passenger", label: "Passenger", color: "cyan" },
];

const UserManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    // State management
    const [users] = useState<UserData[]>(dummyUsers);
    const [meta] = useState(dummyMeta);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filter states
    const [searchText, setSearchText] = useState("");
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Modal states
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [form] = Form.useForm();

    // Pagination
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter users berdasarkan kriteria
    const filteredUsers = users.filter(user => {
        // Filter search text
        if (searchText && !user.namaLengkap.toLowerCase().includes(searchText.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchText.toLowerCase()) &&
            !user.nomorTelepon.includes(searchText)) {
            return false;
        }

        // Filter role
        if (selectedRole && user.role !== selectedRole) {
            return false;
        }

        // Filter status aktif
        if (selectedStatus === "active" && !user.isActive) {
            return false;
        }
        if (selectedStatus === "inactive" && user.isActive) {
            return false;
        }

        // Filter date range
        if (dateRange) {
            const [start, end] = dateRange;
            const createdAt = dayjs(user.createdAt);
            if (createdAt.isBefore(start) || createdAt.isAfter(end)) {
                return false;
            }
        }

        return true;
    });

    // Paginated users
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleDelete = async (userId: string) => {
        try {
            setDeletingId(userId);
            // Simulasi API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            messageApi.success("Pengguna berhasil dihapus!");
        } catch (error) {
            messageApi.error("Gagal menghapus pengguna!");
        } finally {
            setDeletingId(null);
        }
    };

    // Di bagian handle actions
    const handleAddUser = () => {
        // Navigasi ke halaman tambah user
        navigate("/dashboard/users/tambah");
    };

    const handleEdit = (user: UserData) => {
        // Navigasi ke halaman edit dengan parameter userId
        navigate(`/dashboard/users/edit/${user.userId}`);
    };

    const handleViewDetail = (user: UserData) => {
        // Navigasi ke halaman detail
        navigate(`/dashboard/users/detail/${user.userId}`);
    };

    const handleFormSubmit = async (values: any) => {
        try {
            setLoading(true);
            // Simulasi API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (isAddModalVisible) {
                messageApi.success("Pengguna berhasil ditambahkan!");
            } else {
                messageApi.success("Pengguna berhasil diperbarui!");
            }

            setIsAddModalVisible(false);
            setIsEditModalVisible(false);
            form.resetFields();
        } catch (error) {
            messageApi.error("Terjadi kesalahan!");
        } finally {
            setLoading(false);
        }
    };

    // Columns definition
    const columns: ColumnsType<UserData> = [
        {
            title: "No",
            width: 60,
            render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: "User",
            width: 200,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar
                        size="large"
                        src={record.avatar}
                        icon={!record.avatar && <UserOutlined />}
                        style={{ backgroundColor: record.isActive ? '#1890ff' : '#ccc' }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.namaLengkap}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Role",
            width: 120,
            render: (_, record) => {
                const roleOption = roleOptions.find(r => r.value === record.role);
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
                    <div style={{ fontSize: 12, color: '#666' }}>
                        <PhoneOutlined /> {record.nomorTelepon}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        <CalendarOutlined /> {record.umur} tahun
                    </div>
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
                        <span style={{ color: record.isActive ? '#52c41a' : '#ff4d4f' }}>
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
                    {dayjs(record.createdAt).format('DD/MM/YYYY')}
                </div>
            ),
        },
        {
            title: "Aksi",
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Edit"
                        style={{ color: '#1890ff' }}
                    />
                    <Popconfirm
                        title="Hapus Pengguna"
                        description="Apakah Anda yakin ingin menghapus pengguna ini?"
                        onConfirm={() => handleDelete(record.userId)}
                        okText="Ya"
                        cancelText="Tidak"
                        okButtonProps={{ danger: true, loading: deletingId === record.userId }}
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={deletingId === record.userId}
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

            {/* Filter Section */}
            <Card title={
                <div className="flex items-center gap-2">
                    <FilterOutlined />
                    <span>Filter Data</span>
                </div>
            }>
                <Row gutter={[16, 16]}>
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
                            style={{ width: '100%' }}
                            value={selectedRole}
                            onChange={setSelectedRole}
                            allowClear
                        >
                            {roleOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <Tag color={option.color}>{option.label}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Status Aktif"
                            style={{ width: '100%' }}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            allowClear
                        >
                            <Option value="active">Aktif</Option>
                            <Option value="inactive">Nonaktif</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={4}>
                        <Button
                            block
                            onClick={() => {
                                setSearchText("");
                                setSelectedRole(null);
                                setSelectedStatus(null);
                                setDateRange(null);
                            }}
                        >
                            Reset Filter
                        </Button>
                    </Col>
                </Row>

                {/* Active Filters Tags */}
                {(searchText || selectedRole || selectedStatus || dateRange) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {searchText && (
                            <Tag closable onClose={() => setSearchText("")}>
                                Pencarian: {searchText}
                            </Tag>
                        )}
                        {selectedRole && (
                            <Tag
                                closable
                                onClose={() => setSelectedRole(null)}
                                color={roleOptions.find(r => r.value === selectedRole)?.color}
                            >
                                Role: {roleOptions.find(r => r.value === selectedRole)?.label}
                            </Tag>
                        )}
                        {selectedStatus && (
                            <Tag closable onClose={() => setSelectedStatus(null)}>
                                Status: {selectedStatus === "active" ? "Aktif" : "Nonaktif"}
                            </Tag>
                        )}
                        {dateRange && (
                            <Tag closable onClose={() => setDateRange(null)}>
                                Periode: {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
                            </Tag>
                        )}
                    </div>
                )}
            </Card>

            {/* Data Table */}
            <Card>
                <Table
                    dataSource={paginatedUsers}
                    columns={columns}
                    rowKey="userId"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filteredUsers.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'],
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

            {/* Modals */}
            {/* Modal Detail */}
            <Modal
                title="Detail Pengguna"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Tutup
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            if (selectedUser) {
                                handleEdit(selectedUser);
                                setIsDetailModalVisible(false);
                            }
                        }}
                    >
                        Edit Pengguna
                    </Button>,
                ]}
                width={600}
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar
                                size={64}
                                src={selectedUser.avatar}
                                icon={!selectedUser.avatar && <UserOutlined />}
                                style={{ backgroundColor: selectedUser.isActive ? '#1890ff' : '#ccc' }}
                            />
                            <div>
                                <h3 className="text-lg font-bold">{selectedUser.namaLengkap}</h3>
                                <div className="flex items-center gap-2">
                                    <Tag color={roleOptions.find(r => r.value === selectedUser.role)?.color}>
                                        {roleOptions.find(r => r.value === selectedUser.role)?.label}
                                    </Tag>
                                    <Badge
                                        status={selectedUser.isActive ? "success" : "error"}
                                        text={selectedUser.isActive ? "Aktif" : "Nonaktif"}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MailOutlined />
                                    <span className="font-medium">Email:</span>
                                </div>
                                <div>{selectedUser.email}</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <PhoneOutlined />
                                    <span className="font-medium">Telepon:</span>
                                </div>
                                <div>{selectedUser.nomorTelepon}</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CalendarOutlined />
                                    <span className="font-medium">Umur:</span>
                                </div>
                                <div>{selectedUser.umur} tahun</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <KeyOutlined />
                                    <span className="font-medium">User ID:</span>
                                </div>
                                <div className="text-xs font-mono">{selectedUser.userId}</div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <HomeOutlined />
                                <span className="font-medium">Alamat:</span>
                            </div>
                            <div>{selectedUser.alamat}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-gray-600 font-medium">Dibuat:</div>
                                <div>{dayjs(selectedUser.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                            </div>
                            <div>
                                <div className="text-gray-600 font-medium">Diperbarui:</div>
                                <div>{dayjs(selectedUser.updatedAt).format('DD/MM/YYYY HH:mm')}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Add/Edit */}
            <Modal
                title={isAddModalVisible ? "Tambah Pengguna Baru" : "Edit Pengguna"}
                open={isAddModalVisible || isEditModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    setIsEditModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={loading}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    autoComplete="off"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Nama Lengkap"
                                name="namaLengkap"
                                rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
                            >
                                <Input placeholder="Masukkan nama lengkap" prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Email wajib diisi' },
                                    { type: 'email', message: 'Format email tidak valid' }
                                ]}
                            >
                                <Input placeholder="user@example.com" prefix={<MailOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Nomor Telepon"
                                name="nomorTelepon"
                                rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
                            >
                                <Input placeholder="+628123456789" prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tanggal Lahir"
                                name="tanggalLahir"
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Role"
                                name="role"
                                rules={[{ required: true, message: 'Role wajib dipilih' }]}
                            >
                                <Select placeholder="Pilih role">
                                    {roleOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Status"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Aktif"
                                    unCheckedChildren="Nonaktif"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Alamat"
                        name="alamat"
                        rules={[{ required: true, message: 'Alamat wajib diisi' }]}
                    >
                        <TextArea rows={3} placeholder="Masukkan alamat lengkap" />
                    </Form.Item>

                    <Form.Item label="Avatar (Opsional)" name="avatar">
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            accept="image/*"
                            beforeUpload={() => false}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;