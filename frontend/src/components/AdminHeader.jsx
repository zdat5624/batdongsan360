/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import { Navbar, Dropdown, Image, Nav, Button } from "react-bootstrap";
import logo from "../assets/img/logo.png";
import "../assets/styles/Header.css";

const AdminHeader = ({ user, handleLogout, toggleSidebar }) => {
  return (
    <>
      <style>
        {`
          .navbar-custom {
            padding-left: 0 !important;
            padding-right: 0 !important;
            background-color: #1a252f !important;
          }
          .navbar-content {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
          }
          .navbar-brand {
            font-size: 1.5rem;
            transition: font-size 0.3s ease;
          }
          .navbar-toggler {
            border: none;
            padding: 8px;
          }
          .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
          }
          .sidebar-toggle-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.2rem;
            padding: 8px;
            display: none;
          }
          .dropdown-menu-custom {
            min-width: 200px;
            transform: translateX(-80%) !important;
          }
          @media (max-width: 768px) {
            .navbar-brand {
              font-size: 1.2rem;
            }
            .navbar-content {
              padding: 0 10px;
            }
            .navbar-collapse {
              background-color: #1a252f;
              padding: 10px;
              border-radius: 8px;
              margin-top: 5px;
            }
            .sidebar-toggle-btn {
              display: block;
            }
            .dropdown-menu-custom {
              transform: none !important;
              width: 100%;
              left: 0 !important;
              right: 0 !important;
            }
          }
          @media (max-width: 576px) {
            .navbar-brand {
              font-size: 1rem;
            }
            .navbar-content {
              padding: 0 5px;
            }
            .dropdown-toggle-custom img {
              width: 32px !important;
              height: 32px !important;
            }
            .dropdown-menu-custom {
              min-width: 100%;
            }
          }
        `}
      </style>

      <Navbar
        expand="lg"
        className="header navbar-custom py-2"
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      >
        <div className="navbar-content">
          <Button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </Button>
          <Navbar.Brand as={NavLink} to="/">
            <span className="fw-bold text-light">ADMIN</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto"></Nav>

            {user ? (
              <div className="d-flex align-items-center gap-3">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="dark"
                    id="dropdown-user"
                    className="dropdown-toggle-custom d-flex align-items-center text-white text-decoration-none"
                  >
                    <Image
                      src={`${import.meta.env.VITE_IMAGE_URL}/${user.avatar}`}
                      alt="Avatar"
                      roundedCircle
                      className="border border-light me-2"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <span className="fw-bold">{user.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" className="dropdown-menu-custom user-dropdown">
                    <Dropdown.Item as={NavLink} to="/">
                      <i className="fas fa-home me-2"></i> Trang chủ
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2"></div>
            )}
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
};

export default AdminHeader;