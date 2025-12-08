import React, { useEffect, useMemo, useState } from "react";
import { Table, Select, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { SurveyLapanganStatis } from "../../../../interfaces/surveyLapangan";
import { useSurveyLapanganStore } from "../../../../store/useSurveyLapangan";
import { useLayananStore } from "../../../../store/useLayananStore";

const CustomTableSurveyStatis: React.FC = () => {
  const { surveyLapanganStatis, fetchSurveyLapangan } =
    useSurveyLapanganStore();

  const { layanan, fetchLayanan } = useLayananStore();
  const [layananId, setLayananId] = useState<string | null>(null);
  const [bulan, setBulan] = useState<any>(null);
  const [tahun, setTahun] = useState<any>(null);

  /** Ambil daftar layanan saat komponen pertama kali dimuat */
  useEffect(() => {
    fetchLayanan();
  }, [fetchLayanan]);

  /** Fetch data survey saat layanan dipilih */
  useEffect(() => {
    if (layananId) {
      fetchSurveyLapangan("STATIS", layananId);
    }
  }, [layananId, fetchSurveyLapangan]);

  /** Kolom Tabel — disesuaikan dengan struktur data statis */
  const columns: ColumnsType<SurveyLapanganStatis> = [
    {
      title: "Tanggal Survey",
      dataIndex: "tanggalSurvey",
      key: "tanggalSurvey",
      width: 130,
      fixed: "left",
      render: (val) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Kendaraan",
      children: [
        {
          title: "Layanan",
          key: "layanan",
          width: 160,
          render: (_, record) => record.layanan?.nama || "-",
        },
        {
          title: "No. Polisi",
          dataIndex: "noPlat",
          key: "noPlat",
          width: 120,
        },
        {
          title: "Rute",
          key: "rute",
          width: 200,
          render: (_, record) => record.rute?.id || "-",
        },
      ],
    },
    {
      title: "Penanggung Jawab",
      dataIndex: "namaPenanggungJawab",
      key: "namaPenanggungJawab",
      width: 180,
    },
    {
      title: "Titik Lokasi",
      dataIndex: "namaTitikLokasi",
      key: "namaTitikLokasi",
      width: 160,
    },
    {
      title: "Waktu",
      children: [
        {
          title: "Datang",
          dataIndex: "waktuKedatangan",
          key: "waktuKedatangan",
          width: 120,
          render: (val) => val || "-",
        },
        {
          title: "Berangkat",
          dataIndex: "waktuKeberangkatan",
          key: "waktuKeberangkatan",
          width: 120,
          render: (val) => val || "-",
        },
      ],
    },
    {
      title: "Jumlah Penumpang",
      dataIndex: "jumlahPenumpang",
      key: "jumlahPenumpang",
      width: 150,
      render: (val) => val ?? "-",
    },
    // 🚧 Kolom berikut dikomentari dulu karena datanya belum ada di response
    // {
    //   title: "Kapasitas",
    //   dataIndex: "kapasitas",
    //   key: "kapasitas",
    //   width: 120,
    // },
    // {
    //   title: "Load Factor (%)",
    //   dataIndex: "loadFactor",
    //   key: "loadFactor",
    //   width: 150,
    // },
    // {
    //   title: "Headway",
    //   dataIndex: "headway",
    //   key: "headway",
    //   width: 130,
    // },
    // {
    //   title: "Lay Over Time",
    //   dataIndex: "layOverTime",
    //   key: "layOverTime",
    //   width: 150,
    // },
  ];

  /** Data hasil filter (sementara hanya by bulan/tahun) */
  const filteredData = useMemo(() => {
    return surveyLapanganStatis.filter((item) => {
      const itemDate = dayjs(item.tanggalSurvey);
      const matchBulan = bulan ? itemDate.month() === bulan.month() : true;
      const matchTahun = tahun ? itemDate.year() === tahun.year() : true;
      return matchBulan && matchTahun;
    });
  }, [surveyLapanganStatis, bulan, tahun]);

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        {/* Semua Layanan */}
        <Select
          value={layananId || undefined}
          onChange={setLayananId}
          placeholder="Pilih Layanan"
          className="flex-1 min-w-[150px]"
          options={[
            { value: "all", label: "Semua Layanan" },
            ...layanan.map((item) => ({
              value: item.id,
              label: item.nama,
            })),
          ]}
        />

        {/* Semua Bulan */}
        <DatePicker
          picker="month"
          format="MMMM"
          placeholder="Semua Bulan"
          value={bulan}
          onChange={setBulan}
          className="flex-1 min-w-[150px]"
        />

        {/* Semua Tahun */}
        <DatePicker
          picker="year"
          format="YYYY"
          placeholder="Semua Tahun"
          value={tahun}
          onChange={setTahun}
          className="flex-1 min-w-[150px]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          bordered={false}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="
            bg-transparent
            [&_.ant-table-thead]:bg-transparent
            [&_.ant-table-thead>tr>th]:py-2
            [&_.ant-table-thead>tr>th]:px-3
            [&_.ant-table-thead>tr>th]:text-xs
            [&_.ant-table-cell]:py-2
            [&_.ant-table-cell]:px-3
            [&_.ant-table-cell]:text-xs
          "
        />
      </div>
    </div>
  );
};

export default CustomTableSurveyStatis;
