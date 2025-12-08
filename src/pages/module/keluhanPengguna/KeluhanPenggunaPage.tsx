import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tag, Spin, Button, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseCircleOutlined } from "@ant-design/icons";

import { useKeluhanPenggunaStore } from "../../../store/useKeluhanPenggunaStore";
import type { KeluhanPengguna } from "../../../interfaces/keluhanPengguna";

const KeluhanPenggunaPage: React.FC = () => {
  const { keluhanPengguna, meta, isLoading, error, fetchKeluhanPengguna } =
    useKeluhanPenggunaStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce input search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1); // reset halaman saat search baru
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch data hanya saat page, pageSize, atau debouncedSearch berubah
  useEffect(() => {
    fetchKeluhanPengguna(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, debouncedSearch, fetchKeluhanPengguna]);

  // Kolom tabel
  const columns: ColumnsType<KeluhanPengguna> = [
    {
      title: "No",
      dataIndex: "id",
      key: "id",
      width: 70,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Nama Lengkap", dataIndex: "namaLengkap", key: "namaLengkap" },
    {
      title: "Layanan Transportasi",
      dataIndex: "jenisLayanan",
      key: "jenisLayanan",
    },
    {
      title: "Tanggal Kejadian",
      dataIndex: "tanggalKejadian",
      key: "tanggalKejadian",
      align: "center",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      render: (text) => (
        <span className="text-gray-700 line-clamp-2">{text}</span>
      ),
    },
  ];

  return (
    <div>
      <Card title="Daftar Keluhan Pengguna">
        {/* Search input */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
          <Input
            placeholder="Cari nama pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Badge pencarian aktif */}
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

        {/* Loading & Error */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <>
            <Table
              dataSource={keluhanPengguna}
              columns={columns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: "Tidak ada data ditemukan" }}
            />

            {/* Custom Pagination */}
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
    </div>
  );
};

export default KeluhanPenggunaPage;
