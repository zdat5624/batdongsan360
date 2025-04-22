/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Spinner,
  Alert,
  Pagination,
  Button,
} from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { motion } from "framer-motion";
import apiServices from "../services/apiServices";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

// CSS tùy chỉnh
const customStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    background: rgb(240, 248, 255);
  }
  .content-wrapper {
    display: grid;
    grid-template-columns: minmax(200px, 250px) 1fr; /* Sidebar rộng 250px, nội dung chính chiếm phần còn lại */
    flex: 1;
    width: 100%;
  }
  .main-content {
    flex: 1;
    padding-top: 50px;
    padding-bottom: 150px;
    padding-left: 20px;
    padding-right: 20px;
    background: rgb(240, 248, 255);
    width: 100%;
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
  .bell-icon {
    animation: bellRing 2s infinite;
  }
  @keyframes bellRing {
    0% { transform: rotate(0deg); }
    5% { transform: rotate(15deg); }
    10% { transform: rotate(-15deg); }
    15% { transform: rotate(10deg); }
    20% { transform: rotate(-10deg); }
    25% { transform: rotate(0deg); }
    100% { transform: rotate(0deg); }
  }
  .notification-table {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }
  .notification-table thead {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #fff;
  }
  .notification-table th, .notification-table td {
    border: 1px solid #e9ecef;
    padding: 12px;
  }
  .notification-table tbody tr {
    transition: background-color 0.3s ease;
  }
  .notification-table tbody tr:hover {
    background-color: #e6f0ff;
  }
  .notification-table tbody tr:nth-child(odd) {
    background-color: #f8f9fa;
  }
  .notification-table tbody tr:nth-child(even) {
    background-color: #ffffff;
  }
  .custom-alert {
    border-radius: 10px;
    background: linear-gradient(135deg, #ff6b6b, #dc3545);
    color: #fff;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    border: 1px solid #ced4da;
    transition: border-color 0.3s ease;
  }
  .pagination-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
  .pagination-go-button {
    height: 32px;
    border-radius: 5px;
    font-size: 0.9rem;
    padding: 0 15px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
    color: #fff;
    transition: background 0.3s ease;
  }
  .pagination-go-button:hover {
    background: linear-gradient(135deg, #0056b3, #003d80);
  }
  .pagination {
    margin-bottom: 0;
  }
  .pagination .page-item .page-link {
    border-radius: 5px;
    color: #007bff;
    border: 1px solid #dee2e6;
    margin: 0 2px;
    transition: all 0.3s ease;
  }
  .pagination .page-item.active .page-link {
    background: linear-gradient(135deg, #007bff, #0056b3);
    border-color: #007bff;
    color: #fff;
  }
  .pagination .page-item .page-link:hover {
    background-color: #e6f0ff;
  }
  .pagination-form {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .mark-read-button {
    border-radius: 15px;
    padding: 5px 10px;
    font-size: 0.9rem;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
    color: #fff;
    transition: background 0.3s ease;
  }
  .mark-read-button:hover {
    background: linear-gradient(135deg, #0056b3, #003d80);
  }
  @media (max-width: 768px) {
    .content-wrapper {
      grid-template-columns: 1fr; /* Chỉ hiển thị nội dung chính, không có Sidebar */
    }
    .sidebar {
      position: fixed;
      width: 100%;
      z-index: 1000;
      top: 0;
      left: 0;
      display: none; /* Ẩn Sidebar trên thiết bị nhỏ */
    }
    .main-content {
      padding: 15px;
      padding-top: 30px; /* Giảm padding-top trên thiết bị nhỏ */
    }
    .page-title {
      font-size: 1.5rem;
    }
  }
  @media (max-width: 576px) {
    .page-title {
      font-size: 1.25rem;
    }
    .notification-table th, .notification-table td {
      padding: 8px;
    }
    .mark-read-button {
      padding: 4px 8px;
      font-size: 0.8rem;
    }
  }
`;

const NotificationsPage = ({ user, handleLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const notificationsPerPage = 15; // Cố định 15 thông báo mỗi trang

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "N/A";
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffInMs = now - postDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Bạn cần đăng nhập để xem thông báo.");
      }
      const response = await apiServices.get(
        `/api/notifications?userId=${userId}&page=${currentPage}&size=${notificationsPerPage}&sort=createdAt,desc`
      );
      if (response.data.statusCode === 200) {
        const notificationData = response.data.data;
        setNotifications(notificationData.content || []);
        setTotalPages(notificationData.totalPages || 1);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách thông báo.");
      }
    } catch (err) {
      setError(err.message || "Không thể lấy danh sách thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await apiServices.put(`/api/notifications/${notificationId}/read`);
      if (response.data.statusCode === 200) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      } else {
        throw new Error(response.data.message || "Không thể đánh dấu thông báo là đã đọc.");
      }
    } catch (err) {
      setError(err.message || "Không thể đánh dấu thông báo là đã đọc. Vui lòng thử lại.");
    }
  };

  // Logic phân trang
  const maxPagesToShow = 5;
  const pageNumbers = [];
  let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
      setPageInput("");
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10); // Đã là 1-based
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      paginate(pageNumber - 1); // Chuyển về 0-based
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Container className="custom-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="page-title">
                  <FaBell className="bell-icon" /> Tất Cả Thông Báo
                </h2>
              </div>

              {error && (
                <Alert variant="danger" className="custom-alert">
                  <span role="img" aria-label="error" className="me-2">
                    ⚠️
                  </span>
                  {error}
                </Alert>
              )}

              <div className="notification-table">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th className="p-3">Nội Dung</th>
                      <th className="p-3">Thời Gian</th>
                      <th className="p-3">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          <Spinner animation="border" variant="primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                          </Spinner>
                        </td>
                      </tr>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <tr
                          key={notification.id}
                          style={{ transition: "background-color 0.3s" }}
                        >
                          <td className="p-3">{notification.message || "Không có nội dung"}</td>
                          <td className="p-3">{getTimeAgo(notification.createdAt)}</td>
                          <td className="p-3">
                            {notification.read ? (
                              <span className="text-muted">Đã đọc</span>
                            ) : (
                              <span className="text-primary">Chưa đọc</span>
                            )}
                          </td>
                          
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4 text-muted">
                          Không có thông báo nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Row className="justify-content-center mt-5">
                  <Col xs="auto">
                    <div className="pagination-container">
                      <Pagination>
                        <Pagination.First
                          onClick={() => paginate(0)}
                          disabled={currentPage === 0}
                          className="shadow-sm"
                        />
                        <Pagination.Prev
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 0}
                          className="shadow-sm"
                        />
                        {startPage > 0 && (
                          <>
                            <Pagination.Item onClick={() => paginate(0)} className="shadow-sm">
                              1
                            </Pagination.Item>
                            {startPage > 1 && <Pagination.Ellipsis />}
                          </>
                        )}
                        {pageNumbers.map((page) => (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => paginate(page)}
                            className="shadow-sm"
                          >
                            {page + 1}
                          </Pagination.Item>
                        ))}
                        {endPage < totalPages - 1 && (
                          <>
                            {endPage < totalPages - 2 && <Pagination.Ellipsis />}
                            <Pagination.Item onClick={() => paginate(totalPages - 1)} className="shadow-sm">
                              {totalPages}
                            </Pagination.Item>
                          </>
                        )}
                        <Pagination.Next
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                          className="shadow-sm"
                        />
                        <Pagination.Last
                          onClick={() => paginate(totalPages - 1)}
                          disabled={currentPage === totalPages - 1}
                          className="shadow-sm"
                        />
                      </Pagination>

                      <form
                        onSubmit={handlePageInputSubmit}
                        className="pagination-form"
                      >
                        <input
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
                          type="submit"
                          className="pagination-go-button"
                        >
                          Đi
                        </Button>
                      </form>
                    </div>
                  </Col>
                </Row>
              )}
            </Container>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationsPage;