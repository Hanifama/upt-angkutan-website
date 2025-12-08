import type { NavigateFunction } from "react-router-dom";

import { Button, Image } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import type { LinkInformasi } from "../../../../interfaces/linkInformasi";

interface CreateColumnsParams {
  currentPage: number;
  pageSize: number;
  navigate: NavigateFunction;
  handleDeleteClick: (id: string) => void;
}

export const createLinkInformasiColumns = ({
  currentPage,
  pageSize,
  navigate,
  handleDeleteClick,
}: CreateColumnsParams): ColumnsType<LinkInformasi> => [
  {
    title: "No",
    key: "no",
    width: 70,
    align: "center",
    render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
  },
  {
    title: "Gambar",
    dataIndex: "thumbnail",
    key: "thumbnail",
    align: "center",
    render: (src: string) => (
      <Image
        src={src}
        alt="thumbnail"
        width={100}
        height={100}
        style={{ borderRadius: "8px", objectFit: "cover" }}
        preview={false}
      />
    ),
  },
  {
    title: "Label Informasi",
    dataIndex: "labelInformasi",
    key: "labelInformasi",
  },
  {
    title: "Embed Link",
    dataIndex: "embedLink",
    key: "embedLink",
    render: (text: string) => (
      <a
        href={text}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {text}
      </a>
    ),
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    render: (_, record) => (
      <div className="flex justify-center gap-2">
        <Button
          type="text"
          icon={<EditOutlined />}
          size="small"
          onClick={() => navigate(`/dashboard/link/edit/${record.id}`)}
        />
        <Button
          type="text"
          icon={<DeleteOutlined />}
          danger
          size="small"
          onClick={() => handleDeleteClick(record.id)}
        />
      </div>
    ),
  },
];
