/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "../assets/styles/LoginForm.css";
import logo from "../assets/img/logo.png";
import apiServices from "../services/apiServices";

const LoginForm = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await apiServices.post("/api/auth/login", {
        username,
        password,
      });
      console.log("Response từ backend:", response.data);
      if (response.data.statusCode === 200) {
        const accessToken = response.data.data.accessToken;
        const userId = response.data.data.user.id;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", userId);

        const userData = {
          id: userId,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          avatar: "https://i.pravatar.cc/150?u=" + response.data.data.user.email,
          role: response.data.data.user.role,
          accessToken: accessToken,
        };

        onLogin(userData);
        onClose();
      } else {
        // Hiển thị thông báo lỗi từ server
        setError(response.data.message || "Thông tin đăng nhập không chính xác!");
      }
    } catch (err) {
      console.error("Lỗi chi tiết:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config?.url,
      });
      // Hiển thị thông báo lỗi từ server nếu có
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-logo">
          <img src={logo} alt="Company Logo" className="logo-img" />
        </div>
        <div className="login-form">
          <button className="btn-close-custom" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <h2>Đăng nhập</h2>
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="login-button">
              Đăng nhập
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginForm;