/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Spinner, 
  Modal, 
  Carousel 
} from "react-bootstrap";
import { 
  FaStar, 
  FaBed, 
  FaBath, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaUser, 
  FaMoneyBillWave, 
  FaRulerCombined, 
  FaFileAlt, 
  FaHome, 
  FaFolderOpen, 
  FaCalendarTimes, 
  FaSyncAlt 
} from "react-icons/fa";
import { motion } from "framer-motion";
import apiServices from "../services/apiServices";
import "../assets/styles/ProjectDetail.css"

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

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); // Theo dõi ảnh đang chiếu trong carousel

  // Hàm gọi API để lấy chi tiết bài đăng
  const fetchProjectDetail = async () => {
    try {
      const response = await apiServices.get(`/api/posts/${id}`);
      if (response.data.statusCode === 200) {
        const post = response.data.data;

        const formattedProject = {
          id: post.id,
          title: post.title || "Không có tiêu đề",
          description: post.description || "Không có mô tả",
          type: post.type || "Không xác định",
          price: formatPrice(post.price || 0, post.type),
          area: post.area ? `${post.area}m²` : "Không xác định",
          address: [
            post.detailAddress,
            post.ward?.name,
            post.district?.name,
            post.province?.name,
          ]
            .filter(Boolean)
            .join(", ") || "Không xác định",
          bedrooms: post.bedrooms || 2,
          bathrooms: post.bathrooms || 2,
          category: post.category?.name || "Không xác định",
          vip: post.vip?.name || "VIP 4",
          status: post.status || "Không xác định",
          createdAt: formatDate(post.createdAt || new Date()),
          expireDate: formatDate(post.expireDate || new Date()),
          seller: post.user?.name || "Không xác định",
          contact: post.user?.phone || "Không có số điện thoại",
          email: post.user?.email || "Không có email",
          images: post.images && post.images.length > 0
            ? post.images.map((img) => `http://localhost:8080/uploads/${img.url}`)
            : ["https://placehold.co/600x400"],
        };

        setProject(formattedProject);
        setLoading(false);
      } else {
        throw new Error(response.data.message || "Không thể lấy chi tiết bài đăng.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết bài đăng:", err);
      setError(err.message || "Không thể lấy chi tiết bài đăng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProjectDetail();
  }, [id]);

  const handleShowImageModal = (img) => {
    setSelectedImage(img);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Cập nhật activeIndex khi carousel thay đổi
  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-bold">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <h3 className="text-muted">{error}</h3>
      </Container>
    );
  }

  return (
    <Container fluid className="py-5" style={{ background: "linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%)", minHeight: "100vh" }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-5 text-primary fw-bold" style={{ fontSize: "2.5rem" }}>
            {project.title}
          </h2>

          <Row className="g-4">
            {/* Hình ảnh dự án */}
            <Col lg={8}>
              <Card className="shadow-lg border-0" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Carousel activeIndex={activeIndex} onSelect={handleSelect}>
                  {project.images.map((img, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={img}
                        alt={`Ảnh ${index + 1}`}
                        className="d-block w-100"
                        style={{ height: "450px", objectFit: "contain", cursor: "pointer" }}
                        onClick={() => handleShowImageModal(img)}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
                <Card.Body className="d-flex flex-wrap gap-2 justify-content-center">
                  {project.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Ảnh ${index + 1}`}
                      className={`img-thumbnail ${activeIndex === index ? "border-primary" : ""}`}
                      style={{
                        width: activeIndex === index ? "80px" : "70px", // Phóng to ảnh đang chiếu
                        height: activeIndex === index ? "80px" : "70px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        transition: "all 0.3s",
                        border: activeIndex === index ? "2px solid #007bff" : "1px solid #ddd", // Viền xanh cho ảnh đang chiếu
                      }}
                    />
                  ))}
                </Card.Body>
              </Card>
            </Col>

            {/* Thông tin người đăng */}
            <Col lg={4}>
              <Card className="shadow-lg border-0 h-100" style={{ borderRadius: "15px" }}>
                <Card.Body>
                  <h5 className="text-primary fw-bold mb-4">Thông tin người đăng</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <strong><FaUser className="me-2 text-primary" /> Người bán:</strong> {project.seller}
                    </li>
                    <li className="mb-3">
                      <strong><FaPhone className="me-2 text-primary" /> Liên hệ:</strong>{" "}
                      <a href={`tel:${project.contact}`} className="text-decoration-none text-primary">{project.contact}</a>
                    </li>
                    <li className="mb-3">
                      <strong><FaEnvelope className="me-2 text-primary" /> Email:</strong>{" "}
                      <a href={`mailto:${project.email}`} className="text-decoration-none text-primary">{project.email}</a>
                    </li>
                    <li className="mb-3">
                      <strong><FaCalendarAlt className="me-2 text-primary" /> Đăng vào:</strong> {project.createdAt}
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            {/* Thông tin chi tiết */}
            <Col md={6}>
              <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
                <Card.Body>
                  <h5 className="text-primary fw-bold mb-4">Thông tin chi tiết</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <strong><FaMoneyBillWave className="me-2 text-primary" /> Giá:</strong>{" "}
                      <Badge bg="primary">{project.price}</Badge>
                    </li>
                    <li className="mb-3">
                      <strong><FaRulerCombined className="me-2 text-primary" /> Diện tích:</strong> {project.area}
                    </li>
                    <li className="mb-3">
                      <strong><FaMapMarkerAlt className="me-2 text-primary" /> Vị trí:</strong> {project.address}
                    </li>
                    <li className="mb-3">
                      <strong><FaBed className="me-2 text-primary" /> Phòng ngủ:</strong> {project.bedrooms}
                    </li>
                    <li className="mb-3">
                      <strong><FaBath className="me-2 text-primary" /> Phòng tắm:</strong> {project.bathrooms}
                    </li>
                    <li>
                      <strong><FaFileAlt className="me-2 text-primary" /> Mô tả:</strong>
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
                        {project.description}
                      </div>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            {/* Chi tiết bài đăng */}
            <Col md={6}>
              <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
                <Card.Body>
                  <h5 className="text-primary fw-bold mb-4">Chi tiết bài đăng</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <strong><FaHome className="me-2 text-primary" /> Loại bài đăng:</strong>{" "}
                      {project.type === "SALE" ? "Bán" : "Cho thuê"}
                    </li>
                    <li className="mb-3">
                      <strong><FaFolderOpen className="me-2 text-primary" /> Danh mục:</strong> {project.category}
                    </li>
                    <li className="mb-3">
                      <strong><FaStar className="me-2 text-primary" /> Gói VIP:</strong>{" "}
                      <span className="d-flex align-items-center gap-1">
                        <FaStar className="text-warning" /> {project.vip}
                      </span>
                    </li>
                    <li className="mb-3">
                      <strong><FaCalendarAlt className="me-2 text-primary" /> Ngày đăng:</strong> {project.createdAt}
                    </li>
                    <li className="mb-3">
                      <strong><FaCalendarTimes className="me-2 text-primary" /> Ngày hết hạn:</strong> {project.expireDate}
                    </li>
                    <li className="mb-3">
                      <strong><FaSyncAlt className="me-2 text-primary" /> Trạng thái:</strong>{" "}
                      {project.status === "EXPIRED" ? "Hết hạn" : "Đang hoạt động"}
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

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
        </motion.div>
      </Container>
    </Container>
  );
};

export default ProjectDetail;