/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  ListGroup,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiServices from "../services/apiServices";
import Sidebar from "../components/Sidebar"; 
import Footer from "../components/Footer"; 
import "../assets/styles/HistoryNew.css";

// Thêm CSS tùy chỉnh để thay đổi màu nền của trang và bố trí layout
const pageStyles = `
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
    padding-top: 70px; /* Tạo khoảng cách với Header */
    padding-bottom: 150px; /* Tránh bị che bởi Footer */
    background-color: #f0f8ff; /* Màu nền xanh nhạt cho nội dung chính */
  }
  .custom-container {
    background-color: #f0f8ff; /* Màu nền xanh nhạt cho container */
  }
  .history-card {
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .history-header {
    background-color: #007bff;
    color: white;
    font-weight: bold;
    border-radius: 10px 10px 0 0;
  }
  .custom-tabs .nav-link {
    font-weight: bold;
    color: #007bff;
    border-radius: 10px 10px 0 0;
  }
  .custom-tabs .nav-link.active {
    background-color: #007bff;
    color: white;
  }
  .post-list {
    border-radius: 8px;
    overflow: hidden;
  }
  .post-item {
    border-bottom: 1px solid #dee2e6;
  }
  .post-item:last-child {
    border-bottom: none;
  }
  .post-title {
    font-size: 1.1rem;
    color: #333;
  }
  .post-meta {
    color: #6c757d;
  }
  .remaining-days {
    color: #28a745;
    font-weight: bold;
  }
  .action-btn {
    border-radius: 20px;
    font-weight: 500;
  }
  .view-btn {
    border-color: #007bff;
    color: #007bff;
  }
  .view-btn:hover {
    background-color: #007bff;
    color: white;
  }
  .renew-btn {
    border-color: #28a745;
    color: #28a745;
  }
  .renew-btn:hover {
    background-color: #28a745;
    color: white;
  }
  .repost-btn {
    border-color: #007bff;
    color: #007bff;
  }
  .repost-btn:hover {
    background-color: #007bff;
    color: white;
  }
  .button-group {
    display: flex;
    gap: 10px;
  }
  .custom-badge {
    font-size: 0.8rem;
    padding: 0.3em 0.6em;
  }
  .tab-title {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .empty-message {
    font-size: 1rem;
    color: #6c757d;
  }
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .spinner-custom {
    width: 3rem;
    height: 3rem;
  }
  .alert-custom {
    border-radius: 10px;
    text-align: center;
  }
`;

// eslint-disable-next-line react/prop-types
const HistoryNew = ({ user, handleShowLogoutConfirm }) => {
  const navigate = useNavigate();
  const [activePosts, setActivePosts] = useState([]);
  const [expiredPosts, setExpiredPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách tin đăng của người dùng từ API
  useEffect(() => {
    if (!user) return;

    const fetchUserPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử tin đăng.");
        }

        console.log("User hiện tại:", user);
        console.log("Access Token:", token);

        const response = await apiServices.get("/api/posts/my-posts?page=0&size=10");
        console.log("Response từ API /api/posts/my-posts:", response.data);

        if (response.data.statusCode === 200) {
          const posts = response.data.data.content;
          console.log("Danh sách tin đăng:", posts);

          if (posts.length === 0) {
            console.warn("Không có bài đăng nào được tìm thấy cho người dùng hiện tại.");
          }

          const currentDate = new Date();

          // Phân loại tin thành "đang chờ duyệt", "đang hoạt động" và "hết hạn"
          const pending = posts.filter(
            (post) => post.status === "PENDING" || post.status === "REVIEW_LATER"
          );
          const active = posts.filter(
            (post) => post.status === "APPROVED" && post.expireDate && new Date(post.expireDate) > currentDate
          );
          const expired = posts.filter(
            (post) => post.status === "APPROVED" && post.expireDate && new Date(post.expireDate) <= currentDate
          );

          setPendingPosts(
            pending.map((post) => ({
              id: post.id,
              title: post.title,
              date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "N/A",
              views: post.view || 0,
            }))
          );

          setActivePosts(
            active.map((post) => {
              const expireDate = new Date(post.expireDate);
              const timeDiff = expireDate - currentDate;
              const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
              return {
                id: post.id,
                title: post.title,
                date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "N/A",
                views: post.view || 0,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
              };
            })
          );

          setExpiredPosts(
            expired.map((post) => ({
              id: post.id,
              title: post.title,
              date: post.expireDate ? new Date(post.expireDate).toLocaleDateString("vi-VN") : "N/A",
              views: post.view || 0,
            }))
          );
        } else {
          throw new Error(response.data.message || "Không thể lấy danh sách tin đăng.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách tin đăng:", err.response?.data || err.message);
        setError(err.message || "Không thể lấy danh sách tin đăng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  // Xử lý gia hạn tin
  const handleRenewPost = async (postId) => {
    try {
      const response = await apiServices.put(`/api/posts/${postId}/renew`, {
        numberOfDays: 10,
      });
      if (response.data.statusCode === 200) {
        alert("Gia hạn tin thành công!");
        const updatedPost = response.data.data;
        const updatedExpiredPosts = expiredPosts.filter((post) => post.id !== postId);
        setExpiredPosts(updatedExpiredPosts);

        const currentDate = new Date();
        const expireDate = new Date(updatedPost.expireDate);
        const timeDiff = expireDate - currentDate;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        setActivePosts([
          ...activePosts,
          {
            id: updatedPost.id,
            title: updatedPost.title,
            date: updatedPost.createdAt ? new Date(updatedPost.createdAt).toLocaleDateString("vi-VN") : "N/A",
            views: updatedPost.view || 0,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          },
        ]);
      } else {
        throw new Error(response.data.message || "Không thể gia hạn tin.");
      }
    } catch (err) {
      console.error("Lỗi khi gia hạn tin:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Không thể gia hạn tin. Vui lòng thử lại sau.";
      if (errorMessage.includes("Insufficient balance")) {
        setError("Tài khoản của bạn không đủ tiền để gia hạn tin. Vui lòng nạp thêm tiền.");
      } else {
        setError(errorMessage);
      }
    }
  };

  // Xử lý đăng lại tin
  const handleRepost = async (postId) => {
    try {
      const response = await apiServices.post(`/api/posts/${postId}/repost`);
      if (response.data.statusCode === 200) {
        alert("Đăng lại tin thành công!");
        const newPost = response.data.data;
        const updatedExpiredPosts = expiredPosts.filter((post) => post.id !== postId);
        setExpiredPosts(updatedExpiredPosts);

        const currentDate = new Date();
        const expireDate = new Date(newPost.expireDate);
        const timeDiff = expireDate - currentDate;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        setActivePosts([
          ...activePosts,
          {
            id: newPost.id,
            title: newPost.title,
            date: newPost.createdAt ? new Date(newPost.createdAt).toLocaleDateString("vi-VN") : "N/A",
            views: newPost.view || 0,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          },
        ]);
      } else {
        throw new Error(response.data.message || "Không thể đăng lại tin.");
      }
    } catch (err) {
      console.error("Lỗi khi đăng lại tin:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Không thể đăng lại tin. Vui lòng thử lại sau.";
      if (errorMessage.includes("Insufficient balance")) {
        setError("Tài khoản của bạn không đủ tiền để đăng lại tin. Vui lòng nạp thêm tiền.");
      } else {
        setError(errorMessage);
      }
    }
  };

  // Xử lý xem chi tiết tin
  const handleViewPostDetail = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Nếu không có user, không render gì cả (đã xử lý điều hướng trong useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="layout">
      <style>{pageStyles}</style>
      <div className="content-wrapper">
        <Sidebar user={user} handleShowLogoutConfirm={handleShowLogoutConfirm} />
        <div className="main-content">
          <Container className="py-5 custom-container">
            <Card className="border-0 shadow-sm history-card">
              <Card.Header className="history-header d-flex align-items-center">
                <FaClock className="me-2" />
                <h4 className="mb-0">Lịch sử tin đăng</h4>
              </Card.Header>
              <Card.Body className="p-4">
                {error && <div className="alert alert-danger alert-custom">{error}</div>}
                {loading ? (
                  <div className="text-center py-5 loading-container">
                    <div className="spinner-border text-primary spinner-custom" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải danh sách tin...</p>
                  </div>
                ) : (
                  <Tabs
                    defaultActiveKey="active"
                    id="post-history-tabs"
                    className="mb-4 custom-tabs"
                    variant="tabs"
                  >
                    <Tab
                      eventKey="pending"
                      title={
                        <span className="tab-title">
                          Tin đang chờ duyệt{" "}
                          <Badge bg="warning" pill className="custom-badge">
                            {pendingPosts.length}
                          </Badge>
                        </span>
                      }
                    >
                      <ListGroup variant="flush" className="post-list">
                        {pendingPosts.length > 0 ? (
                          pendingPosts.map((post) => (
                            <ListGroup.Item
                              key={post.id}
                              className="post-item d-flex justify-content-between align-items-center py-3"
                            >
                              <div>
                                <strong className="post-title">{post.title}</strong>
                                <p className="mb-0 post-meta">
                                  <small>
                                    Đăng ngày: {post.date} | Lượt xem: {post.views}
                                  </small>
                                </p>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="action-btn view-btn px-3"
                                onClick={() => handleViewPostDetail(post.id)}
                              >
                                Xem chi tiết
                              </Button>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-center py-3 text-muted empty-message">
                            <small>Chưa có tin đang chờ duyệt</small>
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Tab>

                    <Tab
                      eventKey="active"
                      title={
                        <span className="tab-title">
                          Tin đang đăng{" "}
                          <Badge bg="success" pill className="custom-badge">
                            {activePosts.length}
                          </Badge>
                        </span>
                      }
                    >
                      <ListGroup variant="flush" className="post-list">
                        {activePosts.length > 0 ? (
                          activePosts.map((post) => (
                            <ListGroup.Item
                              key={post.id}
                              className="post-item d-flex justify-content-between align-items-center py-3"
                            >
                              <div>
                                <strong className="post-title">{post.title}</strong>
                                <p className="mb-0 post-meta">
                                  <small>
                                    Đăng ngày: {post.date} | Lượt xem: {post.views} |{" "}
                                    <span className="remaining-days">
                                      Còn lại: {post.daysRemaining} ngày
                                    </span>
                                  </small>
                                </p>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="action-btn view-btn px-3"
                                onClick={() => handleViewPostDetail(post.id 
                                )}
                              >
                                Xem chi tiết
                              </Button>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-center py-3 text-muted empty-message">
                            <small>Chưa có tin đang đăng</small>
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Tab>

                    <Tab
                      eventKey="expired"
                      title={
                        <span className="tab-title">
                          Tin hết hạn{" "}
                          <Badge bg="danger" pill className="custom-badge">
                            {expiredPosts.length}
                          </Badge>
                        </span>
                      }
                    >
                      <ListGroup variant="flush" className="post-list">
                        {expiredPosts.length > 0 ? (
                          expiredPosts.map((post) => (
                            <ListGroup.Item
                              key={post.id}
                              className="post-item d-flex justify-content-between align-items-center py-3"
                            >
                              <div>
                                <strong className="post-title">{post.title}</strong>
                                <p className="mb-0 post-meta">
                                  <small>
                                    Hết hạn: {post.date} | Lượt xem: {post.views}
                                  </small>
                                </p>
                              </div>
                              <div className="button-group">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="action-btn renew-btn px-3"
                                  onClick={() => handleRenewPost(post.id)}
                                >
                                  Gia hạn
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="action-btn repost-btn px-3"
                                  onClick={() => handleRepost(post.id)}
                                >
                                  Đăng lại
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-center py-3 text-muted empty-message">
                            <small>Chưa có tin hết hạn</small>
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Tab>
                  </Tabs>
                )}
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HistoryNew;