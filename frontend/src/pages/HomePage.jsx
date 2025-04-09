/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Spinner, Card, Button, Badge } from "react-bootstrap";
import { FaPhone, FaStar, FaBed, FaBath } from "react-icons/fa";
import { Link } from "react-router-dom";
import SearchForm from "../components/SearchForm";
import apiServices from "../services/apiServices";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

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

// Hàm gọi Geocoding API từ frontend
const geocodeAddress = async (address) => {
  const GOOGLE_MAPS_API_KEY = "AIzaSyBFT6_QJdQlx2rLZ3yaacTqxUhytn5wuHA"; // Thay bằng API Key của bạn
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.error("Geocoding API error:", data.status);
      return null;
    }
  } catch (error) {
    console.error("Error calling Geocoding API:", error.message);
    return null;
  }
};

// CSS tùy chỉnh
const customStyles = `
  .content-wrapper {
    min-height: calc(100vh - 60px);
    background-color: #f0f8ff;
    color: #333;
  }
  .project-section h2 {
    font-size: 2rem;
    color: #007bff;
    font-weight: bold;
    border-bottom: none;
    padding-bottom: 10px;
  }
  .project-section p {
    color: #adb5bd;
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
    height: 250px;
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
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 65%;
    justify-content: space-between;
  }
  .card-title-body {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
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
    font-size: 1.1rem;
    font-weight: 700;
    color: #e74c3c;
    margin: 0;
    margin-left: 10px;
  }
  .card-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
    color: #555;
  }
  .card-info .info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
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
    font-size: 0.85rem;
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
    padding: 5px 14px;
    font-size: 0.85rem;
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
  .post-date {
    color: #28a745;
    font-weight: 500;
  }
  .map-container {
    height: 500px;
    width: 100%;
    position: relative;
    margin-bottom: 2rem;
  }
  .map-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
  }
  .map-controls button {
    margin-left: 5px;
  }
  .map-counter {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    z-index: 1;
  }
  .custom-marker {
    background-color: #dc3545;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    border: 1px solid white;
  }
`;

const HomePage = ({ setLoading }) => {
  const [projectsData, setProjectsData] = useState({
    sell: [],
    rent: [],
    projects: [],
  });
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const [revealedPhones, setRevealedPhones] = useState({});
  const [vipLevels, setVipLevels] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 10.7769, lng: 106.7009 }); // Mặc định là trung tâm TP.HCM
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsWithCoordinates, setProjectsWithCoordinates] = useState([]);

  // Cấu hình Google Maps
  const mapContainerStyle = {
    height: "500px",
    width: "100%",
  };

  const mapOptions = {
    zoom: 12,
    center: mapCenter,
  };

  // Lấy danh sách gói VIP
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

  // Hàm gọi API để lấy danh sách bài đăng theo type
  const fetchPostsByType = async (type) => {
    try {
      const response = await apiServices.get(`/api/posts?page=0&size=10&type=${type}`);
      console.log(`API Response for type=${type}:`, response);

      if (response.data.statusCode === 200) {
        const posts = Array.isArray(response.data.data.content) ? response.data.data.content : response.data.data;

        return posts.map((post) => {
          // Chuyển đổi giá thành định dạng "triệu" hoặc "tỷ"
          let priceDisplay = "Đang cập nhật";
          if (post.price) {
            const priceInMillions = post.price / 1000000;
            if (priceInMillions >= 1000) {
              const priceInBillions = priceInMillions / 1000;
              priceDisplay = `${priceInBillions.toLocaleString("vi-VN")} tỷ`;
            } else {
              priceDisplay = `${priceInMillions.toLocaleString("vi-VN")} triệu`;
            }
            if (type === "RENT") {
              priceDisplay += "/tháng";
            }
          }

          // Định dạng số điện thoại
          const fullPhone = post.user?.phone || "0123456789";
          const hiddenPhone = fullPhone.slice(0, 4) + "******";

          // Xác định vipLevel
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

          // Tính thời gian đã đăng
          const timeAgo = getTimeAgo(post.createdAt);

          return {
            id: post.id,
            title: post.title,
            desc: post.description || "Không có mô tả",
            price: priceDisplay,
            area: `${post.area}m²`,
            bedrooms: post.bedrooms || 2,
            bathrooms: post.bathrooms || 2,
            location: `${post.detailAddress}, ${post.ward.name}, ${post.district.name}, ${post.province.name}`,
            img: post.images && post.images.length > 0 ? `http://localhost:8080/uploads/${post.images[0].url}` : "https://placehold.co/300x300",
            category: post.category?.name || "Không xác định",
            phone: fullPhone,
            hiddenPhone: hiddenPhone,
            vipPackage: vipName,
            vipLevel: vipLevel,
            timeAgo,
          };
        });
      } else {
        throw new Error(response.data.message || `Không thể lấy danh sách bài đăng cho type=${type}.`);
      }
    } catch (err) {
      console.error(`Lỗi chi tiết khi lấy danh sách bài đăng (type=${type}):`, err.response || err.message);
      return [];
    }
  };

  // Hàm gọi API để lấy tất cả bài đăng
  const fetchPosts = async () => {
    try {
      const [sellPosts, rentPosts] = await Promise.all([
        fetchPostsByType("SALE"),
        fetchPostsByType("RENT"),
      ]);

      const allPosts = [...sellPosts, ...rentPosts];
      const projectPosts = allPosts.filter((post) => {
        if (post.category && typeof post.category === "string") {
          return post.category.toLowerCase() === "dự án";
        }
        return false;
      });

      return { sell: sellPosts, rent: rentPosts, projects: projectPosts };
    } catch (err) {
      console.error("Lỗi chi tiết khi lấy danh sách bài đăng:", err.response || err.message);
      setError(err.response?.data?.message || err.message || "Không thể lấy danh sách bài đăng.");
      return { sell: [], rent: [], projects: [] };
    }
  };

  // Hàm lấy tọa độ cho tất cả bài đăng
  const fetchCoordinatesForPosts = async (posts) => {
    const postsWithCoordinates = await Promise.all(
      posts.map(async (post) => {
        const coordinates = await geocodeAddress(post.location);
        return {
          ...post,
          coordinates: coordinates || { lat: 0, lng: 0 }, // Nếu không lấy được tọa độ, trả về mặc định
        };
      })
    );
    return postsWithCoordinates;
  };

  useEffect(() => {
    // Lấy danh sách gói VIP khi component mount
    fetchVipLevels();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchPosts().then(async ({ sell, rent, projects }) => {
      console.log("Dữ liệu sau khi phân loại:", { sell, rent, projects });
      setProjectsData({ sell, rent, projects });

      // Lấy tọa độ cho tất cả bài đăng
      const allPosts = [...sell, ...rent, ...projects];
      const postsWithCoordinates = await fetchCoordinatesForPosts(allPosts);
      setProjectsWithCoordinates(postsWithCoordinates);

      // Cập nhật trung tâm bản đồ dựa trên tọa độ trung bình
      const validCoordinates = postsWithCoordinates
        .filter((post) => post.coordinates && post.coordinates.lat !== 0 && post.coordinates.lng !== 0)
        .map((post) => post.coordinates);
      if (validCoordinates.length > 0) {
        const avgLat = validCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / validCoordinates.length;
        const avgLng = validCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / validCoordinates.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }

      setLoading(false);
    });
  }, [setLoading, vipLevels]);

  const handleSearch = (filterCriteria) => {
    setFilters(filterCriteria);
  };

  const parsePriceString = (priceStr) => {
    if (!priceStr) return null;
    const lowerStr = priceStr.toLowerCase();
    if (lowerStr.includes("đang cập nhật")) return null;
    let multiplier = 1;
    if (lowerStr.includes("tỷ")) multiplier = 1000000000;
    else if (lowerStr.includes("triệu")) multiplier = 1000000;
    const match = lowerStr.match(/[\d,.]+/);
    if (!match) return null;
    const numStr = match[0].replace(/[.,]/g, "");
    const value = parseInt(numStr, 10);
    if (isNaN(value)) return null;
    return value * multiplier;
  };

  const filterProjects = (projects) => {
    let filtered = projects;
    if (filters.searchQuery) {
      filtered = filtered.filter((project) =>
        project.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter((project) =>
        filters.categoryIds.includes(project.categoryId)
      );
    }
    if (filters.price && (filters.price.min || filters.price.max)) {
      const minPrice = filters.price.min ? parseInt(filters.price.min, 10) : null;
      const maxPrice = filters.price.max ? parseInt(filters.price.max, 10) : null;
      filtered = filtered.filter((project) => {
        const projectPrice = parsePriceString(project.price);
        if (projectPrice === null) return false;
        if (minPrice !== null && projectPrice < minPrice) return false;
        if (maxPrice !== null && projectPrice > maxPrice) return false;
        return true;
      });
    }
    if (filters.area && (filters.area.min || filters.area.max)) {
      const minArea = filters.area.min ? parseInt(filters.area.min, 10) : null;
      const maxArea = filters.area.max ? parseInt(filters.area.max, 10) : null;
      filtered = filtered.filter((project) => {
        const projectArea = parseInt(project.area, 10);
        if (isNaN(projectArea)) return false;
        if (minArea !== null && projectArea < minArea) return false;
        if (maxArea !== null && projectArea > maxArea) return false;
        return true;
      });
    }
    return filtered;
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
          [projectId]: projectsData.sell.find(p => p.id === projectId)?.phone ||
                       projectsData.rent.find(p => p.id === projectId)?.phone ||
                       projectsData.projects.find(p => p.id === projectId)?.phone,
        };
      }
    });
  };

  const handleReCenter = () => {
    const validCoordinates = projectsWithCoordinates
      .filter((post) => post.coordinates && post.coordinates.lat !== 0 && post.coordinates.lng !== 0)
      .map((post) => post.coordinates);
    if (validCoordinates.length > 0) {
      const avgLat = validCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / validCoordinates.length;
      const avgLng = validCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / validCoordinates.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  };

  const sectionsToDisplay = [
    { name: "Bán", type: "sell" },
    { name: "Thuê", type: "rent" },
    { name: "Dự án tiêu biểu", type: "projects" },
  ];

  return (
    <Container fluid style={{ backgroundColor: "#f0f8ff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{customStyles}</style>
      <Container className="py-5 content-wrapper" style={{ flex: "1 0 auto" }}>
        <Row className="mb-5">
          <Col xs={12} lg={12} className="mx-auto">
            <SearchForm onSearch={handleSearch} />
          </Col>
        </Row>

        {/* Section Bản Đồ */}
        <section className="project-section mb-5">
          <Row className="mb-4">
            <Col>
              <h2>Bản Đồ Bất Động Sản</h2>
              <p>Xem vị trí các bất động sản trên bản đồ</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="map-container">
                <LoadScript googleMapsApiKey="AIzaSyBFT6_QJdQlx2rLZ3yaacTqxUhytn5wuHA">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={mapOptions.zoom}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: true,
                    }}
                  >
                    {projectsWithCoordinates.map((project) => (
                      project.coordinates && project.coordinates.lat !== 0 && project.coordinates.lng !== 0 && (
                        <Marker
                          key={project.id}
                          position={project.coordinates}
                          onClick={() => setSelectedProject(project)}
                          label={{
                            text: project.price,
                            className: "custom-marker",
                          }}
                        />
                      )
                    ))}
                    {selectedProject && (
                      <InfoWindow
                        position={selectedProject.coordinates}
                        onCloseClick={() => setSelectedProject(null)}
                      >
                        <div>
                          <h6>{selectedProject.title}</h6>
                          <p>{selectedProject.price}</p>
                          <p>{selectedProject.location}</p>
                          <Link to={`/post/${selectedProject.id}`}>Xem chi tiết</Link>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
                <div className="map-counter">
                  {projectsWithCoordinates.length} bất động sản
                </div>
                <div className="map-controls">
                  <Button variant="secondary" onClick={() => setMapCenter({ lat: 10.7769, lng: 106.7009 })}>
                    Remove Boundary
                  </Button>
                  <Button variant="primary" onClick={handleReCenter}>
                    Re-center
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </section>

        {projectsData.sell.length === 0 && projectsData.rent.length === 0 && projectsData.projects.length === 0 && !error ? (
          <Row className="justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <Col xs="auto" className="text-center">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 text-muted fs-5">Đang tải dữ liệu...</p>
            </Col>
          </Row>
        ) : (
          <>
            {error && (
              <Row className="mb-4">
                <Col>
                  <div className="alert alert-danger">{error}</div>
                </Col>
              </Row>
            )}

            {sectionsToDisplay.map((section, index) => {
              const projects = filterProjects(projectsData[section.type]);

              return (
                projects.length > 0 && (
                  <section key={index} className="project-section mb-5">
                    <Row className="mb-4">
                      <Col>
                        <h2>{section.name}</h2>
                        <p>Danh sách {section.name.toLowerCase()} được cập nhật mới nhất</p>
                      </Col>
                    </Row>
                    <Row xs={1} className="g-4">
                      {projects.map((project) => (
                        <Col key={project.id}>
                          <Link to={`/post/${project.id}`} style={{ textDecoration: "none" }}>
                            <Card className="hover-card">
                              <div className="card-img-wrapper">
                                <Card.Img variant="top" src={project.img} className="card-img-top" />
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
                                      <FaBed /> {project.bedrooms}
                                    </span>
                                    <span>
                                      <FaBath /> {project.bathrooms}
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
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </section>
                )
              );
            })}
          </>
        )}
      </Container>
    </Container>
  );
};

export default HomePage;