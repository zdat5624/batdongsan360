/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Badge, Pagination, Form, Button } from "react-bootstrap";
import { FaPhone, FaStar } from "react-icons/fa";
import SearchForm from "../components/SearchForm";
import apiServices from "../services/apiServices";
import "../assets/styles/App.css";

// Hàm chuyển đổi giá từ số sang chuỗi (triệu VNĐ hoặc tỷ VNĐ)
const formatPrice = (price) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toLocaleString("vi-VN")} tỷ`;
  }
  return `${(price / 1000000).toLocaleString("vi-VN")} triệu`;
};

// Hàm tính thời gian đã đăng (phút, giờ, ngày trước)
const getTimeAgo = (createdAt) => {
  if (!createdAt) return "N/A";

  const now = new Date();
  const postDate = new Date(createdAt);
  const diffInMs = now - postDate;

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `Đã đăng ${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `Đã đăng ${diffInHours} giờ trước`;
  } else {
    return `Đã đăng ${diffInDays} ngày trước`;
  }
};

// CSS tùy chỉnh (giữ nguyên như cũ)
const customStyles = `
  .sell-page-container {
    background-color: #f0f8ff;
    min-height: 100vh;
    padding-top: 100px;
  }
  .hover-card {
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    background-color: #fff;
    border-radius: 12px;
    border: none;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    height: 300px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .hover-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  .card-img-wrapper {
    position: relative;
    width: 35%;
    height: 100%;
    overflow: hidden;
  }
  .card-img-top {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  .hover-card:hover .card-img-top {
    transform: scale(1.05);
  }
  .card-img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 12px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
  }
  .vip-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.8rem;
    padding: 4px 8px;
    border-radius: 12px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 1;
  }
  .vip-0 {
    background: linear-gradient(45deg, #007bff, #00b7eb);
  }
  .vip-1 {
    background: linear-gradient(45deg, #28a745, #34c759);
  }
  .vip-2 {
    background: linear-gradient(45deg, #ffc107, #ffdb58);
  }
  .vip-3 {
    background: linear-gradient(45deg, #ff6f61, #ff9f43);
  }
  .vip-4 {
    background: linear-gradient(45deg, #dc3545, #ff5e62);
  }
  .vip-star {
    color: #ffd700;
  }
  .card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 65%;
    justify-content: space-between;
  }
  .card-title-body {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vip-title-0 {
    background: linear-gradient(45deg, #007bff, #00b7eb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .vip-title-1 {
    background: linear-gradient(45deg, #28a745, #34c759);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .vip-title-2 {
    background: linear-gradient(45deg, #ffc107, #ffdb58);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .vip-title-3 {
    background: linear-gradient(45deg, #ff6f61, #ff9f43);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .vip-title-4 {
    background: linear-gradient(45deg, #dc3545, #ff5e62);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .card-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #e74c3c;
    margin: 0;
    margin-left: 10px;
  }
  .card-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.9rem;
    color: #555;
  }
  .card-info .info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .card-info span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .card-info i {
    color: #007bff;
  }
  .card-description {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .contact-button {
    background-color: #17a2b8;
    border: none;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background-color 0.3s ease;
    color: #fff;
    align-self: flex-start;
  }
  .contact-button:hover {
    background-color: #138496;
  }
  .pagination-input {
    width: 70px;
    display: inline-block;
    margin: 0 5px;
  }
  .go-button {
    margin-left: 5px;
  }
  .pagination {
    gap: 5px;
  }
  .pagination .page-item .page-link {
    border-radius: 5px;
    color: #007bff;
    transition: background-color 0.3s ease;
  }
  .pagination .page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
    color: #fff;
  }
  .pagination .page-item .page-link:hover {
    background-color: #e9ecef;
  }
  .post-count {
    font-size: 1rem;
    font-weight: 500;
    color: #555;
    text-align: center;
    margin-top: 0.5rem;
  }
  .post-date {
    color: #28a745;
    font-weight: 500;
  }
`;

const SellPage = ({ setLoading: setParentLoading }) => {
  const [loading, setLoading] = useState(false);
  const [isShowingLoading, setIsShowingLoading] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const [searchFilters, setSearchFilters] = useState({});
  const [revealedPhones, setRevealedPhones] = useState({});
  const [vipLevels, setVipLevels] = useState({});
  const projectsPerPage = 12;

  const fetchVipLevels = async () => {
    try {
      const response = await apiServices.get("/api/vips");
      if (response.data.statusCode === 200) {
        const vipData = response.data.data;
        const vipLevelMap = {};
        vipData.forEach((vip) => {
          vipLevelMap[vip.id] = vip.vipLevel;
        });
        setVipLevels(vipLevelMap);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách gói VIP.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách gói VIP:", err.response?.data || err.message);
      setVipLevels({});
    }
  };

  const fetchTotalPosts = async () => {
    try {
      const queryParams = new URLSearchParams({
        type: "SALE",
        status: "APPROVED",
        page: 0,
        size: 1,
      });

      const response = await apiServices.get(`/api/posts?${queryParams.toString()}`);
      if (response.data.statusCode === 200) {
        const total = response.data.data.totalElements;
        setTotalPosts(total);
      } else {
        throw new Error(response.data.message || "Không thể lấy tổng số bài đăng.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy tổng số bài đăng:", err.response?.data || err.message);
      setTotalPosts(0);
    }
  };

  const fetchPosts = async (page = 0, filters = {}) => {
    try {
      setLoading(true);
      setParentLoading(true);

      const queryParams = new URLSearchParams({
        page,
        size: projectsPerPage,
        sort: "id,desc",
        type: "SALE",
        status: "APPROVED",
        minPrice: filters.minPrice ?? 0,
        maxPrice: filters.maxPrice ?? 50000000000000000,
        minArea: filters.minArea ?? 0,
        maxArea: filters.maxArea ?? 1000000000,
      });

      // Chỉ thêm các tham số nếu chúng có giá trị (không phải null hoặc undefined)
      if (filters.provinceCode != null) {
        queryParams.append("provinceCode", filters.provinceCode);
      }
      if (filters.districtCode != null) {
        queryParams.append("districtCode", filters.districtCode);
      }
      if (filters.wardCode != null) {
        queryParams.append("wardCode", filters.wardCode);
      }
      if (filters.categoryIds != null && filters.categoryIds.length > 0) {
        // Gửi danh sách categoryIds dưới dạng chuỗi, ví dụ: categoryIds=1,2,3
        queryParams.append("categoryIds", filters.categoryIds.join(","));
      }

      console.log("Query params gửi đến API:", queryParams.toString());

      const response = await apiServices.get(`/api/posts?${queryParams.toString()}`);
      console.log("Phản hồi từ API:", response.data);

      if (response.data.statusCode === 200) {
        const posts = response.data.data.content;
        if (posts.length === 0) {
          console.warn("API trả về danh sách bài đăng rỗng. Kiểm tra bộ lọc và dữ liệu trong database.");
        }

        const formattedProjects = posts
          .map((post) => {
            const price = parseFloat(post.price);
            if (isNaN(price)) {
              console.warn(`Giá không hợp lệ cho bài đăng ID ${post.id}: ${post.price}`);
              return null;
            }

            const area = parseFloat(post.area);
            if (isNaN(area)) {
              console.warn(`Diện tích không hợp lệ cho bài đăng ID ${post.id}: ${post.area}`);
              return null;
            }

            const fullPhone = post.user?.phone || "0123456789";
            const hiddenPhone = fullPhone.slice(0, 4) + "******";

            let vipLevel = 0;
            let vipName = "Không có gói VIP";

            if (post.vip) {
              if (post.vip.vipLevel !== undefined) {
                vipLevel = post.vip.vipLevel;
                vipName = post.vip.name || `VIP ${vipLevel}`;
              } else if (post.vip.id && vipLevels[post.vip.id] !== undefined) {
                vipLevel = vipLevels[post.vip.id];
                vipName = post.vip.name || `VIP ${vipLevel}`;
              } else if (post.vip.name) {
                const vipLevelMatch = post.vip.name.match(/VIP\s*(\d+)/i);
                vipLevel = vipLevelMatch ? parseInt(vipLevelMatch[1], 10) : 0;
                vipName = post.vip.name;
              }
            }

            const timeAgo = getTimeAgo(post.createdAt);

            return {
              id: post.id,
              title: post.title,
              desc: post.description || "Không có mô tả",
              img: post.images && post.images.length > 0 ? `http://localhost:8080/uploads/${post.images[0].url}` : "https://placehold.co/300x300",
              price: formatPrice(price),
              area: `${area}m²`,
              location: `${post.detailAddress}, ${post.ward.name}, ${post.district.name}, ${post.province.name}`,
              vipPackage: vipName,
              vipLevel: vipLevel,
              categoryId: post.category?.id || null,
              phone: fullPhone,
              hiddenPhone: hiddenPhone,
              timeAgo,
            };
          })
          .filter((project) => project !== null);

        setAllProjects(formattedProjects);
        setTotalPages(response.data.data.totalPages);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách bài đăng.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bài đăng (SellPage):", err.response?.data || err.message);
      setAllProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  useEffect(() => {
    fetchVipLevels();
    fetchTotalPosts();
    fetchPosts(0, searchFilters);
  }, []);

  useEffect(() => {
    setIsShowingLoading(true);
    setTimeout(() => {
      setIsShowingLoading(false);
    }, 2000);

    fetchPosts(currentPage - 1, searchFilters);
  }, [currentPage, vipLevels, searchFilters]); // Thêm searchFilters vào dependency để gọi lại fetchPosts khi bộ lọc thay đổi

  const handleSearch = (searchData) => {
    console.log("Search data received in SellPage:", searchData);
    setSearchFilters(searchData);
    setCurrentPage(1);
    setPageInput("");

    setIsShowingLoading(true);
    setTimeout(() => {
      setIsShowingLoading(false);
    }, 2000);

    fetchPosts(0, searchData);
  };

  const handleTogglePhone = (projectId) => {
    setRevealedPhones((prev) => {
      const isRevealed = !!prev[projectId];
      if (isRevealed) {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      } else {
        return {
          ...prev,
          [projectId]: allProjects.find((p) => p.id === projectId)?.phone,
        };
      }
    });
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setPageInput("");
  };

  const handlePageInput = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      paginate(pageNumber);
    } else {
      alert(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalPages}`);
      setPageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePageInput();
    }
  };

  const maxPagesToShow = 5;
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Container fluid className="py-5 sell-page-container">
      <style>{customStyles}</style>
      <Container>
        <Row className="mb-4">
          <Col>
            <SearchForm
              onSearch={handleSearch}
              hideTransactionType={true}
              projects={allProjects}
            />
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <h2 className="text-primary fw-bold text-center">Danh Sách Nhà Đất Bán</h2>
            <p className="post-count">
              Hiện có <strong>{allProjects.length}</strong> bài đăng (Tổng cộng: <strong>{totalPosts}</strong> bài đăng)
            </p>
          </Col>
        </Row>

        {isShowingLoading ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <Row xs={1} className="g-4">
              {allProjects.length > 0 ? (
                allProjects.map((project) => (
                  <Col key={project.id}>
                    <NavLink to={`/post/${project.id}`} style={{ textDecoration: "none" }}>
                      <Card className="hover-card">
                        <div className="card-img-wrapper">
                          <Card.Img variant="top" src={project.img} alt={project.title} className="card-img-top" />
                          <div className="card-img-overlay">
                            <Badge className={`vip-badge vip-${project.vipLevel}`}>
                              <FaStar className="vip-star" />
                              {project.vipPackage}
                            </Badge>
                          </div>
                        </div>
                        <Card.Body>
                          <Card.Text className={`card-title-body vip-title-${project.vipLevel}`}>
                            {project.title}
                          </Card.Text>
                          <Card.Text className="card-price">{project.price}</Card.Text>
                          <div className="card-info">
                            <div className="info-row">
                              <span>
                                <i className="bi bi-rulers"></i> {project.area}
                              </span>
                              <span>
                                <i className="bi bi-geo-alt"></i> {project.location}
                              </span>
                            </div>
                            <span className="post-date">
                              <i className="bi bi-clock"></i> {project.timeAgo}
                            </span>
                          </div>
                          <Card.Text className="card-description">{project.desc}</Card.Text>
                          <Button
                            className="contact-button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleTogglePhone(project.id);
                            }}
                          >
                            <FaPhone />{" "}
                            {revealedPhones[project.id] ? `${revealedPhones[project.id]} - Hiển số` : `${project.hiddenPhone} - Hiển số`}
                          </Button>
                        </Card.Body>
                      </Card>
                    </NavLink>
                  </Col>
                ))
              ) : (
                <Col className="text-center py-5">
                  <p className="text-muted">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Không tìm thấy kết quả nào phù hợp.
                  </p>
                </Col>
              )}
            </Row>

            {totalPages > 1 && allProjects.length > 0 && (
              <Row className="justify-content-center mt-5">
                <Col xs="auto">
                  <Pagination>
                    <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                    {startPage > 1 && (
                      <>
                        <Pagination.Item onClick={() => paginate(1)}>1</Pagination.Item>
                        {startPage > 2 && <Pagination.Ellipsis />}
                      </>
                    )}
                    {pageNumbers.map((page) => (
                      <Pagination.Item key={page} active={page === currentPage} onClick={() => paginate(page)}>
                        {page}
                      </Pagination.Item>
                    ))}
                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && <Pagination.Ellipsis />}
                        <Pagination.Item onClick={() => paginate(totalPages)}>{totalPages}</Pagination.Item>
                      </>
                    )}
                    <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                    <Form.Control
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pagination-input"
                      placeholder="Trang"
                    />
                    <Button variant="primary" onClick={handlePageInput} className="go-button">
                      Đi
                    </Button>
                  </Pagination>
                </Col>
              </Row>
            )}
          </>
        )}
      </Container>
    </Container>
  );
};

export default SellPage;