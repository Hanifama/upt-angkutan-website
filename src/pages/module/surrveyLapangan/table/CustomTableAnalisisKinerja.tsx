import React, { useState, useEffect, useMemo } from "react";
import { Table, Select, DatePicker, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useKinerjaTransportasiStore } from "../../../../store/useKinerjaTransportasi";
import type { KinerjaTransportasiItem } from "../../../../interfaces/kinerjaTransportasiList";

type KinerjaTableRow = KinerjaTransportasiItem & {
  _index: number;
};

const AnalisaKinerjaTable: React.FC = () => {
  const [layanan, setLayanan] = useState<string>("all");
  const [bulan, setBulan] = useState<any>(null);
  const [tahun, setTahun] = useState<any>(dayjs().year());

  const [currentPage] = useState(1);
  const pageSize = 10;

  const { kinerjaList, fetchKinerjaList, isLoadingList } =
    useKinerjaTransportasiStore();

  useEffect(() => {
    fetchKinerjaList();
  }, [fetchKinerjaList]);

  // ===================== Data Filtering =====================
  const filteredData = useMemo(() => {
    if (!kinerjaList) return [];

    return kinerjaList.filter((item) => {
      const matchLayanan =
        layanan === "all" ||
        item.namaLayanan.toLowerCase().includes(layanan.toLowerCase());

      const matchBulan = !bulan || item.bulan === dayjs(bulan).format("MM");
      const matchTahun = !tahun || item.tahun === Number(tahun);

      return matchLayanan && matchBulan && matchTahun;
    });
  }, [kinerjaList, layanan, bulan, tahun]);

  // ===================== RowSpan per Layanan =====================
  const rowSpanMap: Record<string, number> = {};
  filteredData.forEach((row) => {
    rowSpanMap[row.namaLayanan] = (rowSpanMap[row.namaLayanan] || 0) + 1;
  });

  const pagedData: KinerjaTableRow[] = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize).map((item, i) => ({
      ...item,
      _index: start + i,
    }));
  }, [filteredData, currentPage]);

  // ===================== Columns =====================
  const columns: ColumnsType<KinerjaTableRow> = [
    {
      title: "Jenis Layanan",
      dataIndex: "namaLayanan",
      key: "namaLayanan",
      fixed: "left",
      width: 150,
      render: (text, row) => {
        const prevRows = filteredData.slice(0, row._index);
        const isFirst = !prevRows.some(
          (r) => r.namaLayanan === row.namaLayanan
        );

        return {
          children: text,
          props: {
            rowSpan: isFirst ? rowSpanMap[row.namaLayanan] : 0,
          },
        };
      },
    },
    { title: "Jalur/Rute", dataIndex: "namaRute", key: "namaRute", width: 250 },
    {
      title: "Ritase",
      dataIndex: "ritase",
      key: "ritase",
      width: 80,
      align: "center",
    },
    {
      title: "Jumlah Penumpang",
      dataIndex: "jumlahPenumpang",
      key: "jumlahPenumpang",
      width: 120,
      align: "center",
    },
    {
      title: "Headway (Menit)",
      dataIndex: "headway",
      key: "headway",
      width: 120,
      align: "center",
    },
    {
      title: "Lay Over Time (Menit)",
      dataIndex: "layOverTime",
      key: "layOverTime",
      width: 140,
      align: "center",
    },
    {
      title: "Kapasitas",
      dataIndex: "kapasitas",
      key: "kapasitas",
      width: 100,
      align: "center",
    },
    {
      title: "Travel Time (Menit)",
      dataIndex: "travelTime",
      key: "travelTime",
      width: 120,
      align: "center",
    },
    {
      title: "Kecepatan (Km/jam)",
      dataIndex: "kecepatan",
      key: "kecepatan",
      width: 130,
      align: "center",
      render: (value) => value?.toFixed(2),
    },
    {
      title: "Load Factor (%)",
      dataIndex: "loadFactor",
      key: "loadFactor",
      width: 130,
      align: "center",
      render: (value) => value?.toFixed(2),
    },
    {
      title: "Penumpang/Km",
      dataIndex: "penumpangKm",
      key: "penumpangKm",
      width: 120,
      align: "center",
    },
  ];

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <Select
          value={layanan}
          onChange={setLayanan}
          className="flex-1 min-w-[150px]"
          options={[
            { value: "all", label: "Semua Layanan" },
            ...(kinerjaList
              ? Array.from(new Set(kinerjaList.map((i) => i.namaLayanan))).map(
                  (name) => ({
                    value: name.toLowerCase(),
                    label: name,
                  })
                )
              : []),
          ]}
        />

        <DatePicker
          picker="month"
          format="MMMM"
          placeholder="Semua Bulan"
          value={bulan}
          onChange={setBulan}
          className="flex-1 min-w-[150px]"
        />

        <DatePicker
          picker="year"
          format="YYYY"
          placeholder="Semua Tahun"
          value={tahun ? dayjs(`${tahun}`, "YYYY") : null}
          onChange={(date) => setTahun(date ? date.year() : null)}
          className="flex-1 min-w-[150px]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoadingList ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={pagedData}
            columns={columns}
            bordered={false}
            scroll={{ x: 1400 }}
            className="
              bg-transparent 
              [&_.ant-table-thead]:bg-transparent 
              [&_.ant-table-thead>tr>th]:py-1 
              [&_.ant-table-thead>tr>th]:px-3 
              [&_.ant-table-tbody>tr]:bg-transparent 
              [&_.ant-table-cell]:bg-transparent 
              [&_.ant-table-cell]:py-2 
              [&_.ant-table-cell]:px-3
            "
            rowClassName={() => "bg-transparent"}
          />
        )}
      </div>
    </div>
  );
};

export default AnalisaKinerjaTable;
