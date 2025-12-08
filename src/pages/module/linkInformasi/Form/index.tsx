import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, message, Row, Col } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { PictureOutlined } from "@ant-design/icons";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { useLinkInformasiStore } from "../../../../store/useLinkInformasiStore";
import { useUploadStore } from "../../../../store/useUploadStore";

const LinkInformasiForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  const mode = location.pathname.includes("edit")
    ? "edit"
    : location.pathname.includes("detail")
    ? "detail"
    : "create";

  const {
    createLinkInformasi,
    updateLinkInformasi,
    getDetailLinkInformasi,
    isLoading,
  } = useLinkInformasiStore();

  const {
    uploadFile,
    uploadedFile,
    isLoading: uploadLoading,
    resetUpload,
  } = useUploadStore();

  const [fileList, setFileList] = useState<any[]>([]);

  // ambil detail data pas edit/detail
  useEffect(() => {
    const loadDetail = async () => {
      if (mode !== "create" && id) {
        await getDetailLinkInformasi(id);
        const selected = useLinkInformasiStore.getState().selectedLinkInformasi;

        if (selected) {
          form.setFieldsValue({
            labelInformasi: selected.labelInformasi,
            embedLink: selected.embedLink,
            icon: selected.thumbnail,
          });

          // tampilkan thumbnail lama di preview
          if (selected.thumbnail) {
            setFileList([
              {
                uid: "-1",
                name: "Thumbnail Lama",
                status: "done",
                url: selected.thumbnail,
                thumbUrl: selected.thumbnail,
              },
            ]);
          }
        }
      }
    };

    loadDetail();

    return () => resetUpload();
  }, [id, mode]);

  // kalau upload berhasil → update preview
  useEffect(() => {
    if (uploadedFile?.withUrl) {
      setFileList([
        {
          uid: uploadedFile.filename,
          name: uploadedFile.filename,
          status: "done",
          url: uploadedFile.withUrl,
          thumbUrl: uploadedFile.withUrl,
        },
      ]);

      form.setFieldValue("icon", uploadedFile.withUrl);
    }
  }, [uploadedFile]);

  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
      messageApi.success("File berhasil diunggah!", 2);
    } catch (err: any) {
      messageApi.error(err.message || "Gagal mengunggah file", 2);
    }
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        labelInformasi: values.labelInformasi,
        embedLink: values.embedLink,
        type: "UPT",
        thumbnail:
          values.icon ||
          "https://via.placeholder.com/150?text=Default+Thumbnail",
      };

      if (mode === "edit" && id) {
        await updateLinkInformasi(id, payload);
        messageApi.success("Data berhasil diperbarui!", 2, () =>
          navigate("/dashboard/link")
        );
      } else {
        await createLinkInformasi(payload);
        messageApi.success("Data berhasil disimpan!", 2, () =>
          navigate("/dashboard/link")
        );
      }
    } catch (error) {
      messageApi.error("Gagal menyimpan data. Coba lagi nanti!", 2);
    }
  };

  const pageTitle =
    mode === "edit"
      ? "Edit Link Informasi"
      : mode === "detail"
      ? "Detail Link Informasi"
      : "Tambah Link Informasi";

  return (
    <DashboardLayout
      pageTitle={pageTitle}
      pageSubtitle={
        mode === "detail"
          ? "Berikut detail dari link informasi yang dipilih."
          : "Silakan isi data link informasi secara lengkap."
      }
    >
      {contextHolder}
      <Card title={`Form ${pageTitle}`} className="shadow-md rounded-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          disabled={mode === "detail"}
        >
          {/* Label Informasi */}
          <Form.Item
            label="Label Informasi"
            name="labelInformasi"
            rules={[
              { required: true, message: "Label informasi wajib diisi!" },
            ]}
          >
            <Input placeholder="Masukkan label informasi (contoh: Jadwal Bus Kota)" />
          </Form.Item>

          {/* Embed Link */}
          <Form.Item
            label="Embed Link"
            name="embedLink"
            rules={[
              { required: true, message: "Embed link wajib diisi!" },
              { type: "url", message: "Masukkan format URL yang valid!" },
            ]}
          >
            <Input placeholder="Masukkan link embed (contoh: https://www.youtube.com/embed/...)" />
          </Form.Item>

          {/* Upload Thumbnail */}
          <Form.Item
            name="icon"
            label="Upload Thumbnail"
            rules={[{ required: true, message: "Unggah thumbnail wajib!" }]}
          >
            <Dragger
              name="file"
              multiple={false}
              accept=".png,.jpg,.jpeg,.svg"
              fileList={fileList}
              listType="picture-card"
              itemRender={(originNode) => (
                <div className="flex justify-center items-center w-full h-full">
                  {originNode}
                </div>
              )}
              beforeUpload={(file) => {
                handleUpload(file);
                setFileList([file]);
                return false;
              }}
              onRemove={() => {
                setFileList([]);
                resetUpload();
                form.setFieldValue("icon", null);
              }}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: mode !== "detail",
              }}
            >
              <p className="ant-upload-drag-icon">
                <PictureOutlined style={{ color: "#2E3192" }} />
              </p>
              <p className="ant-upload-text">
                Unggah file gambar (PNG, JPG, atau SVG)
              </p>
            </Dragger>
          </Form.Item>

          {/* Tombol Aksi */}
          <Form.Item className="mt-6">
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  block
                  onClick={() => navigate(-1)}
                  disabled={isLoading || uploadLoading}
                  style={{ borderColor: "#FF4D4F", color: "#FF4D4F" }}
                >
                  Kembali
                </Button>
              </Col>
              {mode !== "detail" && (
                <Col span={12}>
                  <Button
                    block
                    type="primary"
                    htmlType="submit"
                    loading={isLoading || uploadLoading}
                    style={{
                      backgroundColor: "#2E3192",
                      borderColor: "#2E3192",
                    }}
                  >
                    {mode === "edit" ? "Perbarui" : "Simpan"}
                  </Button>
                </Col>
              )}
            </Row>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default LinkInformasiForm;
