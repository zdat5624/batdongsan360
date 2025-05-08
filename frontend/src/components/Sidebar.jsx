/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

const Sidebar = ({ user, handleLogout, isSidebarOpen, toggleSidebar }) => {
  const sidebarStyles = `
    .sidebar {
      width: 250px !important;
      background-color: #f8f9fa !important;
      padding-top: 90px !important;
      border-right: 1px solid #dee2e6 !important;
      max-height: calc(100vh - 40px) !important;
      overflow-y: auto !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 100 !important;
      transition: transform 0.3s ease-in-out !important;
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
    @media (max-width: 768px) {
      .sidebar {
        position: fixed !important;
        top: 60px !important; /* Dưới header */
        left: 0 !important;
        width: 250px !important;
        height: calc(100vh - 60px) !important;
        transform: translateX(-100%) !important; /* Ẩn sidebar mặc định */
        z-index: 1000 !important;
      }
      .sidebar.open {
        transform: translateX(0) !important; /* Hiển thị khi toggle */
      }
    }
  `;

  return (
    <>
      <style>{sidebarStyles}</style>
      <Nav className={`sidebar flex-column ${isSidebarOpen ? "open" : ""}`}>
        <Nav.Link as={NavLink} to="/profile">
          <i className="fas fa-user me-2"></i> Thông tin cá nhân
        </Nav.Link>
        <Nav.Link as={NavLink} to="/payment">
          <i className="fas fa-credit-card me-2"></i> Thanh toán
        </Nav.Link>
        <Nav.Link as={NavLink} to="/post-history">
          <i className="fas fa-history me-2"></i> Lịch sử đăng tin
        </Nav.Link>
        <Nav.Link as={NavLink} to="/notifications">
          <i className="fas fa-bell me-2"></i> Xem thông báo
        </Nav.Link>
      </Nav>
    </>
  );
};

export default Sidebar;