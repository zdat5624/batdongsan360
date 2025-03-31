/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { FaSyncAlt, FaEdit } from "react-icons/fa"; // Thêm biểu tượng từ react-icons
import apiServices from "../services/apiServices";

// Thêm CSS tùy chỉnh để thay đổi màu nền của trang và container
const tableStyles = `
  body {
    background-color: rgb(240, 248, 255); /* Màu nền xanh nhạt cho toàn bộ trang */
  }
  .custom-container {
    background-color: rgb(240, 248, 255); /* Màu nền xanh nhạt cho container */
    min-height: 100vh; /* Đảm bảo container chiếm toàn bộ chiều cao màn hình */
  }
`;

const AdminVips = () => {
  const [vips, setVips] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVip, setEditVip] = useState({
    id: null,
    vipLevel: 0,
    name: "",
    pricePerDay: 0,
  });

  // Hàm lấy danh sách gói VIP
  const fetchVips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiServices.get("/api/vips");
      if (response.data.statusCode === 200) {
        setVips(response.data.data);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách gói VIP.");
      }
    } catch (err) {
      setError(err.message || "Không thể lấy danh sách gói VIP. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách gói VIP khi component được mount
  useEffect(() => {
    fetchVips();
  }, []);

  // Xử lý chỉnh sửa gói VIP
  const handleEdit = (vipId) => {
    const vipToEdit = vips.find((vip) => vip.id === vipId);
    setEditVip({ ...vipToEdit });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editVip.pricePerDay < 0) {
      alert("Giá mỗi ngày không thể âm!");
      return;
    }

    try {
      const response = await apiServices.put(
        `/api/admin/vips/${editVip.id}/price?newPrice=${editVip.pricePerDay}`
      );
      if (response.data.statusCode === 200) {
        setVips(
          vips.map((vip) =>
            vip.id === editVip.id ? { ...vip, pricePerDay: editVip.pricePerDay } : vip
          )
        );
        setShowEditModal(false);
        alert("Cập nhật giá gói VIP thành công!");
      } else {
        throw new Error(response.data.message || "Lỗi khi cập nhật giá gói VIP.");
      }
    } catch (err) {
      setError(err.message || "Không thể cập nhật giá gói VIP. Vui lòng thử lại sau.");
    }
  };

  // Hàm định dạng màu chữ theo cấp độ VIP
  const getVipTextColor = (vipLevel) => {
    switch (vipLevel) {
      case 0:
        return "#6c757d"; // Xám đậm (phù hợp với nền xám nhạt trong hình)
      case 1:
        return "#28a745"; // Xanh đậm
      case 2:
        return "#d39e00"; // Vàng đậm
      case 3:
        return "#fd7e14"; // Cam đậm
      case 4:
        return "#dc3545"; // Đỏ đậm
      default:
        return "#6c757d";
    }
  };

  return (
    <Container className="mt-5 custom-container">
      {/* Thêm CSS tùy chỉnh vào trang */}
      <style>{tableStyles}</style>

      {/* Tiêu đề và nút tải lại */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold d-flex align-items-center">
          <FaEdit className="me-2" /> Quản lý Gói VIP
        </h2>
        <Button
          variant="outline-primary"
          onClick={fetchVips}
          disabled={loading}
          className="d-flex align-items-center"
        >
          <FaSyncAlt className="me-2" /> Tải lại
        </Button>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <span role="img" aria-label="error" className="me-2">
            ⚠️
          </span>{" "}
          {error}
        </Alert>
      )}

      {/* Modal chỉnh sửa giá gói VIP */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">Chỉnh sửa Giá Gói VIP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Tên Gói VIP</Form.Label>
              <Form.Control
                type="text"
                value={editVip.name}
                disabled
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Giá Mỗi Ngày (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                value={editVip.pricePerDay}
                onChange={(e) => setEditVip({ ...editVip, pricePerDay: parseInt(e.target.value) })}
                required
                min="0"
                placeholder="Nhập giá mỗi ngày"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Lưu
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Bảng danh sách gói VIP */}
      <div className="table-responsive shadow-sm rounded">
        <Table hover className="align-middle">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Tên Gói</th>
              <th className="p-3">Cấp VIP</th>
              <th className="p-3">Giá Mỗi Ngày (VNĐ)</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </Spinner>
                </td>
              </tr>
            ) : vips.length > 0 ? (
              vips.map((vip) => (
                <tr
                  key={vip.id}
                  style={{ transition: "background-color 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <td className="p-3">{vip.id}</td>
                  <td
                    className="p-3"
                    style={{
                      color: getVipTextColor(vip.vipLevel),
                      fontWeight: "bold",
                    }}
                  >
                    {vip.name}
                  </td>
                  <td className="p-3">{vip.vipLevel}</td>
                  <td className="p-3">{vip.pricePerDay.toLocaleString("vi-VN")}</td>
                  <td className="p-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(vip.id)}
                      className="d-flex align-items-center gap-1"
                      style={{ transition: "all 0.3s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#007bff";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#007bff";
                      }}
                    >
                      <FaEdit /> Sửa Giá
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-muted">
                  Không tìm thấy gói VIP nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default AdminVips;