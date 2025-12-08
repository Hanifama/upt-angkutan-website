import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface DataType {
  key: string;
  group: string;
  route: string;
  janx: number;
  armedAktif: number;
  armedNonAktif: number;
  rate: number;
  jamiah: number;
  headney: number;
  layover: number;
  kapasitas: string;
  time: number;
  recession: number;
  lastCycle: number;
  penumgong: number;
}

const data: DataType[] = [
  {
    key: "1",
    group: "TNB",
    route: "K1",
    janx: 20,
    armedAktif: 6,
    armedNonAktif: 3,
    rate: 10,
    jamiah: 850,
    headney: 5,
    layover: 4,
    kapasitas: "75%",
    time: 50,
    recession: 40,
    lastCycle: 31,
    penumgong: 43,
  },
  {
    key: "2",
    group: "TNB",
    route: "K2",
    janx: 20,
    armedAktif: 5,
    armedNonAktif: 4,
    rate: 10,
    jamiah: 855,
    headney: 5,
    layover: 4,
    kapasitas: "75%",
    time: 50,
    recession: 40,
    lastCycle: 31,
    penumgong: 43,
  },
  {
    key: "3",
    group: "Bus Sekolah",
    route: "BS1",
    janx: 20,
    armedAktif: 6,
    armedNonAktif: 3,
    rate: 10,
    jamiah: 850,
    headney: 5,
    layover: 4,
    kapasitas: "75%",
    time: 50,
    recession: 40,
    lastCycle: 31,
    penumgong: 43,
  },
  {
    key: "4",
    group: "Bus Sekolah",
    route: "BS2",
    janx: 20,
    armedAktif: 5,
    armedNonAktif: 4,
    rate: 10,
    jamiah: 855,
    headney: 5,
    layover: 4,
    kapasitas: "75%",
    time: 50,
    recession: 40,
    lastCycle: 31,
    penumgong: 43,
  },
  {
    key: "5",
    group: "Bandros",
    route: "BD1",
    janx: 15,
    armedAktif: 4,
    armedNonAktif: 2,
    rate: 8,
    jamiah: 800,
    headney: 3,
    layover: 2,
    kapasitas: "60%",
    time: 45,
    recession: 35,
    lastCycle: 28,
    penumgong: 30,
  },
  {
    key: "6",
    group: "Bandros",
    route: "BD2",
    janx: 18,
    armedAktif: 5,
    armedNonAktif: 3,
    rate: 9,
    jamiah: 820,
    headney: 4,
    layover: 3,
    kapasitas: "65%",
    time: 48,
    recession: 38,
    lastCycle: 29,
    penumgong: 32,
  },
];

const columns: ColumnsType<DataType> = [
  {
    title: "Jenis Layanan",
    dataIndex: "group",
    key: "group",
    render: (_, __, index) => data[index].group,
    width: 120,
  },
  {
    title: "Jalur/Rute",
    dataIndex: "route",
    key: "route",
    width: 100,
  },
  {
    title: "Jarak",
    dataIndex: "janx",
    key: "janx",
    width: 80,
  },
  {
    title: "Armada (Unit)",
    children: [
      {
        title: "Aktif",
        dataIndex: "armedAktif",
        key: "armedAktif",
        width: 80,
      },
      {
        title: "Non-Aktif",
        dataIndex: "armedNonAktif",
        key: "armedNonAktif",
        width: 90,
      },
    ],
  },
  {
    title: "Rata2 Ritase Armada",
    dataIndex: "rate",
    key: "rate",
    width: 120,
  },
  {
    title: "Jumlah Penumpang",
    dataIndex: "jamiah",
    key: "jamiah",
    width: 120,
  },
  {
    title: "Kinerja",
    children: [
      {
        title: "Headwey (Menit)",
        dataIndex: "headney",
        key: "headney",
        width: 120,
      },
      {
        title: "Lay Over Time (Menit)",
        dataIndex: "layover",
        key: "layover",
        width: 140,
      },
      {
        title: "Kapasitas (%)",
        dataIndex: "kapasitas",
        key: "kapasitas",
        width: 110,
      },
      {
        title: "Time Travel (Menit)",
        dataIndex: "time",
        key: "time",
        width: 120,
      },
      {
        title: "Kecepatan (Km/jam)",
        dataIndex: "recession",
        key: "recession",
        width: 120,
      },
      {
        title: "Load Factor (%)",
        dataIndex: "lastCycle",
        key: "lastCycle",
        width: 120,
      },
      {
        title: "Penumpang/Km",
        dataIndex: "penumgong",
        key: "penumgong",
        width: 120,
      },
    ],
  },
];

const CustomTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <Table
        dataSource={data}
        columns={columns}
        bordered={false}
        scroll={{ x: "max-content" }}
        className="
          bg-transparent 
          [&_.ant-table-thead]:bg-transparent 
          [&_.ant-table-thead>tr>th]:py-1 
          [&_.ant-table-thead>tr>th]:px-3 
          [&_.ant-table-thead>tr>th]:text-xs 
          [&_.ant-table-tbody>tr]:bg-transparent 
          [&_.ant-table-cell]:bg-transparent 
          [&_.ant-table-cell]:py-2 
          [&_.ant-table-cell]:px-3
        "
        rowClassName={() => "bg-transparent"}
      />
    </div>
  );
};

export default CustomTable;
