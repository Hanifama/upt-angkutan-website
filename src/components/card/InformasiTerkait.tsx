import React, { useEffect, useRef } from "react";
import { Card, Spin, Empty, message } from "antd";
import {
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useLinkInformasiStore } from "../../store/useLinkInformasiStore";

const InformasiTerkait: React.FC = () => {
  const { linkInformasi, fetchLinkInformasi, isLoading, error } =
    useLinkInformasiStore();

  const [messageApi, contextHolder] = message.useMessage();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    const current = scrollRef.current;
    if (!current) return;
    const scrollAmount = current.clientWidth * 0.8;
    current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLinkInformasi(1, 10);
      } catch (err: any) {
        messageApi.error("Gagal memuat data informasi terkait!");
      }
    };
    loadData();
  }, [fetchLinkInformasi, messageApi]);

  return (
    <>
      {contextHolder}
      <Card
        title={
          <div className="flex items-center gap-2">
            <InfoCircleOutlined />
            Informasi Terkait Layanan
          </div>
        }
        className="shadow-md rounded-2xl p-6 bg-white flex flex-col w-full"
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin tip="Memuat data..." />
          </div>
        ) : error ? (
          <Empty
            description={
              <span className="text-gray-500">
                Gagal memuat data. Silakan coba lagi.
              </span>
            }
          />
        ) : linkInformasi.length === 0 ? (
          <Empty description="Belum ada informasi terkait." />
        ) : (
          <>
            {/* === Video / Link Informasi Section === */}
            <div className="relative w-full mb-6">
              {/* Tombol kiri */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10 transition-all duration-300"
              >
                <LeftOutlined className="text-gray-700 text-lg" />
              </button>

              {/* Tombol kanan */}
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10 transition-all duration-300"
              >
                <RightOutlined className="text-gray-700 text-lg" />
              </button>

              {/* Container utama untuk scroll horizontal */}
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2 px-8 
             [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {linkInformasi.map((item, idx) => (
                  <div
                    key={idx}
                    className="min-w-[200px] sm:min-w-[220px] flex-shrink-0 text-left"
                  >
                    <a
                      href={item.embedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="overflow-hidden rounded-lg shadow-md">
                        <img
                          src={item.thumbnail}
                          alt={item.labelInformasi}
                          className="w-full h-28 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 group-hover:opacity-90"
                        />
                      </div>
                      <p className="text-sm mt-2 font-medium text-gray-700 line-clamp-2">
                        {item.labelInformasi}
                      </p>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* === Eksternal Link Section === */}
            <div>
              <h3 className="font-semibold mb-2 text-base text-gray-800">
                Eksternal Link
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://dishub.bandung.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline text-sm transition-colors duration-200"
                  >
                    Website Resmi Dishub Kota Bandung
                  </a>
                </li>
                <li>
                  <a
                    href="https://bandung.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline text-sm transition-colors duration-200"
                  >
                    Website Resmi Kota Bandung
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:underline text-sm transition-colors duration-200"
                  >
                    Layanan Aspirasi dan Pengaduan Online Rakyat
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:underline text-sm transition-colors duration-200"
                  >
                    Dokumentasi Informasi
                  </a>
                </li>
              </ul>
            </div>
          </>
        )}
      </Card>
    </>
  );
};

export default InformasiTerkait;
