/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink } from "react-router-dom";
import { Navbar, Dropdown, Image, Nav } from "react-bootstrap";
import logo from "../assets/img/logo.png";
import "../assets/styles/Header.css";

const AdminHeader = ({ user, handleLogout }) => {
  return (
    <>
      <style>
        {`
          .navbar-custom {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .navbar-content {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
          }
        `}
      </style>

      <Navbar
        expand="lg"
        className="header navbar-custom py-2"
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      >
        <div className="navbar-content">
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