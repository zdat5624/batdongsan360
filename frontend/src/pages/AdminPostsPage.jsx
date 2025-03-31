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
import apiServices from "../services/apiServices";
import { motion } from "framer-motion";
import { Carousel } from "react-bootstrap";

// CSS tùy chỉnh
const customStyles = `
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
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
`;

// Hàm chuyển đổi giá từ số sang chuỗi (triệu VNĐ hoặc triệu/tháng)
const formatPrice = (price, type) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toLocaleString("vi-VN")} tỷ${type === "RENT" ? "/tháng" : ""}`;
  }
  return `${(price / 1000000).toLocaleString("vi-VN")} triệu${type === "RENT" ? "/tháng" : ""}`;
};

// Hàm định dạng ngày
const formatDate = (dateString) => {
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

const AdminPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    priceRange: "",
    areaRange: "",
    status: "PENDING_AND_REVIEW_LATER",
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
  const [pageInput, setPageInput] = useState(""); // State cho input số trang

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
        size: 15,
        sort: "id,desc",
      });

      const response = await apiServices.get(`/api/admin/posts?${queryParams.toString()}`);
      if (response.data.statusCode === 200) {
        return response.data.data.content.map((post) => ({
          id: post.id,
          title: post.title,
          description: post.description || "Không có mô tả",
          type: post.type,
          price: formatPrice(post.price, post.type),
          area: `${post.area}m²`,
          address: `${post.detailAddress}${post.ward?.name ? `, ${post.ward.name}` : ""}${post.district?.name ? `, ${post.district.name}` : ""}${post.province?.name ? `, ${post.province.name}` : ""}`,
          status: post.status,
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
        }));
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách bài đăng.");
      }
    } catch (err) {
      console.error(`Lỗi khi lấy danh sách bài đăng cho status=${status}:`, err.response?.data || err.message);
      return [];
    }
  };

  const fetchPosts = async (page = 0, updatedFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      let postsData = [];
      let totalPagesData = 1;

      if (updatedFilters.status === "PENDING_AND_REVIEW_LATER") {
        const pendingPosts = await fetchPostsForStatus("PENDING", page, updatedFilters);
        const reviewLaterPosts = await fetchPostsForStatus("REVIEW_LATER", page, updatedFilters);
        postsData = [...pendingPosts, ...reviewLaterPosts];
        const pendingResponse = await apiServices.get(`/api/admin/posts?${new URLSearchParams({ status: "PENDING", page, size: 15, sort: "id,desc" })}`);
        const reviewLaterResponse = await apiServices.get(`/api/admin/posts?${new URLSearchParams({ status: "REVIEW_LATER", page, size: 15, sort: "id,desc" })}`);
        const pendingTotalPages = pendingResponse.data.statusCode === 200 ? pendingResponse.data.data.totalPages : 1;
        const reviewLaterTotalPages = reviewLaterResponse.data.statusCode === 200 ? reviewLaterResponse.data.data.totalPages : 1;
        totalPagesData = Math.max(pendingTotalPages, reviewLaterTotalPages);
      } else {
        postsData = await fetchPostsForStatus(updatedFilters.status, page, updatedFilters);
        const response = await apiServices.get(`/api/admin/posts?${new URLSearchParams({ status: updatedFilters.status, page, size: 15, sort: "id,desc" })}`);
        totalPagesData = response.data.statusCode === 200 ? response.data.data.totalPages : 1;
      }

      setPosts(postsData);
      setTotalPages(totalPagesData);

      if (postsData.length === 0 && updatedFilters.status === "PENDING_AND_REVIEW_LATER") {
        const newFilters = { ...updatedFilters, status: "APPROVED" };
        setFilters(newFilters);
        fetchPosts(0, newFilters);
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể lấy danh sách bài đăng.");
      setPosts([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
      fetchPosts(0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra.");
      setShowConfirmModal(false);
    }
  };

  const handleApprove = async (postId) => {
    const response = await apiServices.put(`/api/admin/posts/status`, {
      postId: postId,
      status: "APPROVED",
      message: "Bài đăng của bạn đã được phê duyệt!",
    });
    if (response.data.statusCode === 200) {
      setConfirmMessage("Duyệt bài đăng thành công!");
    } else {
      throw new Error(response.data.message || "Duyệt bài đăng thất bại.");
    }
  };

  const handleUnmarkReviewLater = async (postId) => {
    const response = await apiServices.put(`/api/admin/posts/status`, {
      postId: postId,
      status: "PENDING",
      message: "Bài đăng đã được gỡ trạng thái xem sau và chuyển về chờ duyệt.",
    });
    if (response.data.statusCode === 200) {
      setConfirmMessage("Gỡ bài đăng thành công! Bài đăng đã được chuyển về trạng thái chờ duyệt.");
    } else {
      throw new Error(response.data.message || "Gỡ bài đăng thất bại.");
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
    const pageNumber = parseInt(pageInput, 10) - 1; // Chuyển về index 0-based
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
      status: "",
      type: "",
    };
    setFilters(newFilters);
    setCurrentPage(0);
    fetchPosts(0, newFilters);
  };

  return (
    <Container fluid className="py-5" style={{ background: "#E6F3FF", minHeight: "100vh" }}>
      <style>{customStyles}</style>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tiêu đề */}
          <Row className="mb-5">
            <Col>
              <h2 className="text-primary fw-bold text-center" style={{ fontSize: "2.5rem" }}>
                Quản Lý Bài Đăng
              </h2>
            </Col>
          </Row>

          {/* Bộ lọc */}
          <Row className="mb-5">
            <Col>
              <Card className="shadow-lg border-0 p-4" style={{ borderRadius: "15px" }}>
                <Form onSubmit={handleFilterSubmit}>
                  <Row className="align-items-end">
                    <Col md={3} className="mb-3">
                      <Form.Group controlId="priceRange">
                        <Form.Label className="fw-bold">Khoảng giá</Form.Label>
                        <Form.Select
                          name="priceRange"
                          value={filters.priceRange}
                          onChange={handleFilterChange}
                          className="shadow-sm"
                          style={{ borderRadius: "10px", padding: "10px" }}
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
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group controlId="areaRange">
                        <Form.Label className="fw-bold">Khoảng diện tích</Form.Label>
                        <Form.Select
                          name="areaRange"
                          value={filters.areaRange}
                          onChange={handleFilterChange}
                          className="shadow-sm"
                          style={{ borderRadius: "10px", padding: "10px" }}
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
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group controlId="status">
                        <Form.Label className="fw-bold">Trạng thái</Form.Label>
                        <Form.Select
                          name="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          className="shadow-sm"
                          style={{ borderRadius: "10px", padding: "10px" }}
                        >
                          <option value="">Tất cả</option>
                          <option value="PENDING_AND_REVIEW_LATER">Chờ duyệt/Xem sau</option>
                          <option value="PENDING">Chờ duyệt</option>
                          <option value="REVIEW_LATER">Xem sau</option>
                          <option value="APPROVED">Đã duyệt</option>
                          <option value="EXPIRED">Hết hạn</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group controlId="type">
                        <Form.Label className="fw-bold">Loại bài đăng</Form.Label>
                        <Form.Select
                          name="type"
                          value={filters.type}
                          onChange={handleFilterChange}
                          className="shadow-sm"
                          style={{ borderRadius: "10px", padding: "10px" }}
                        >
                          <option value="">Tất cả</option>
                          <option value="RENT">Cho thuê</option>
                          <option value="SALE">Bán</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 shadow-sm"
                        style={{ borderRadius: "20px", padding: "10px" }}
                      >
                        Áp dụng bộ lọc
                      </Button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Button
                        variant="outline-secondary"
                        onClick={resetFilters}
                        className="w-100 shadow-sm"
                        style={{ borderRadius: "20px", padding: "10px" }}
                      >
                        Đặt lại bộ lọc
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>

          {/* Danh sách bài đăng dạng bảng */}
          {loading ? (
            <Row className="justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
              <Col xs="auto" className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted fw-bold">Đang tải dữ liệu...</p>
              </Col>
            </Row>
          ) : error ? (
            <Row className="justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
              <Col xs="auto" className="text-center">
                <Alert variant="danger" className="rounded-pill">{error}</Alert>
              </Col>
            </Row>
          ) : (
            <>
              <Card className="shadow-lg border-0" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Table hover className="align-middle mb-0">
                  <thead style={{ background: "#f8f9fa" }}>
                    <tr>
                      <th>ID</th>
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
                          <td>{post.id}</td>
                          <td>{post.title}</td>
                          <td className="text-primary fw-bold">{post.price}</td>
                          <td>{post.area}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(post.status)}>
                              {post.status === "PENDING" ? "Chờ duyệt" : post.status === "REVIEW_LATER" ? "Xem sau" : post.status === "APPROVED" ? "Đã duyệt" : "Hết hạn"}
                            </Badge>
                          </td>
                          <td>
                            {(post.status === "PENDING" || post.status === "REVIEW_LATER") && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => showConfirm(handleApprove, post.id, "Bạn có chắc chắn muốn duyệt bài đăng này?")}
                                className="me-2 shadow-sm"
                                style={{ borderRadius: "15px" }}
                              >
                                Duyệt
                              </Button>
                            )}
                            {post.status === "REVIEW_LATER" && (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => showConfirm(handleUnmarkReviewLater, post.id, "Bạn có chắc chắn muốn gỡ bài đăng này và chuyển về trạng thái chờ duyệt?")}
                                className="me-2 shadow-sm"
                                style={{ borderRadius: "15px" }}
                              >
                                Gỡ bài
                              </Button>
                            )}
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleShowDetail(post)}
                              className="me-2 shadow-sm"
                              style={{ borderRadius: "15px" }}
                            >
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Không tìm thấy bài đăng nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card>

              {/* Modal xác nhận hành động */}
              <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(45deg, #007bff, #00b4d8)" }}>
                  <Modal.Title className="text-white fw-bold">Xác nhận hành động</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                  <p>{confirmMessage}</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirmModal(false)}
                    style={{ borderRadius: "20px" }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmAction}
                    style={{ borderRadius: "20px" }}
                  >
                    Xác nhận
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Modal hiển thị chi tiết bài đăng */}
              <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(45deg, #007bff, #00b4d8)" }}>
                  <Modal.Title className="text-white">{selectedPost?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                  {selectedPost && (
                    <Row>
                      <Col md={6}>
                        <h5 className="fw-bold mb-3">Hình ảnh</h5>
                        {selectedPost.images.length > 0 ? (
                          <Carousel>
                            {selectedPost.images.map((img, index) => (
                              <Carousel.Item key={index}>
                                <img
                                  src={img}
                                  alt={`Ảnh ${index + 1}`}
                                  className="d-block w-100"
                                  style={{ height: "300px", objectFit: "cover", borderRadius: "10px" }}
                                  onClick={() => handleShowImage(img)}
                                />
                              </Carousel.Item>
                            ))}
                          </Carousel>
                        ) : (
                          <p className="text-muted">Không có hình ảnh</p>
                        )}
                      </Col>
                      <Col md={6}>
                        <h5 className="fw-bold mb-3">Thông tin cơ bản</h5>
                        <ul className="list-unstyled">
                          <li><strong>💰 Giá:</strong> <Badge bg="primary">{selectedPost.price}</Badge></li>
                          <li><strong>📏 Diện tích:</strong> {selectedPost.area}</li>
                          <li><strong>📍 Vị trí:</strong> {selectedPost.address}</li>
                          <li><strong>🏠 Loại bài đăng:</strong> {selectedPost.type === "SALE" ? "Bán" : "Cho thuê"}</li>
                          <li><strong>📂 Danh mục:</strong> {selectedPost.category}</li>
                          <li><strong>🌟 Gói VIP:</strong> {selectedPost.vip}</li>
                        </ul>
                      </Col>
                      <Col md={6} className="mt-4">
                        <h5 className="fw-bold mb-3">Thông tin người đăng</h5>
                        <ul className="list-unstyled">
                          <li><strong>📌 Người bán:</strong> {selectedPost.seller}</li>
                          <li><strong>📞 Liên hệ:</strong> <a href={`tel:${selectedPost.contact}`}>{selectedPost.contact}</a></li>
                          <li><strong>📧 Email:</strong> <a href={`mailto:${selectedPost.email}`}>{selectedPost.email}</a></li>
                        </ul>
                      </Col>
                      <Col md={6} className="mt-4">
                        <h5 className="fw-bold mb-3">Chi tiết bài đăng</h5>
                        <ul className="list-unstyled">
                          <li><strong>📅 Ngày đăng:</strong> {selectedPost.createdAt}</li>
                          <li><strong>⏳ Ngày hết hạn:</strong> {selectedPost.expireDate}</li>
                          <li><strong>🔄 Trạng thái:</strong> {selectedPost.status === "PENDING" ? "Chờ duyệt" : selectedPost.status === "REVIEW_LATER" ? "Xem sau" : selectedPost.status === "APPROVED" ? "Đã duyệt" : "Hết hạn"}</li>
                          <li>
                            <strong>📝 Mô tả:</strong>
                            <div
                              style={{
                                wordBreak: "break-word",
                                maxHeight: "150px",
                                overflowY: "auto",
                                whiteSpace: "pre-wrap",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                background: "#f8f9fa",
                              }}
                            >
                              {selectedPost.description}
                            </div>
                          </li>
                        </ul>
                      </Col>
                    </Row>
                  )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                  <Button
                    variant="outline-secondary"
                    onClick={handleCloseModal}
                    style={{ borderRadius: "20px" }}
                  >
                    Đóng
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Modal phóng to hình ảnh */}
              <Modal show={showImageModal} onHide={handleCloseImageModal} centered size="xl">
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
                            <Pagination.Item onClick={() => paginate(0)} className="shadow-sm">1</Pagination.Item>
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

                      <Form
                        onSubmit={handlePageInputSubmit}
                        className="d-flex align-items-center"
                      >
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
                  </Col>
                </Row>
              )}
            </>
          )}
        </motion.div>
      </Container>
    </Container>
 

);
};

export default AdminPostsPage;