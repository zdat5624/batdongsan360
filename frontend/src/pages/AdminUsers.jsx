/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Form,
  InputGroup,
  Pagination,
  Modal,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaInfoCircle, FaTrash, FaLock, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import apiServices from "../services/apiServices";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const customStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  .content-wrapper {
    display: flex;
    flex: 1;
  }
  .main-content {
    flex: 1;
    padding-top: 100px;
    padding-bottom: 150px;
    background: rgb(240, 248, 255);
  }
  .custom-container {
    padding: 20px;
  }
  .admin-table {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .admin-table thead {
    background-color: #007bff;
    color: #fff;
  }
  .admin-table tbody tr {
    transition: background-color 0.3s;
  }
  .admin-table tbody tr:hover {
    background-color: #e9ecef;
  }
  .admin-table tbody tr:nth-child(odd) {
    background-color: #f8f9fa;
  }
  .admin-table tbody tr:nth-child(even) {
    background-color: #ffffff;
  }
  .search-input {
    border-radius: 20px;
    border: 1px solid #ced4da;
    transition: all 0.3s;
  }
  .search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
  .pagination .page-item.active .page-link {
    background-color: rgb(255, 255, 255);
    border-color: #007bff;
  }
  .pagination .page-link {
    color: #007bff;
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
    text-align: center;
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
  .action-button {
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 0.9rem;
  }
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    flex-wrap: nowrap;
  }
  .pagination-input {
    width: 60px;
    height: 32px;
    border-radius: 5px;
    font-size: 0.9rem;
  }
  .pagination-go-button {
    height: 32px;
    border-radius: 5px;
    font-size: 0.9rem;
    padding: 0 15px;
  }
  .pagination {
    margin-bottom: 0;
  }
  .pagination-form {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const AdminUsers = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 20;

  const [pageInput, setPageInput] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmUserId, setConfirmUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const pageForApi = currentPage - 1;
        const response = await apiServices.get("/api/admin/users", {
          params: {
            page: pageForApi,
            size: usersPerPage,
            email: searchTerm || "gmail",
            minBalance: -1,
            maxBalance: 99999999999,
          },
        });

        if (response.data.statusCode === 200) {
          const fetchedUsers = response.data.data.content.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Không chuyển thành chữ thường
            joinedDate: user.createdAt.split("T")[0],
            status: user.status || (user.balance > 0 ? "Active" : "Inactive"),
            gender: user.gender,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar,
          }));
          setUsers(fetchedUsers);
          setTotalPages(response.data.data.totalPages);
        } else {
          throw new Error(response.data.message || "Lỗi khi gọi API.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm]);

  const handleDelete = (userId) => {
    setConfirmMessage(
      `Bạn có chắc muốn xóa người dùng "${users.find((u) => u.id === userId).name}"?`
    );
    setConfirmAction(() => async () => {
      try {
        await apiServices.delete(`/api/admin/posts/by-user/${userId}`);
        await apiServices.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
        alert("Người dùng đã được xóa thành công!");
      } catch (err) {
        setError(err.message || "Không thể xóa người dùng. Vui lòng thử lại sau.");
      }
    });
    setConfirmUserId(userId);
    setShowConfirm(true);
  };

  const handleLock = (userId) => {
    setConfirmMessage(
      `Bạn có chắc muốn khóa người dùng "${users.find((u) => u.id === userId).name}"?`
    );
    setConfirmAction(() => async () => {
      try {
        const response = await apiServices.put(`/api/admin/users/${userId}/lock`);
        if (response.data.statusCode === 200) {
          setUsers(
            users.map((user) =>
              user.id === userId ? { ...user, status: "Locked" } : user
            )
          );
          alert("Người dùng đã được khóa thành công!");
        } else {
          throw new Error(response.data.message || "Lỗi khi khóa người dùng.");
        }
      } catch (err) {
        setError(err.message || "Không thể khóa người dùng. Vui lòng thử lại sau.");
      }
    });
    setConfirmUserId(userId);
    setShowConfirm(true);
  };

  const handleDetail = async (userId) => {
    try {
      const response = await apiServices.get(`/api/users/${userId}`);
      if (response.data.statusCode === 200) {
        setDetailUser(response.data.data);
        setShowDetailModal(true);
      } else {
        throw new Error(response.data.message || "Không thể lấy thông tin chi tiết người dùng.");
      }
    } catch (err) {
      setError(err.message || "Không thể lấy thông tin chi tiết người dùng. Vui lòng thử lại sau.");
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput("");
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      paginate(pageNumber);
    } else {
      alert(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalPages}`);
      setPageInput("");
    }
  };

  return (
    <div className="layout">
      <style>{customStyles}</style>
      <div className="content-wrapper">
        <Sidebar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <Container className="custom-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-primary fw-bold">Quản lý Người dùng</h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <div className="d-flex justify-content-between mb-4">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <InputGroup.Text style={{ background: "#fff", borderRadius: "20px 0 0 20px" }}>
                    <FaSearch className="text-primary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="search-input"
                    style={{ borderRadius: "0 20px 20px 0" }}
                  />
                </InputGroup>
              </div>

              <Modal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                centered
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    <FaExclamationTriangle className="me-2" style={{ color: "#ffd700" }} />
                    Xác nhận hành động
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>{confirmMessage}</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      confirmAction();
                      setShowConfirm(false);
                    }}
                  >
                    Xác nhận
                  </Button>
                </Modal.Footer>
              </Modal>

              <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Chi tiết Người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {detailUser ? (
                    <ListGroup variant="flush">
                      <ListGroup.Item><strong>ID:</strong> {detailUser.id}</ListGroup.Item>
                      <ListGroup.Item><strong>Tên:</strong> {detailUser.name}</ListGroup.Item>
                      <ListGroup.Item><strong>Email:</strong> {detailUser.email}</ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Quyền:</strong>{" "}
                        <span className={`badge ${detailUser.role === "ADMIN" ? "bg-primary" : "bg-secondary"}`}>
                          {detailUser.role}
                        </span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Giới tính:</strong>{" "}
                        <span className={`badge ${detailUser.gender === "MALE" ? "bg-info" : "bg-warning"}`}>
                          {detailUser.gender === "MALE" ? "Nam" : "Nữ"}
                        </span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Số dư:</strong>{" "}
                        {detailUser.balance ? detailUser.balance.toLocaleString("vi-VN") : "N/A"} VNĐ
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Avatar:</strong>{" "}
                        {detailUser.avatar ? (
                          <div className="mt-2">
                            <img src={detailUser.avatar} alt="Avatar" style={{ maxWidth: "100px", borderRadius: "5px" }} />
                          </div>
                        ) : (
                          <span className="text-muted">Chưa có avatar</span>
                        )}
                      </ListGroup.Item>
                      <ListGroup.Item><strong>Số điện thoại:</strong> {detailUser.phone}</ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Địa chỉ:</strong>{" "}
                        {detailUser.address ? (
                          detailUser.address
                        ) : (
                          <span className="text-danger">Chưa cập nhật</span>
                        )}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(detailUser.createdAt).toLocaleString("vi-VN")}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Ngày cập nhật:</strong>{" "}
                        {new Date(detailUser.updatedAt).toLocaleString("vi-VN")}
                      </ListGroup.Item>
                      <ListGroup.Item><strong>Người tạo:</strong> {detailUser.createdBy}</ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Người cập nhật:</strong>{" "}
                        {detailUser.updatedBy ? (
                          detailUser.updatedBy
                        ) : (
                          <span className="text-danger">Chưa cập nhật</span>
                        )}
                      </ListGroup.Item>
                    </ListGroup>
                  ) : (
                    <p>Đang tải thông tin...</p>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                    Đóng
                  </Button>
                </Modal.Footer>
              </Modal>

              <Table responsive className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Quyền</th>
                    <th>Ngày Tham Gia</th>
                    <th>Trạng Thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </Spinner>
                      </td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.joinedDate}</td>
                        <td>
                          <span className={`badge ${user.status === "Active" ? "bg-success" : user.status === "Locked" ? "bg-danger" : "bg-secondary"}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2 action-button"
                            onClick={() => handleDetail(user.id)}
                          >
                            <FaInfoCircle /> Chi tiết
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="me-2 action-button"
                            onClick={() => handleDelete(user.id)}
                          >
                            <FaTrash /> Xóa
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="action-button"
                            onClick={() => handleLock(user.id)}
                            disabled={user.status === "Locked"}
                          >
                            <FaLock /> Khóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <div className="pagination-container mt-3">
                <Pagination>
                  <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />

                  {(() => {
                    const pageItems = [];
                    const maxVisiblePages = 5;
                    const ellipsis = <Pagination.Ellipsis disabled />;

                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    for (let number = startPage; number <= endPage; number++) {
                      pageItems.push(
                        <Pagination.Item
                          key={number}
                          active={number === currentPage}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </Pagination.Item>
                      );
                    }

                    if (startPage > 1) {
                      pageItems.unshift(
                        <Pagination.Item key={1} onClick={() => paginate(1)}>
                          1
                        </Pagination.Item>
                      );
                      if (startPage > 2) {
                        pageItems.splice(1, 0, ellipsis);
                      }
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pageItems.push(ellipsis);
                      }
                      pageItems.push(
                        <Pagination.Item key={totalPages} onClick={() => paginate(totalPages)}>
                          {totalPages}
                        </Pagination.Item>
                      );
                    }

                    return pageItems;
                  })()}

                  <Pagination.Next
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>

                <Form onSubmit={handlePageInputSubmit} className="pagination-form">
                  <Form.Control
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    placeholder="Trang"
                    min="1"
                    max={totalPages}
                    className="pagination-input"
                  />
                  <Button
                    variant="primary"
                    className="pagination-go-button"
                    onClick={handlePageInputSubmit}
                  >
                    Đi
                  </Button>
                </Form>
              </div>
            </motion.div>
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminUsers;