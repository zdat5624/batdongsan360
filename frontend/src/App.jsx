/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Thêm ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Thêm CSS cho react-toastify
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SellPage from "./pages/SellPage";
import RentPage from "./pages/RentPage";
import PostAd from "./pages/PostAd";
import ProjectDetail from "./pages/ProjectDetail";
import Footer from "./components/Footer";
import UserProfile from "./pages/UserProfile";
import PaymentPage from "./pages/PaymentPage";
import AdminUsers from "./pages/AdminUsers";
import HistoryNew from "./pages/HistoryNew";
import AdminPayments from "./pages/AdminPayments";
import AdminVips from "./components/AdminVips";
import AdminPostsPage from "./pages/AdminPostsPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Thêm ProtectedRoute
import apiServices from "./services/apiServices";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
const App = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Xác minh token khi ứng dụng khởi động
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await apiServices.get("/api/auth/account");
          console.log("User info từ backend:", response.data);
          if (response.data.statusCode === 200) {
            setUser({
              id: response.data.data.id,
              name: response.data.data.name,
              email: response.data.data.email,
              avatar: "https://i.pravatar.cc/150?u=" + response.data.data.email,
              role: response.data.data.role,
              accessToken: token,
            });
          } else {
            console.error("API /api/auth/account trả về lỗi:", response.data);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification failed:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config?.url,
          });
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          setUser(null);
        }
      }
    };
    verifyToken();
  }, []);

  // Xử lý đăng nhập
  const handleLogin = (userData) => {
    console.log("User data nhận được từ LoginForm:", userData);
    setUser(userData);
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header user={user} setUser={setUser} handleLogin={handleLogin} handleLogout={handleLogout} />
        <main style={{ flex: "1 0 auto" }}>
          <Routes>
            {/* Các route công khai */}
            <Route path="/" element={<HomePage setLoading={setLoading} />} />
            <Route path="/sell" element={<SellPage setLoading={setLoading} />} />
            <Route path="/rent" element={<RentPage setLoading={setLoading} />} />
            <Route path="/post/:id" element={<ProjectDetail />} />
            <Route path="/post-ad" element={<PostAd />} />

            {/* Các route yêu cầu đăng nhập */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-history"
              element={
                <ProtectedRoute>
                  <HistoryNew user={user} />
                </ProtectedRoute>
              }
            />

            {/* Các route admin (yêu cầu đăng nhập và role ADMIN) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  {user?.role === "ADMIN" ? (
                    <AdminUsers />
                  ) : (
                    <div className="container mt-5 text-center">
                      <h3 className="text-danger">Bạn không có quyền truy cập trang này.</h3>
                    </div>
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute>
                  {user?.role === "ADMIN" ? (
                    <AdminPayments />
                  ) : (
                    <div className="container mt-5 text-center">
                      <h3 className="text-danger">Bạn không có quyền truy cập trang này.</h3>
                    </div>
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vips"
              element={
                <ProtectedRoute>
                  {user?.role === "ADMIN" ? (
                    <AdminVips />
                  ) : (
                    <div className="container mt-5 text-center">
                      <h3 className="text-danger">Bạn không có quyền truy cập trang này.</h3>
                    </div>
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <ProtectedRoute>
                  {user?.role === "ADMIN" ? (
                    <AdminPostsPage />
                  ) : (
                    <div className="container mt-5 text-center">
                      <h3 className="text-danger">Bạn không có quyền truy cập trang này.</h3>
                    </div>
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {!loading && <Footer />}
        {/* Thêm ToastContainer để hiển thị thông báo */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </Router>
  );
};

export default App;