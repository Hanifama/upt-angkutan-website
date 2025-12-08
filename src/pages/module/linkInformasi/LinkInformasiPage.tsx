import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Input, Tag, message, Spin, Button, Select } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

import CustomModal from "../../../components/_shared/CustomModal";

import { useLinkInformasiStore } from "../../../store/useLinkInformasiStore";
import { createLinkInformasiColumns } from "./table/linkInformasiColumns";

const LinkInformasiPage: React.FC = () => {
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Zustand store state and actions
  const {
    linkInformasi,
    fetchLinkInformasi,
    deleteLinkInformasi,
    isLoading,
    error,
    meta,
  } = useLinkInformasiStore();

  // Initial data fetch on component mount
  useEffect(() => {
    if (!hasFetched.current) {
      fetchLinkInformasi(currentPage, pageSize, searchTerm);
      hasFetched.current = true;
    }
  }, [fetchLinkInformasi, currentPage, pageSize, searchTerm]);

  // Handler for deleting a link informasi item
  const handleDelete = async (id: string) => {
    try {
      await deleteLinkInformasi(id);
      messageApi.success("Data link informasi berhasil dihapus!", 2);
      fetchLinkInformasi(currentPage, pageSize, searchTerm);
    } catch (error: any) {
      messageApi.error(error.message || "Gagal menghapus data.", 2);
    }
  };

  // Confirm deletion from modal
  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    await handleDelete(selectedId);
    setModalVisible(false);
    setSelectedId(null);
  };

  // Open modal to confirm deletion
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setModalVisible(true);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLinkInformasi(1, pageSize, searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchLinkInformasi, pageSize]);

  // Define table columns
  const columns = createLinkInformasiColumns({
    currentPage,
    pageSize,
    navigate,
    handleDeleteClick,
  });

  return (
    <div>
      {contextHolder}
      <Card title="Daftar Link Informasi">
        {/* Search input for filtering data */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
          <Input
            placeholder="Cari label informasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Active search tag */}
        {searchTerm && (
          <div className="mb-4">
            <Tag
              closable
              onClose={() => setSearchTerm("")}
              closeIcon={<CloseCircleOutlined />}
              color="purple"
            >
              Cari: {searchTerm}
            </Tag>
          </div>
        )}

        {/* Data table with loading and error handling */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-6">{error}</p>
        ) : (
          <>
            <Table
              dataSource={linkInformasi}
              columns={columns}
              pagination={false}
              rowKey="id"
              locale={{ emptyText: "Tidak ada data ditemukan" }}
            />

            {/* Custom Pagination - Sama seperti di Armada dan Pengemudi */}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                  disabled={
                    currentPage === meta.totalPages || meta.totalData === 0
                  }
                >
                  {">"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modal confirmation for deletion */}
      <CustomModal
        visible={modalVisible}
        title="Konfirmasi Hapus"
        content="Apakah Anda yakin ingin menghapus data ini?"
        onOk={handleConfirmDelete}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default LinkInformasiPage;
