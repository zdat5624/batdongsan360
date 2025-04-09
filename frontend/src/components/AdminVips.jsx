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
import { FaSyncAlt, FaEdit } from "react-icons/fa";
import apiServices from "../services/apiServices";
import Sidebar from "../components/Sidebar"; // Thêm import Sidebar
import Footer from "../components/Footer"; // Thêm import Footer để đồng bộ với các trang khác

// Cập nhật CSS để thêm sidebar và đồng bộ giao diện
const tableStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    background: rgb(240, 248, 255); /* Màu nền xanh nhạt cho toàn bộ layout */
  }
  .content-wrapper {
    display: flex;
    flex: 1;
    width: 100%; /* Đảm bảo container cha chiếm toàn bộ chiều rộng */
  }
  .main-content {
    flex: 1;
    padding-top: 100px; /* Tăng padding-top để tránh bị che bởi header */
    padding-bottom: 150px;
    padding-left: 20px; /* Giảm padding để bảng gần sidebar hơn */
    background: rgb(240, 248, 255); /* Đồng bộ màu nền với layout */
  }
  .custom-container {
    padding: 20px;
  }
  .table-responsive {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .table thead {
    background-color: #007bff;
    color: #fff;
  }
  .table tbody tr {
    transition: background-color 0.3s;
  }
  .modal-content {
    border-radius: 10px;
    border: none;
  }
  .modal-header {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
    color: #fff;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 15px 20px;
  }
  .modal-title {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .modal-body {
    padding: 20px;
    font-size: 1rem;
    color: #333;
  }
  .modal-footer {
    padding: 15px 20px;
    border-top: none;
    display: flex;
    width: auto;
    justify-content: space-between;
    gap: 10px;
  }
  .modal-footer .btn {
    width: 48%;
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  .modal-footer .btn-secondary {
    background-color: #6c757d;
    border: none;
  }
  .modal-footer .btn-secondary:hover {
    background-color: #5a6268;
  }
  .modal-footer .btn-primary {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%) !important;
    border: none !important;
  }
  .modal-footer .btn-primary:hover {
    background: linear-gradient(135deg, #0f0f0f 0%, #1f2a3c 100%) !important;
  }
  /* Đảm bảo sidebar hiển thị và đồng bộ màu nền */
  .sidebar {
    display: block !important;
    width: 250px !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    min-height: calc(100vh - 70px) !important;
    background: rgb(240, 248, 255) !important;
    border-right: 1px solid #dee2e6 !important;
  }
`;

const AdminVips = ({ user, handleLogout }) => {
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
        return "#6c757d"; // Xám đậm
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
    <div className="layout">
      <style>{tableStyles}</style>
      <div className="content-wrapper">
        <Sidebar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <Container className="custom-container">
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
              <Modal.Header closeButton>
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
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminVips;