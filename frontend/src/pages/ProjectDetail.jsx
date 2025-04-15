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
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaUser, 
  FaMoneyBillWave, 
  FaRulerCombined, 
  FaFileAlt, 
  FaHome, 
  FaFolderOpen, 
  FaCalendarAlt, 
  FaCalendarTimes 
} from "react-icons/fa";
import { motion } from "framer-motion";
import apiServices from "../services/apiServices";
import "../assets/styles/ProjectDetail.css";

const formatPrice = (price, type) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toLocaleString("vi-VN")} tỷ${type === "RENT" ? "/tháng" : ""}`;
  }
  return `${(price / 1000000).toLocaleString("vi-VN")} triệu${type === "RENT" ? "/tháng" : ""}`;
};

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
  const [activeIndex, setActiveIndex] = useState(0);

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
          ].filter(Boolean).join(", ") || "Không xác định",
          category: post.category?.name || "Không xác định",
          vip: post.vip?.name || "VIP 4",
          createdAt: formatDate(post.createdAt || new Date()),
          expireDate: formatDate(post.expireDate || new Date()),
          seller: post.user?.name || "Không xác định",
          contact: post.user?.phone || "Không có số điện thoại",
          email: post.user?.email || "Không có email",
          images: post.images && post.images.length > 0
            ? post.images.map((img) => `http://localhost:8080/uploads/${img.url}`)
            : ["https://placehold.co/600x400"],
          updatedAt: post.updatedAt ? formatDate(post.updatedAt) : "Không xác định",
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
    <Container fluid className="py-5" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%)", minHeight: "100vh" }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="mb-5 text-primary fw-bold text-center" style={{ fontSize: "2.3rem", letterSpacing: "0.5px", marginBottom: "4rem" }}>
            {project.title}
          </h2>

          <Row className="g-4">
            {/* Hình ảnh dự án */}
            <Col lg={8}>
              <Card className="shadow-sm border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <Carousel activeIndex={activeIndex} onSelect={handleSelect} interval={5000}>
                  {project.images.map((img, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={img}
                        alt={`Ảnh ${index + 1}`}
                        className="d-block w-100"
                        style={{ height: "400px", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => handleShowImageModal(img)}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
                <Card.Body className="d-flex flex-wrap gap-2 justify-content-center py-3">
                  {project.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Ảnh ${index + 1}`}
                      className={`img-thumbnail ${activeIndex === index ? "border-primary" : ""}`}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        cursor: "pointer",
                        border: activeIndex === index ? "2px solid #007bff" : "1px solid #e0e0e0",
                        transition: "all 0.2s",
                      }}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </Card.Body>
              </Card>
            </Col>

            {/* Thông tin liên hệ (chuyển lên chỗ bản đồ) */}
            <Col lg={4}>
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4">
                  <h5 className="text-primary fw-bold mb-4">Thông tin liên hệ</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <FaUser className="me-2 text-primary" />
                      <span><strong>Người bán:</strong> {project.seller}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaPhone className="me-2 text-primary" />
                      <span>
                        <strong>Liên hệ:</strong>{" "}
                        <a href={`tel:${project.contact}`} className="text-decoration-none text-primary">{project.contact}</a>
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaEnvelope className="me-2 text-primary" />
                      <span>
                        <strong>Email:</strong>{" "}
                        <a href={`mailto:${project.email}`} className="text-decoration-none text-primary">{project.email}</a>
                      </span>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            {/* Thông tin chi tiết */}
            <Col lg={12}>
              <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4">
                  <h5 className="text-primary fw-bold mb-4">Thông tin chi tiết</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <FaMoneyBillWave className="me-2 text-primary" />
                      <span><strong>Giá:</strong>{" "}
                        <Badge bg="primary">{project.price}</Badge>
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaRulerCombined className="me-2 text-primary" />
                      <span><strong>Diện tích:</strong> {project.area}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      <span><strong>Vị trí:</strong> {project.address}</span>
                    </li>
                    <li>
                      <strong><FaFileAlt className="me-2 text-primary" /> Mô tả:</strong>
                      <div
                        style={{
                          wordBreak: "break-word",
                          maxHeight: "120px",
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                          padding: "8px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          background: "#f9fafb",
                          marginTop: "8px",
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
            <Col lg={12}>
              <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-8">
                  <h5 className="text-primary fw-bold mb-4">Chi tiết bài đăng</h5>
                  <ul className="list-unstyled">
                    <li className="mb-3 d-flex align-items-center">
                      <FaHome className="me-2 text-primary" />
                      <span><strong>Loại bài đăng:</strong>{" "}
                        {project.type === "SALE" ? "Bán" : "Cho thuê"}
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaFolderOpen className="me-2 text-primary" />
                      <span><strong>Danh mục:</strong> {project.category}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaStar className="me-2 text-primary" />
                      <span><strong>Gói VIP:</strong>{" "}
                        <span className="d-flex align-items-center gap-1">
                          <FaStar className="text-warning" /> {project.vip}
                        </span>
                      </span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-primary" />
                      <span><strong>Ngày đăng:</strong> {project.createdAt}</span>
                    </li>
                    <li className="mb-3 d-flex align-items-center">
                      <FaCalendarTimes className="me-2 text-primary" />
                      <span><strong>Ngày hết hạn:</strong> {project.expireDate}</span>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Modal phóng to hình ảnh */}
          <Modal show={showImageModal} onHide={handleCloseImageModal} centered size="lg">
            <Modal.Body className="p-0">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Hình ảnh phóng to"
                  className="img-fluid"
                  style={{
                    width: "100%",
                    maxHeight: "80vh",
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