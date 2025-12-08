import React, { useMemo, useState } from "react";
import { Table, Select, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { SurveyLapanganDinamis } from "../../../../interfaces/surveyLapangan";
import { useSurveyLapanganStore } from "../../../../store/useSurveyLapangan";

const CustomTableSurveyDinamis: React.FC = () => {
  const { surveyLapanganDinamis } = useSurveyLapanganStore();

  const [layanan, setLayanan] = useState<string | null>(null);
  const [bulan, setBulan] = useState<any>(null);
  const [tahun, setTahun] = useState<any>(null);

  const columns: ColumnsType<SurveyLapanganDinamis> = [
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
      title: "Kedatangan",
      children: [
        {
          title: "Waktu Datang",
          dataIndex: "waktuKedatangan",
          key: "waktuKedatangan",
          width: 120,
          render: (val) => val || "-",
        },
        {
          title: "Posisi",
          dataIndex: "namaTitikLokasi",
          key: "namaTitikLokasi",
          width: 150,
          render: (val) => val || "-",
        },
        {
          title: "Waktu Berangkat",
          dataIndex: "waktuKeberangkatan",
          key: "waktuKeberangkatan",
          width: 130,
          render: (val) => val || "-",
        },
        // {
        //   title: "Posisi (Lat,Lng)",
        //   dataIndex: "lokasiKedatangan",
        //   key: "lokasiKedatangan",
        //   width: 180,
        //   render: (val) => (val ? `${val.latitude}, ${val.longitude}` : "-"),
        // },
      ],
    },
    {
      title: "Keberangkatan",
      children: [
        {
          title: "Waktu Berangkat",
          dataIndex: "waktuKeberangkatan",
          key: "waktuKeberangkatan",
          width: 130,
          render: (val) => val || "-",
        },
        {
          title: "Posisi",
          dataIndex: "namaTitikLokasi",
          key: "namaTitikLokasi",
          width: 150,
          render: (val) => val || "-",
        },
        {
          title: "Waktu Datang",
          dataIndex: "waktuKedatangan",
          key: "waktuKedatangan",
          width: 120,
          render: (val) => val || "-",
        },
        // {
        //   title: "Posisi (Lat,Lng)",
        //   dataIndex: "lokasiKeberangkatan",
        //   key: "lokasiKeberangkatan",
        //   width: 180,
        //   render: (val) => (val ? `${val.latitude}, ${val.longitude}` : "-"),
        // },
      ],
    },
    {
      title: "Penumpang",
      children: [
        {
          title: "Naik",
          dataIndex: "jumlahPenumpangNaik",
          key: "jumlahPenumpangNaik",
          width: 130,
          render: (val) => val ?? "-",
        },
        {
          title: "Turun",
          dataIndex: "jumlahPenumpangTurun",
          key: "jumlahPenumpangTurun",
          width: 130,
          render: (val) => val ?? "-",
        },
      ],
    },
    // 🚧 Kolom perhitungan dikomen dulu (belum ada di response backend)
    // {
    //   title: "Waktu Perjalanan (Menit)",
    //   dataIndex: "waktuPerjalananMenit",
    //   key: "waktuPerjalananMenit",
    //   width: 160,
    // },
    // {
    //   title: "Panjang Ruas (Km)",
    //   dataIndex: "panjangRuas",
    //   key: "panjangRuas",
    //   width: 150,
    // },
    // {
    //   title: "Load Factor (%)",
    //   dataIndex: "loadFactor",
    //   key: "loadFactor",
    //   width: 150,
    // },
    // {
    //   title: "Kecepatan (Km/Jam)",
    //   dataIndex: "kecepatan",
    //   key: "kecepatan",
    //   width: 160,
    // },
  ];

  /** 🔹 Filter data berdasarkan bulan & tahun */
  const filteredData = useMemo(() => {
    return surveyLapanganDinamis.filter((item) => {
      const itemDate = dayjs(item.tanggalSurvey);
      const matchBulan = bulan ? itemDate.month() === bulan.month() : true;
      const matchTahun = tahun ? itemDate.year() === tahun.year() : true;
      return matchBulan && matchTahun;
    });
  }, [surveyLapanganDinamis, bulan, tahun]);

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        {/* Semua Layanan */}
        <Select
          value={layanan || undefined}
          onChange={setLayanan}
          placeholder="Semua Layanan"
          className="flex-1 min-w-[150px]"
          options={[
            { value: "all", label: "Semua Layanan" },
            { value: "angkot", label: "Angkot" },
            { value: "bus", label: "Bus Sekolah" },
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

export default CustomTableSurveyDinamis;
