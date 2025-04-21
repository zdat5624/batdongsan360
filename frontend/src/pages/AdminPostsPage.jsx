/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Pagination,
  Form,
  Button,
  Modal,
  Table,
  Alert,
} from "react-bootstrap";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaCalendarTimes,
  FaSyncAlt,
  FaUser,
  FaMoneyBillWave,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaHome,
  FaFolderOpen,
  FaFileAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Carousel } from "react-bootstrap";
import AdminHeader from "../components/AdminHeader";
import Sidebar from "../components/Sidebar";
import apiServices from "../services/apiServices";
import { Helmet } from "react-helmet";

// AdminFooter component (tái sử dụng từ AdminUsers)
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
    grid-template-columns: minmax(250px, 250px) 1fr;
    min-height: 100vh;
    background: #f0f4f8;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding: 20px;
    padding-top: 50px; /* Tăng padding-top để không bị AdminHeader che khuất */
    padding-bottom: 20px; /* Đảm bảo khoảng cách tự nhiên với footer */
    background-color: #f0f8ff;
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

  .filter-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .status-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 1rem;
  }

  .status-tab {
    border-radius: 50px; /* Rounded buttons */
    padding: 6px 16px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    border: 1px solid #007bff;
    background-color: transparent;
    color: #007bff;
  }

  .status-tab:hover {
    background-color: #e6f0ff;
  }

  .status-tab.active,
  .status-tab:focus,
  .status-tab:active,
  .btn-primary.status-tab {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-end;
  }

  .filter-select {
    border-radius: 8px;
    font-size: 0.9rem;
    padding: 8px;
    border: 1px solid #ced4da;
  }

  .filter-button {
    border-radius: 50px; /* Rounded buttons */
    font-size: 0.9rem;
    padding: 6px 16px;
    transition: all 0.2s ease;
    height: 38px; /* Match height with select inputs */
  }

  .filter-button.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
  }

  .filter-button.btn-outline-secondary {
    border-color: #ced4da;
    color: #6c757d;
  }

  .filter-button.btn-outline-secondary:hover {
    background-color: #f8f9fa;
  }

  .align-self-end {
    align-self: flex-end;
  }

  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: nowrap; /* Đảm bảo các phần tử nằm trên cùng một hàng */
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

  .carousel-img {
    height: 300px;
    object-fit: contain;
    border-radius: 10px;
    cursor: pointer;
    width: 100%;
  }

  .description-box {
    word-break: break-word;
    max-height: 150px;
    overflow-y: auto;
    white-space: pre-wrap;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f8f9fa;
    margin-top: 5px;
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
      max-height: calc(100vh - 60px); /* Giới hạn chiều cao của Sidebar để không che footer */
      overflow-y: auto;
    }
    .main-content {
      padding: 15px;
      padding-top: 100px;
      padding-bottom: 15px;
    }
    .page-title {
      font-size: 1.5rem;
    }
    .admin-table th:nth-child(4),
    .admin-table td:nth-child(4) {
      display: none; /* Ẩn cột Diện tích */
    }
    .status-tabs {
      gap: 8px;
    }
    .status-tab {
      padding: 5px 12px;
      font-size: 0.85rem;
    }
    .filter-group {
      flex-direction: row;
      gap: 8px;
    }
    .filter-select,
    .filter-button {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 576px) {
    .page-title {
      font-size: 1.25rem;
    }
    .admin-table th:nth-child(3),
    .admin-table td:nth-child(3) {
      display: none; /* Ẩn cột Giá */
    }
    .action-button {
      padding: 5px 8px;
      font-size: 0.8rem;
    }
    .carousel-img {
      height: 200px;
    }
    .status-tabs {
      gap: 6px;
    }
    .status-tab {
      padding: 4px 10px;
      font-size: 0.8rem;
    }
    .filter-group {
      gap: 6px;
    }
    .filter-select,
    .filter-button {
      font-size: 0.8rem;
      padding: 6px;
    }
    .pagination-container {
      flex-wrap: wrap; /* Cho phép xuống hàng trên màn hình nhỏ */
      justify-content: center;
    }
  }
`;

// Hàm chuyển đổi giá từ số sang chuỗi (triệu VNĐ hoặc triệu/tháng)
const formatPrice = (price, type) => {
  if (!price) return "Không xác định";
  if (price >= 1000000000) {
    return `${(price / 1000000000).toLocaleString("vi-VN")} tỷ${type === "RENT" ? "/tháng" : ""}`;
  }
  return `${(price / 1000000).toLocaleString("vi-VN")} triệu${type === "RENT" ? "/tháng" : ""}`;
};

// Hàm định dạng ngày
const formatDate = (dateString) => {
  if (!dateString) return "Không xác định";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Hàm lấy màu sắc cho trạng thái
const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "REVIEW_LATER":
      return "info";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "EXPIRED":
      return "danger";
    default:
      return "secondary";
  }
};

// Hàm tính toán minPrice và maxPrice dựa trên khoảng giá người dùng chọn
const calculatePriceRange = (priceRange) => {
  switch (priceRange) {
    case "under_1m":
      return { minPrice: 0, maxPrice: 1000000 };
    case "1m_2m":
      return { minPrice: 1000000, maxPrice: 2000000 };
    case "2m_3m":
      return { minPrice: 2000000, maxPrice: 3000000 };
    case "3m_5m":
      return { minPrice: 3000000, maxPrice: 5000000 };
    case "5m_7m":
      return { minPrice: 5000000, maxPrice: 7000000 };
    case "7m_10m":
      return { minPrice: 7000000, maxPrice: 10000000 };
    case "10m_15m":
      return { minPrice: 10000000, maxPrice: 15000000 };
    case "above_15m":
      return { minPrice: 15000000, maxPrice: 50000000000000000 };
    default:
      return { minPrice: 0, maxPrice: 50000000000000000 };
  }
};

// Hàm tính toán minArea và maxArea dựa trên khoảng diện tích người dùng chọn
const calculateAreaRange = (areaRange) => {
  switch (areaRange) {
    case "under_20m2":
      return { minArea: 0, maxArea: 20 };
    case "20m2_30m2":
      return { minArea: 20, maxArea: 30 };
    case "30m2_50m2":
      return { minArea: 30, maxArea: 50 };
    case "50m2_70m2":
      return { minArea: 50, maxArea: 70 };
    case "70m2_90m2":
      return { minArea: 70, maxArea: 90 };
    case "above_90m2":
      return { minArea: 90, maxArea: 1000000000 };
    default:
      return { minArea: 0, maxArea: 1000000000 };
  }
};

// eslint-disable-next-line react/prop-types
const AdminPostsPage = ({ user, setUser, handleLogin, handleLogout }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    priceRange: "",
    areaRange: "",
    status: "PENDING",
    type: "",
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [postIdToAction, setPostIdToAction] = useState(null);
  const [pageInput, setPageInput] = useState("");

  // Hàm gọi API để lấy danh sách bài đăng
  const fetchPostsForStatus = async (status, page = 0, updatedFilters = filters) => {
    try {
      const { minPrice, maxPrice } = calculatePriceRange(updatedFilters.priceRange);
      const { minArea, maxArea } = calculateAreaRange(updatedFilters.areaRange);

      const queryParams = new URLSearchParams({
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        status: status || "",
        type: updatedFilters.type || "",
        page,
        size: 10,
        sort: "id,desc",
      });

      const response = await apiServices.get(`/api/admin/posts?${queryParams.toString()}`);
      if (response.data.statusCode === 200) {
        return {
          posts: response.data.data.content.map((post) => ({
            id: post.id || 0,
            title: post.title || "Không có tiêu đề",
            description: post.description || "Không có mô tả",
            type: post.type || "Không xác định",
            price: formatPrice(post.price, post.type),
            area: post.area ? `${post.area}m²` : "Không xác định",
            address: `${
              post.detailAddress || ""
            }${post.ward?.name ? `, ${post.ward.name}` : ""}${post.district?.name ? `, ${post.district.name}` : ""}${post.province?.name ? `, ${post.province.name}` : ""}`.trim() || "Không xác định",
            status: post.status || "Không xác định",
            createdAt: formatDate(post.createdAt),
            expireDate: formatDate(post.expireDate),
            seller: post.user?.name || "Không xác định",
            contact: post.user?.phone || "Không có số điện thoại",
            email: post.user?.email || "Không có email",
            category: post.category?.name || "Không xác định",
            vip: post.vip?.name || "Không có gói VIP",
            images: post.images && post.images.length > 0
              ? post.images.map((img) => `http://localhost:8080/uploads/${img.url}`)
              : ["https://placehold.co/300x300"],
          })),
          totalPages: response.data.data.totalPages || 1,
        };
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách bài đăng.");
      }
    } catch (err) {
      console.error(`Lỗi khi lấy danh sách bài đăng cho status=${status}:`, err.message);
      return { posts: [], totalPages: 1 };
    }
  };

  const fetchPosts = async (page = 0, updatedFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const { posts: postsData, totalPages: totalPagesData } = await fetchPostsForStatus(
        updatedFilters.status,
        page,
        updatedFilters
      );

      setPosts(postsData);
      setTotalPages(totalPagesData);

      if (postsData.length === 0 && updatedFilters.status === "PENDING") {
        const newFilters = { ...updatedFilters, status: "REVIEW_LATER" };
        setFilters(newFilters);
        await fetchPosts(0, newFilters);
      }
    } catch (err) {
      setError(err.message || "Không thể lấy danh sách bài đăng.");
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, filters.status]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(0);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchPosts(0);
  };

  const handleShowDetail = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handleShowImage = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Xử lý hiển thị modal xác nhận
  const showConfirm = (action, postId, message) => {
    setConfirmAction(() => action);
    setPostIdToAction(postId);
    setConfirmMessage(message);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    try {
      await confirmAction(postIdToAction);
      setShowConfirmModal(false);
      setCurrentPage(0);
      await fetchPosts(0);
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra.");
      setShowConfirmModal(false);
    }
  };

  const handleApprove = async (postId) => {
    const response = await apiServices.put(`/api/admin/posts/status`, {
      postId: postId,
      status: "APPROVED",
      message: "Bài đăng của bạn đã được phê duyệt!",
    });
    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message || "Duyệt bài đăng thất bại.");
    }
  };

  const handleUnmarkReviewLater = async (postId) => {
    const response = await apiServices.put(`/api/admin/posts/status`, {
      postId: postId,
      status: "PENDING",
      message: "Bài đăng đã được gỡ trạng thái xem sau và chuyển về chờ duyệt.",
    });
    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message || "Gỡ bài đăng thất bại.");
    }
  };

  // Logic phân trang
  const paginate = (pageNumber) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
      setPageInput("");
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10) - 1;
    if (!isNaN(pageNumber) && pageNumber >= 0 && pageNumber < totalPages) {
      paginate(pageNumber);
    } else {
      alert(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalPages}`);
      setPageInput("");
    }
  };

  const resetFilters = () => {
    const newFilters = {
      priceRange: "",
      areaRange: "",
      status: "PENDING",
      type: "",
    };
    setFilters(newFilters);
    setCurrentPage(0);
    fetchPosts(0, newFilters);
  };

  // Render phân trang
  const renderPaginationItems = () => {
    const pageItems = [];
    const maxVisiblePages = 5;
    const ellipsis = <Pagination.Ellipsis disabled />;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let number = startPage; number <= endPage; number++) {
      pageItems.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }

    if (startPage > 0) {
      pageItems.unshift(
        <Pagination.Item key={0} onClick={() => paginate(0)}>
          1
        </Pagination.Item>
      );
      if (startPage > 1) {
        pageItems.splice(1, 0, ellipsis);
      }
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pageItems.push(ellipsis);
      }
      pageItems.push(
        <Pagination.Item key={totalPages - 1} onClick={() => paginate(totalPages - 1)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return pageItems;
  };

  return (
    <div className="layout">
      <Helmet>
        <title>Quản lý Bài Đăng - Admin Panel</title>
      </Helmet>
      <style>{customStyles}</style>
      <Sidebar user={user} handleLogout={handleLogout} />
      <div className="content-wrapper">
        <div className="admin-header">
          <AdminHeader user={user} setUser={setUser} handleLogin={handleLogin} handleLogout={handleLogout} />
        </div>
        <div className="main-content">
          <Container className="custom-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="page-title">
                <FaInfoCircle /> Quản lý Bài Đăng
              </h2>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Card className="filter-card">
                <Form onSubmit={handleFilterSubmit}>
                  <div className="filter-group">
                    {/* Status Buttons */}
                    {["PENDING", "REVIEW_LATER", "APPROVED", "REJECTED", "EXPIRED"].map((status) => (
                      <Button
                        key={status}
                        variant={filters.status === status ? "primary" : "outline-primary"}
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, status }));
                          setCurrentPage(0);
                          fetchPosts(0, { ...filters, status });
                        }}
                        className="status-tab me-2"
                      >
                        {status === "PENDING"
                          ? "Chờ duyệt"
                          : status === "REVIEW_LATER"
                          ? "Xem sau"
                          : status === "APPROVED"
                          ? "Đã duyệt"
                          : status === "REJECTED"
                          ? "Từ chối"
                          : "Hết hạn"}
                      </Button>
                    ))}

                    {/* Bộ lọc giá */}
                    <Form.Group controlId="priceRange" style={{ maxWidth: "200px" }}>
                      <Form.Label>Khoảng giá</Form.Label>
                      <Form.Select
                        name="priceRange"
                        value={filters.priceRange}
                        onChange={handleFilterChange}
                        className="filter-select"
                      >
                        <option value="">Tất cả</option>
                        <option value="under_1m">Dưới 1 triệu</option>
                        <option value="1m_2m">1 - 2 triệu</option>
                        <option value="2m_3m">2 - 3 triệu</option>
                        <option value="3m_5m">3 - 5 triệu</option>
                        <option value="5m_7m">5 - 7 triệu</option>
                        <option value="7m_10m">7 - 10 triệu</option>
                        <option value="10m_15m">10 - 15 triệu</option>
                        <option value="above_15m">Trên 15 triệu</option>
                      </Form.Select>
                    </Form.Group>

                    {/* Bộ lọc diện tích */}
                    <Form.Group controlId="areaRange" style={{ maxWidth: "200px" }}>
                      <Form.Label>Diện tích</Form.Label>
                      <Form.Select
                        name="areaRange"
                        value={filters.areaRange}
                        onChange={handleFilterChange}
                        className="filter-select"
                      >
                        <option value="">Tất cả</option>
                        <option value="under_20m2">Dưới 20m²</option>
                        <option value="20m2_30m2">20m² - 30m²</option>
                        <option value="30m2_50m2">30m² - 50m²</option>
                        <option value="50m2_70m2">50m² - 70m²</option>
                        <option value="70m2_90m2">70m² - 90m²</option>
                        <option value="above_90m2">Trên 90m²</option>
                      </Form.Select>
                    </Form.Group>

                    {/* Bộ lọc loại bài đăng */}
                    <Form.Group controlId="type" style={{ maxWidth: "200px" }}>
                      <Form.Label>Loại bài đăng</Form.Label>
                      <Form.Select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="filter-select"
                      >
                        <option value="">Tất cả</option>
                        <option value="RENT">Cho thuê</option>
                        <option value="SALE">Bán</option>
                      </Form.Select>
                    </Form.Group>

                    {/* Nút áp dụng và đặt lại */}
                    <Button
                      variant="primary"
                      type="submit"
                      className="filter-button align-self-end me-2"
                    >
                      Áp dụng
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={resetFilters}
                      className="filter-button align-self-end"
                    >
                      Đặt lại
                    </Button>
                  </div>
                </Form>
              </Card>

              {/* Danh sách bài đăng dạng bảng */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  <Table responsive className="admin-table">
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Giá</th>
                        <th>Diện tích</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <tr key={post.id}>
                            <td>{post.title}</td>
                            <td className="text-primary fw-bold">{post.price}</td>
                            <td>{post.area}</td>
                            <td>
                              <span
                                className={`badge bg-${getStatusBadgeVariant(post.status)}`}
                              >
                                {post.status === "PENDING"
                                  ? "Chờ duyệt"
                                  : post.status === "REVIEW_LATER"
                                  ? "Xem sau"
                                  : post.status === "APPROVED"
                                  ? "Đã duyệt"
                                  : post.status === "REJECTED"
                                  ? "Từ chối"
                                  : "Hết hạn"}
                              </span>
                            </td>
                            <td>
                              {(post.status === "PENDING" || post.status === "REVIEW_LATER") && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    showConfirm(
                                      handleApprove,
                                      post.id,
                                      "Bạn có chắc chắn muốn duyệt bài đăng này?"
                                    )
                                  }
                                  className="action-button me-2"
                                >
                                  Duyệt
                                </Button>
                              )}
                              {post.status === "REVIEW_LATER" && (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() =>
                                    showConfirm(
                                      handleUnmarkReviewLater,
                                      post.id,
                                      "Bạn có chắc chắn muốn gỡ bài đăng này và chuyển về trạng thái chờ duyệt?"
                                    )
                                  }
                                  className="action-button me-2"
                                >
                                  Gỡ bài
                                </Button>
                              )}
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleShowDetail(post)}
                                className="action-button"
                              >
                                Chi tiết
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            Không tìm thấy bài đăng nào phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* Modal xác nhận hành động */}
                  <Modal
                    show={showConfirmModal}
                    onHide={() => setShowConfirmModal(false)}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Xác nhận hành động</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{confirmMessage}</Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={() => setShowConfirmModal(false)}
                      >
                        Hủy
                      </Button>
                      <Button variant="primary" onClick={handleConfirmAction}>
                        Xác nhận
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  {/* Modal chi tiết bài đăng */}
                  {selectedPost && (
                    <Modal show={showModal} onHide={handleCloseModal} size="lg">
                      <Modal.Header closeButton>
                        <Modal.Title>{selectedPost.title}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <div>
                          {/* Hình ảnh: Carousel */}
                          <div className="mb-4">
                            <h5 className="fw-bold mb-3 text-primary">Hình ảnh</h5>
                            {selectedPost.images?.length > 0 ? (
                              <Carousel>
                                {selectedPost.images.map((img, index) => (
                                  <Carousel.Item key={index}>
                                    <img
                                      src={img}
                                      alt={`Ảnh ${index + 1}`}
                                      className="carousel-img"
                                      onClick={() => handleShowImage(img)}
                                    />
                                  </Carousel.Item>
                                ))}
                              </Carousel>
                            ) : (
                              <p className="text-muted">Không có hình ảnh</p>
                            )}
                          </div>

                          {/* Thông tin cơ bản */}
                          <h5 className="fw-bold mb-3 text-primary">Thông tin cơ bản</h5>
                          <ul className="list-unstyled mb-4">
                            <li className="mb-2 d-flex align-items-center">
                              <FaMoneyBillWave className="me-2 text-primary" />
                              <strong>Giá:</strong> <span className="ms-1">{selectedPost.price}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaRulerCombined className="me-2 text-primary" />
                              <strong>Diện tích:</strong> <span className="ms-1">{selectedPost.area}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaMapMarkerAlt className="me-2 text-primary" />
                              <strong>Vị trí:</strong> <span className="ms-1">{selectedPost.address}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaHome className="me-2 text-primary" />
                              <strong>Loại bài đăng:</strong>{" "}
                              <span className="ms-1">{selectedPost.type === "SALE" ? "Bán" : "Cho thuê"}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaFolderOpen className="me-2 text-primary" />
                              <strong>Danh mục:</strong> <span className="ms-1">{selectedPost.category}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaStar className="me-2 text-primary" />
                              <strong>Gói VIP:</strong>{" "}
                              <span className="d-flex align-items-center gap-1 ms-1">
                                <FaStar className="text-warning" /> {selectedPost.vip}
                              </span>
                            </li>
                          </ul>
                          <hr className="my-4" />

                          {/* Thông tin người đăng */}
                          <h5 className="fw-bold mb-3 text-primary">Thông tin người đăng</h5>
                          <ul className="list-unstyled mb-4">
                            <li className="mb-2 d-flex align-items-center">
                              <FaUser className="me-2 text-primary" />
                              <strong>Người bán:</strong> <span className="ms-1">{selectedPost.seller}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaPhone className="me-2 text-primary" />
                              <strong>Liên hệ:</strong>{" "}
                              <a href={`tel:${selectedPost.contact}`} className="ms-1 text-decoration-none text-primary">
                                {selectedPost.contact}
                              </a>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaEnvelope className="me-2 text-primary" />
                              <strong>Email:</strong>{" "}
                              <a href={`mailto:${selectedPost.email}`} className="ms-1 text-decoration-none text-primary">
                                {selectedPost.email}
                              </a>
                            </li>
                          </ul>
                          <hr className="my-4" />

                          {/* Chi tiết bài đăng */}
                          <h5 className="fw-bold mb-3 text-primary">Chi tiết bài đăng</h5>
                          <ul className="list-unstyled">
                            <li className="mb-2 d-flex align-items-center">
                              <FaCalendarAlt className="me-2 text-primary" />
                              <strong>Ngày đăng:</strong> <span className="ms-1">{selectedPost.createdAt}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaCalendarTimes className="me-2 text-primary" />
                              <strong>Ngày hết hạn:</strong> <span className="ms-1">{selectedPost.expireDate}</span>
                            </li>
                            <li className="mb-2 d-flex align-items-center">
                              <FaSyncAlt className="me-2 text-primary" />
                              <strong>Trạng thái:</strong>{" "}
                              <span className="ms-1">
                                {selectedPost.status === "PENDING"
                                  ? "Chờ duyệt"
                                  : selectedPost.status === "REVIEW_LATER"
                                  ? "Xem sau"
                                  : selectedPost.status === "APPROVED"
                                  ? "Đã duyệt"
                                  : selectedPost.status === "REJECTED"
                                  ? "Từ chối"
                                  : "Hết hạn"}
                              </span>
                            </li>
                            <li className="mt-3">
                              <div className="d-flex align-items-start">
                                <FaFileAlt className="me-2 text-primary mt-1" />
                                <div>
                                  <strong>Mô tả:</strong>
                                  <div className="description-box">{selectedPost.description}</div>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                          Đóng
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  )}
                  {/* Modal phóng to hình ảnh */}
                  <Modal
                    show={showImageModal}
                    onHide={handleCloseImageModal}
                    centered
                    size="xl"
                  >
                    <Modal.Body className="p-0">
                      {selectedImage && (
                        <img
                          src={selectedImage}
                          alt="Hình ảnh phóng to"
                          className="img-fluid"
                          style={{
                            width: "100%",
                            maxHeight: "90vh",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Modal.Body>
                  </Modal>

                  {/* Phân trang */}
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <Pagination>
                        <Pagination.First onClick={() => paginate(0)} disabled={currentPage === 0} />
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 0} />
                        {renderPaginationItems()}
                        <Pagination.Next
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                        />
                        <Pagination.Last
                          onClick={() => paginate(totalPages - 1)}
                          disabled={currentPage === totalPages - 1}
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
                  )}
                </>
              )}
            </motion.div>
          </Container>
        </div>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminPostsPage;