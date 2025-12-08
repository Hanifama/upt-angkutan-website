import React from "react";

interface ServiceCardProps {
  nama: string;
  aktif: number;
  total: number;
  color?: string;
  icon?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  nama,
  aktif,
  total,
  color = "#005B96",
  icon,
}) => {
  const persenAktif = total > 0 ? (aktif / total) * 100 : 0;
  const secondaryColor = "#E9EAF2";

  return (
    <div className="p-2 bg-white rounded hover:shadow-md transition">
      {/* Judul dan ikon */}
      <p className="font-semibold mb-3 flex items-center gap-2">
        {icon && (
          <img src={icon} alt={nama} style={{ width: 24, height: 24 }} />
        )}
        {nama}
      </p>

      {/* Progress bar proporsional */}
      <div className="mb-3 relative w-full h-2 rounded overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${persenAktif}%`,
            backgroundColor: color,
            transition: "width 0.3s ease",
          }}
        ></div>
        <div
          className="absolute right-0 top-0 h-full"
          style={{
            width: `${100 - persenAktif}%`,
            backgroundColor: secondaryColor,
          }}
        ></div>
      </div>

      {/* Info aktif dan total */}
      <div className="text-xs flex justify-between">
        <p className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          ></span>
          Armada aktif: {aktif}
        </p>

        <p className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: "#BDBDBD" }}
          ></span>
          Total armada: {total}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
