import React from "react";
import { Row, Col } from "antd";

import FormKeluhan from "./InformasiKeluhan";
import InformasiTerkait from "./InformasiTerkait";

const InformasiLayanan: React.FC = () => {
  return (
    <Row gutter={[24, 24]} align="stretch">
      {/* === KIRI === */}
      <Col xs={24} md={12} className="flex">
        <InformasiTerkait />
      </Col>

      {/* === KANAN === */}
      <Col xs={24} md={12} className="flex">
        <FormKeluhan />
      </Col>
    </Row>
  );
};

export default InformasiLayanan;
