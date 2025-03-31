/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Dropdown,
  Image,
  Badge,
} from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import logo from "../assets/img/logo.png";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import apiServices from "../services/apiServices";
import "../assets/styles/Header.css";

const Header = ({ user, setUser }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const navigate = useNavigate();

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
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  };

  // Hàm lấy danh sách thông báo
  const fetchNotifications = async () => {
    if (!user) return;

    setNotificationLoading(true);
    setNotificationError(null);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Bạn cần đăng nhập để xem thông báo.");
      }

      const response = await apiServices.get(`/api/notifications?userId=${userId}&page=0&size=5&sort=createdAt,desc`);
      if (response.data.statusCode === 200) {
        const notificationData = response.data.data;
        setNotifications(notificationData.content || []);
        const unread = (notificationData.content || []).filter((notif) => !notif.read).length;
        setUnreadCount(unread);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách thông báo.");
      }
    } catch (err) {
      setNotificationError(err.message || "Không thể lấy danh sách thông báo.");
    } finally {
      setNotificationLoading(false);
    }
  };

  // Gọi API lấy thông báo khi người dùng đăng nhập
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const handlePostAd = () => {
    if (user) {
      navigate("/post-ad");
    } else {
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/");
    setShowLogoutConfirm(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleShowLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleCloseLogoutConfirm = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <Navbar expand="lg" sticky="top" className="header py-2">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            <Image src={logo} alt="PropTech Logo" height="45" className="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/sell" className="nav-link-custom">
                Nhà đất bán
              </Nav.Link>
              <Nav.Link as={NavLink} to="/rent" className="nav-link-custom">
                Nhà đất cho thuê
              </Nav.Link>
            </Nav>

            {user ? (
              <div className="d-flex align-items-center gap-3">
                {/* Dropdown người dùng */}
                <Dropdown>
                  <Dropdown.Toggle
                    variant="dark"
                    id="dropdown-user"
                    className="dropdown-toggle-custom d-flex align-items-center text-white text-decoration-none"
                  >
                    <Image
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt="Avatar"
                      roundedCircle
                      className="border border-light me-2"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <span className="fw-bold">{user.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" className="dropdown-menu-custom user-dropdown">
                    <Dropdown.Item as={NavLink} to="/profile">
                      <i className="fas fa-user me-2"></i> Thông tin cá nhân
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/payment">
                      <i className="fas fa-credit-card me-2"></i> Thanh toán
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/post-history">
                      <i className="fas fa-history me-2"></i> Lịch sử tin đăng
                    </Dropdown.Item>
                    {user.role === "ADMIN" && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Header>
                          <i className="fas fa-tools me-2"></i> Quản trị
                        </Dropdown.Header>
                        <Dropdown.Item as={NavLink} to="/admin/users">
                          <i className="fas fa-users me-2"></i> Quản lý người dùng
                        </Dropdown.Item>
                        <Dropdown.Item as={NavLink} to="/admin/payments">
                          <i className="fas fa-money-bill-wave me-2"></i> Quản lý thanh toán
                        </Dropdown.Item>
                        <Dropdown.Item as={NavLink} to="/admin/vips">
                          <i className="fas fa-medal me-2"></i> Quản lý gói VIP
                        </Dropdown.Item>
                        <Dropdown.Item as={NavLink} to="/admin/posts">
                          <i className="fas fa-home me-2"></i> Quản lý tin đăng
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleShowLogoutConfirm} className="text-danger">
                      <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Nút Đăng tin */}
                <Button
                  variant="warning"
                  className="btn-custom btn-post-ad"
                  onClick={handlePostAd}
                >
                  Đăng tin
                </Button>

                {/* Biểu tượng chuông và dropdown thông báo */}
                <Dropdown>
                  <Dropdown.Toggle
                    variant="dark"
                    id="dropdown-notifications"
                    className="dropdown-toggle-custom d-flex align-items-center text-white text-decoration-none position-relative"
                  >
                    <FaBell size={24} />
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle rounded-circle"
                        style={{ fontSize: "0.6rem", padding: "0.3em 0.5em" }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" className="dropdown-menu-custom notification-dropdown">
                    <Dropdown.Header className="notification-header">
                      <i className="fas fa-bell me-2"></i> Thông Báo
                    </Dropdown.Header>
                    {notificationLoading ? (
                      <Dropdown.ItemText className="text-center">
                        <i className="fas fa-spinner fa-spin me-2"></i> Đang tải...
                      </Dropdown.ItemText>
                    ) : notificationError ? (
                      <Dropdown.ItemText className="text-danger">
                        {notificationError}
                      </Dropdown.ItemText>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Dropdown.Item
                          key={notification.id}
                          className={`notification-item ${notification.read ? "" : "notification-unread"}`}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <i className={`fas fa-bell notification-icon ${notification.read ? "text-muted" : "text-primary"}`}></i>
                            <div className="d-flex flex-column">
                              <span>{notification.message || "Không có nội dung"}</span>
                              <small className="text-muted">{getTimeAgo(notification.createdAt)}</small>
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.ItemText className="text-center text-muted">
                        Chưa có thông báo nào.
                      </Dropdown.ItemText>
                    )}
                    {notifications.length > 0 && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={NavLink} to="/notifications" className="text-center notification-view-all">
                          Xem tất cả thông báo
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-light"
                  className="btn-custom btn-login"
                  onClick={() => setShowLogin(true)}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  className="btn-custom btn-register"
                  onClick={() => setShowRegister(true)}
                >
                  Đăng ký
                </Button>
                <Button
                  variant="warning"
                  className="btn-custom btn-post-ad"
                  onClick={handlePostAd}
                >
                  Đăng tin
                </Button>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Form xác nhận đăng xuất */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-container">
            <div className="logout-confirm-header">
              <h3>Xác nhận đăng xuất</h3>
              <button className="btn-close-custom" onClick={handleCloseLogoutConfirm}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="logout-confirm-body">
              <p>Bạn có chắc chắn muốn đăng xuất không?</p>
              <div className="logout-confirm-buttons">
                <button className="btn-cancel" onClick={handleCloseLogoutConfirm}>
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <LoginForm
          onLogin={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showRegister && (
        <RegisterForm
          onClose={() => setShowRegister(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
};

export default Header;