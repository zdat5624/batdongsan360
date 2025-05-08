/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

const AdminSidebar = ({ user, isOpen, toggleSidebar }) => {
  const handleLinkClick = () => {
    toggleSidebar(); // Đóng Sidebar khi nhấp vào liên kết
  };

  const sidebarStyles = `
    .sidebar {
      width: 250px !important;
      background-color: #f8f9fa !important;
      padding-top: 90px !important;
      border-right: 1px solid #dee2e6 !important;
      min-height: calc(100vh - 70px) !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 100 !important;
      transition: transform 0.3s ease;
    }
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      display: none;
    }
    .sidebar-overlay.show {
      display: block;
    }
    .sidebar .nav-link {
      padding: 15px 20px !important;
      color: #333 !important;
      font-weight: 500 !important;
      display: flex !important;
      align-items: center !important;
      font-size: 1rem;
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
        position: fixed;
        width: 250px !important;
        transform: ${isOpen ? "translateX(0)" : "translateX(-100%)"};
        z-index: 1000;
        max-height: calc(100vh - 70px);
        overflow-y: auto;
      }
      .sidebar.show {
        transform: translateX(0);
      }
      .sidebar .nav-link {
        padding: 12px 15px !important;
        font-size: 0.9rem;
      }
    }
    @media (max-width: 576px) {
      .sidebar {
        width: 200px !important;
      }
      .sidebar .nav-link {
        padding: 10px 12px !important;
        font-size: 0.85rem;
      }
    }
  `;

  return (
    <>
      <style>{sidebarStyles}</style>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={toggleSidebar}></div>
      <Nav className={`sidebar flex-column ${isOpen ? "show" : ""}`}>
        <Nav.Link as={NavLink} to="/admin/users" onClick={handleLinkClick}>
          <i className="fas fa-users me-2"></i> Quản lý người dùng
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/payments" onClick={handleLinkClick}>
          <i className="fas fa-money-bill-wave me-2"></i> Quản lý thanh toán
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/vips" onClick={handleLinkClick}>
          <i className="fas fa-medal me-2"></i> Quản lý gói VIP
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/posts" onClick={handleLinkClick}>
          <i className="fas fa-home me-2"></i> Quản lý tin đăng
        </Nav.Link>
      </Nav>
    </>
  );
};

export default AdminSidebar;