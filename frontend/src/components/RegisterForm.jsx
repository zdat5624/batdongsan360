/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "../assets/styles/Register.css";
import logo from "../assets/img/logo.png";
import apiServices from "../services/apiServices";

const RegisterForm = ({ onClose, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    gender: "MALE",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.gender) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await apiServices.post("/api/auth/register", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        role: "USER",
      });

      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        setFormData({ name: "", phone: "", email: "", password: "", gender: "MALE" });
        setTimeout(() => {
          onClose();
          if (onRegisterSuccess) onRegisterSuccess();
        }, 2000);
      } else {
        setError(response.data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Có lỗi xảy ra khi đăng ký!");
    }
  };

  return (
    <div className="register-overlay">
      <div className="register-container">
        <div className="register-logo">
          <img src={logo} alt="Company Logo" className="logo-img" />
        </div>
        <div className="register-form">
          <button className="btn-close-custom" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <h2>Đăng ký</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>
            <button type="submit" className="register-button">
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;