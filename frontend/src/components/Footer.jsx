// eslint-disable-next-line no-unused-vars
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
import "../assets/styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer text-white">
      <div className="container py-3">
        <div className="row row-cols-1 row-cols-md-2 text-center text-md-start">
          {/* Cột 1: Thông tin liên hệ */}
          <div className="col mb-3 mb-md-0">
            <h6 className="text-uppercase fw-bold mb-2">Liên hệ</h6>
            <p className="mb-1">
              <i className="fas fa-envelope me-2"></i> Email: contact@example.com
            </p>
            <p className="mb-1">
              <i className="fas fa-phone me-2"></i> Điện thoại: 0123 456 789
            </p>
            <p className="mb-0">
              <i className="fas fa-map-marker-alt me-2"></i> Địa chỉ: 123 Đường ABC, TP.HCM
            </p>
          </div>

          {/* Cột 2: Thông tin trang */}
          <div className="col mb-3 mb-md-0">
            <h6 className="text-uppercase fw-bold mb-2">Thông tin</h6>
            <ul className="list-unstyled">
              <li className="mb-1">
                <a href="#" className="footer-link">
                  <i className="fas fa-info-circle me-2"></i> Về chúng tôi
                </a>
              </li>
              <li className="mb-1">
                <a href="#" className="footer-link">
                  <i className="fas fa-lock me-2"></i> Chính sách bảo mật
                </a>
              </li>
              <li className="mb-0">
                <a href="#" className="footer-link">
                  <i className="fas fa-file-alt me-2"></i> Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chân trang */}
      <div className="footer-bottom text-center py-2">
        <p className="mb-0">© 2025 Bản quyền thuộc về Công ty ABC</p>
      </div>
    </footer>
  );
};

export default Footer;