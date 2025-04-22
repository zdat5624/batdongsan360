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
import { Helmet } from "react-helmet";
import AdminHeader from "../components/AdminHeader";
import Sidebar from "../components/Sidebar";
import apiServices from "../services/apiServices";

// AdminFooter component
const AdminFooter = () => {
  return (
    <footer style={{ backgroundColor: '#343a40', color: '#fff', padding: '10px 0', textAlign: 'center' }}>
      <Container>
        <p style={{ margin: 0 }}>THÔNG TIN</p>
      </Container>
    </footer>
  );
};

// CSS tùy chỉnh
const customStyles = `
.layout {
  display: grid;
  grid-template-columns: minmax(200px, 250px) 1fr;
  min-height: 100vh;
  background-color: #f0f8ff;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  padding-top: 90px;
  padding-bottom: 20px; /* Đảm bảo khoảng cách tự nhiên với footer */
  overflow-y: auto;
}

.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

footer {
  background-color: #343a40;
  color: #fff;
  padding: 10px 0;
  text-align: center;
  width: 100%;
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

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: nowrap;
  margin-top: 20px;
}

.pagination {
  display: flex;
  align-items: center;
  margin: 0;
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-color: #007bff;
  color: #fff;
}

.pagination .page-link {
  color: #007bff;
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.pagination .page-link:hover {
  background-color: #e6f0ff;
}

.pagination-input {
  width: 70px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  font-size: 0.95rem;
}

.pagination-go-button {
  height: 38px;
  border-radius: 8px;
  font-size: 0.95rem;
  padding: 0 15px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
  color: #fff;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    width: 100%;
    z-index: 1000;
    top: 0;
    left: 0;
    display: none;
    max-height: calc(100vh - 60px); /* Giới hạn chiều cao của Sidebar, để lại khoảng trống cho footer */
    overflow-y: auto; /* Nếu Sidebar dài, cho phép cuộn */
  }
  .main-content {
    padding: 15px;
    padding-top: 100px;
    padding-bottom: 15px;
  }
  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .pagination-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  .page-title {
    font-size: 1.25rem;
  }
}
`;

const AdminUsers = ({ user, setUser, handleLogin, handleLogout }) => {
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
            role: user.role.toLowerCase(),
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
        setError(err.message || "Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm]);

  const handleDelete = (userId) => {
    setConfirmMessage(`Bạn có chắc muốn xóa người dùng "${users.find((u) => u.id === userId).name}"?`);
    setConfirmAction(() => async () => {
      try {
        await apiServices.delete(`/api/admin/posts/by-user/${userId}`);
        await apiServices.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
        alert("Người dùng đã được xóa thành công!");
      } catch (err) {
        setError(err.message || "Không thể xóa người dùng.");
      }
    });
    setConfirmUserId(userId);
    setShowConfirm(true);
  };

  const handleLock = (userId) => {
    setConfirmMessage(`Bạn có chắc muốn khóa người dùng "${users.find((u) => u.id === userId).name}"?`);
    setConfirmAction(() => async () => {
      try {
        const response = await apiServices.put(`/api/admin/users/${userId}/lock`);
        if (response.data.statusCode === 200) {
          setUsers(users.map((user) => (user.id === userId ? { ...user, status: "Locked" } : user)));
          alert("Người dùng đã được khóa thành công!");
        } else {
          throw new Error(response.data.message || "Lỗi khi khóa người dùng.");
        }
      } catch (err) {
        setError(err.message || "Không thể khóa người dùng.");
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
        throw new Error(response.data.message || "Không thể lấy thông tin chi tiết.");
      }
    } catch (err) {
      setError(err.message || "Không thể lấy thông tin chi tiết người dùng.");
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
      <Helmet>
        <title>Quản lý Người dùng - Admin Panel</title>
      </Helmet>
      <style>{customStyles}</style>
      <Sidebar user={user} handleLogout={handleLogout} />
      <div className="content-wrapper">
        <div className="admin-header">
          <AdminHeader user={user} setUser={setUser} handleLogin={handleLogin} handleLogout={handleLogout} />
        </div>
        <div className="main-content">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="page-title">
                <FaInfoCircle /> Quản Lý Người Dùng
              </h2>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <div className="d-flex justify-content-start mb-4">
                <InputGroup style={{ maxWidth: "350px" }}>
                  <InputGroup.Text style={{ background: "#fff", borderRadius: "25px 0 0 25px" }}>
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
                    style={{ borderRadius: "0 25px 25px 0" }}
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
                  <Modal.Title>
                    <FaInfoCircle className="me-2" />
                    Chi tiết Người dùng
                  </Modal.Title>
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
                            <img src={detailUser.avatar} alt="Avatar" style={{ maxWidth: "120px", borderRadius: "8px" }} />
                          </div>
                        ) : (
                          <span className="text-muted">Chưa có avatar</span>
                        )}
                      </ListGroup.Item>
                      <ListGroup.Item><strong>Số điện thoại:</strong> {detailUser.phone || "Chưa cập nhật"}</ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Địa chỉ:</strong>{" "}
                        {detailUser.address || <span className="text-muted">Chưa cập nhật</span>}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(detailUser.createdAt).toLocaleString("vi-VN")}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Ngày cập nhật:</strong>{" "}
                        {new Date(detailUser.updatedAt).toLocaleString("vi-VN")}
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
                      <td colSpan="6" className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-2">Đang tải...</span>
                      </td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.joinedDate}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.status === "Active" ? "bg-success" : user.status === "Locked" ? "bg-danger" : "bg-secondary"
                            }`}
                          >
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
                      <td colSpan="6" className="text-center py-4">
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <div className="pagination-container">
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

                <Form onSubmit={handlePageInputSubmit} className="d-flex align-items-center gap-2 ms-3">
                  <Form.Control
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    placeholder="Trang"
                    min="1"
                    max={totalPages}
                    className="pagination-input"
                  />
                  <Button type="submit" className="pagination-go-button">
                    Đi
                  </Button>
                </Form>
              </div>
            </motion.div>
          </Container>
        </div>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminUsers;