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
import { FaSyncAlt, FaEdit, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Sidebar from "../components/Sidebar";
import apiServices from "../services/apiServices";

// CSS tùy chỉnh
const customStyles = `
  .layout {
    display: grid;
    grid-template-columns: minmax(250px, 250px) 1fr;
    min-height: 100vh;
    background: #f0f4f8;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 20px;
    padding-top: 60px; /* Khoảng cách 60px từ đỉnh trang */
    background: #f0f4f8;
  }

  .custom-container {
    padding: 20px;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .admin-table {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .admin-table thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #fff;
  }

  .admin-table tbody tr {
    transition: background-color 0.2s ease;
  }

  .admin-table tbody tr:hover {
    background-color: #e6f0ff;
  }

  .admin-table tbody tr:nth-child(odd) {
    background-color: #f8f9fa;
  }

  .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    background: linear-gradient(135deg, #1a1a1a, #2c3e50);
    color: #fff;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    padding: 15px 25px;
  }

  .modal-title {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .modal-body {
    padding: 25px;
    font-size: 1rem;
    color: #333;
  }

  .modal-footer {
    padding: 15px 25px;
    border-top: none;
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .modal-footer .btn {
    flex: 1;
    border-radius: 25px;
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
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
  }

  .modal-footer .btn-primary:hover {
    background: linear-gradient(135deg, #0056b3, #003d80);
  }

  .action-button {
    border-radius: 25px;
    padding: 6px 12px;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;
  }

  .badge {
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .sidebar {
      width: 100%;
      position: fixed;
      top: 0;
      z-index: 1000;
      display: none;
    }
    .main-content {
      padding: 15px;
      padding-top: 60px;
    }
    .page-title {
      font-size: 1.5rem;
    }
    .admin-table th:nth-child(4),
    .admin-table td:nth-child(4) {
      display: none; /* Ẩn cột Giá Mỗi Ngày */
    }
  }

  @media (max-width: 576px) {
    .page-title {
      font-size: 1.25rem;
    }
    .admin-table th:nth-child(3),
    .admin-table td:nth-child(3) {
      display: none; /* Ẩn cột Cấp VIP */
    }
    .action-button {
      padding: 5px 8px;
      font-size: 0.8rem;
    }
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
      <Helmet>
        <title>Quản lý Gói VIP - Admin Panel</title>
      </Helmet>
      <style>{customStyles}</style>
      <Sidebar user={user} handleLogout={handleLogout} />
      <div className="content-wrapper">
        <div className="main-content">
          <Container className="custom-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="page-title">
                  <FaInfoCircle /> Quản lý Gói VIP
                </h2>
                <Button
                  variant="outline-primary"
                  onClick={fetchVips}
                  disabled={loading}
                  className="action-button"
                >
                  <FaSyncAlt className="me-2" /> Tải lại
                </Button>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>
                    <FaEdit className="me-2" /> Chỉnh sửa Giá Gói VIP
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleSaveEdit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên Gói VIP</Form.Label>
                      <Form.Control
                        type="text"
                        value={editVip.name}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá Mỗi Ngày (VNĐ)</Form.Label>
                      <Form.Control
                        type="number"
                        value={editVip.pricePerDay}
                        onChange={(e) =>
                          setEditVip({ ...editVip, pricePerDay: parseInt(e.target.value) || 0 })
                        }
                        required
                        min="0"
                        placeholder="Nhập giá mỗi ngày"
                      />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveEdit}
                  >
                    Lưu
                  </Button>
                </Modal.Footer>
              </Modal>

              <Table responsive className="admin-table">
                <thead>
                  <tr>
                    <th>Tên Gói</th>
                    <th>Cấp VIP</th>
                    <th>Giá Mỗi Ngày (VNĐ)</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">Đang tải...</span>
                      </td>
                    </tr>
                  ) : vips.length > 0 ? (
                    vips.map((vip) => (
                      <tr key={vip.id}>
                        <td style={{ color: getVipTextColor(vip.vipLevel), fontWeight: "bold" }}>
                          {vip.name}
                        </td>
                        <td>{vip.vipLevel}</td>
                        <td>{vip.pricePerDay.toLocaleString("vi-VN")}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="action-button"
                            onClick={() => handleEdit(vip.id)}
                          >
                            <FaEdit className="me-1" /> Sửa Giá
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Không tìm thấy gói VIP nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </motion.div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AdminVips;