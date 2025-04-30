/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Navbar, Container, Dropdown, Image, Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import "../assets/styles/Header.css";

const AdminHeader = ({ user, handleLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleShowLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutHeader = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  }
  const handleCloseLogoutConfirm = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <Navbar expand="lg" className="header py-2" style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}>
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            <Image src={logo} alt="PropTech Logo" height="45" className="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto"></Nav>
            {user && (
              <div className="d-flex align-items-center gap-3">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="dark"
                    id="dropdown-user"
                    className="dropdown-toggle-custom d-flex align-items-center text-white text-decoration-none"
                  >
                    <Image
                      src={`http://localhost:8080/uploads/${user.avatar}`}
                      alt="Avatar"
                      roundedCircle
                      className=" me-2"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <span className="fw-bold">{user.name}</span>
                  </Dropdown.Toggle>


                  <Dropdown.Menu align="end" className="dropdown-menu-custom user-dropdown">
                    <Dropdown.Item as={NavLink} to="/" className="text-danger">
                      <i className="fas fa-home me-2"></i> Về trang chủ
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleShowLogoutConfirm} className="text-danger">
                      <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </Dropdown.Item>

                  </Dropdown.Menu>



                </Dropdown>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

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
                <button className="btn-confirm" onClick={handleLogoutHeader}>
                  Đăng xuất
                </button>
                <button className="btn-cancel" onClick={handleCloseLogoutConfirm}>
                  Hủy
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;