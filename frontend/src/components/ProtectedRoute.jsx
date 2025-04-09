/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const ProtectedRoute = ({ user, requireAdmin = false, children }) => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  // Nếu không có accessToken hoặc userId, chuyển hướng về trang chủ
  if (!accessToken || !userId) {
    return <Navigate to="/" replace />;
  }

  // Nếu user chưa được khôi phục (đang loading), hiển thị spinner
  if (user === undefined) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Đang tải...</span>
      </div>
    );
  }

  // Nếu user là null (không đăng nhập), chuyển hướng về trang chủ
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Nếu route yêu cầu quyền admin và user không phải ADMIN, chuyển hướng về trang chủ
  if (requireAdmin && user.role?.toUpperCase() !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;