/* eslint-disable react/prop-types */
import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

const Sidebar = ({ user, handleLogout }) => {
  const sidebarStyles = `
    .sidebar {
      width: 250px !important;
      background-color: #f8f9fa !important;
      padding-top: 90px !important;
      border-right: 1px solid #dee2e6 !important;
      min-height: calc(100vh - 70px) !important;
      display: block !important; /* Đảm bảo hiển thị */
      position: sticky !important; /* Giữ sidebar cố định */
      top: 0 !important;
      z-index: 100 !important; /* Đảm bảo không bị che */
    }
    .sidebar .nav-link {
      padding: 15px 20px !important;
      color: #333 !important;
      font-weight: 500 !important;
      display: flex !important;
      align-items: center !important;
    }
    .sidebar .nav-link:hover {
      background-color: #e9ecef !important;
    }
    .sidebar .nav-link.active {
      background-color: #007bff !important;
      color: white !important;
    }
    .sidebar .divider {
      height: 1px !important;
      background-color: #dee2e6 !important;
      margin: 10px 0 !important;
    }
    .sidebar .header {
      padding: 10px 20px !important;
      font-weight: bold !important;
      color: #007bff !important;
      background-color: #dee2e6 !important;
    }
  `;

  return (
    <>
      <style>{sidebarStyles}</style>
      <Nav className="sidebar flex-column">
        <Nav.Link as={NavLink} to="/profile">
          <i className="fas fa-user me-2"></i> Thông tin cá nhân
        </Nav.Link>
        <Nav.Link as={NavLink} to="/payment">
          <i className="fas fa-credit-card me-2"></i> Thanh toán
        </Nav.Link>
        <Nav.Link as={NavLink} to="/post-history">
          <i className="fas fa-history me-2"></i> Lịch sử tin đăng
        </Nav.Link>
        {user?.role?.toUpperCase() === "ADMIN" && (
          <>
            <div className="divider"></div>
            <div className="header">
              <i className="fas fa-tools me-2"></i> Quản trị
            </div>
            <Nav.Link as={NavLink} to="/admin/users">
              <i className="fas fa-users me-2"></i> Quản lý người dùng
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/payments">
              <i className="fas fa-money-bill-wave me-2"></i> Quản lý thanh toán
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/vips">
              <i className="fas fa-medal me-2"></i> Quản lý gói VIP
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/posts">
              <i className="fas fa-home me-2"></i> Quản lý tin đăng
            </Nav.Link>
          </>
        )}
        <div className="divider"></div>
        <Nav.Link onClick={handleLogout} className="text-danger">
          <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
        </Nav.Link>
      </Nav>
    </>
  );
};

export default Sidebar;