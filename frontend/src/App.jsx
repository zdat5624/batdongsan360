/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from "react-bootstrap";
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
import ProtectedRoute from "./components/ProtectedRoute";
import apiServices from "./services/apiServices";
import NotificationsPage from "./pages/NotificationsPage";
import PaymentResult from "./components/PaymentResult";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        try {
          const response = await apiServices.get(`/api/users/${userId}`);

          if (response.data.statusCode === 200) {
            setUser({
              id: response.data.data.id,
              name: response.data.data.name,
              email: response.data.data.email,
              avatar: response.data.data.avatar || "https://i.pravatar.cc/150?u=" + response.data.data.email,
              role: response.data.data.role,
              accessToken: token,
            });
          } else {
            console.error("API /api/users/:id trả về lỗi:", response.data);
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
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    verifyToken();
  }, []);

  const handleLogin = (userData) => {
    console.log("User data nhận được từ LoginForm:", userData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setUser(null);
    Navigate("/");
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Đang tải...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Bọc Header trong div và ẩn toàn bộ vùng nếu là trang admin */}
      {!isAdminPage && (
        <div className="header-wrapper">
          <Header user={user} setUser={setUser} handleLogin={handleLogin} handleLogout={handleLogout} />
        </div>
      )}
      <main style={{ flex: "1 0 auto", paddingTop: "20px" }}>
        <Routes>
          <Route path="/" element={<HomePage setLoading={setLoading} />} />
          <Route path="/sell" element={<SellPage setLoading={setLoading} />} />
          <Route path="/rent" element={<RentPage setLoading={setLoading} />} />
          <Route path="/post/:id" element={<ProjectDetail />} />
          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/notifications" element={<NotificationsPage user={user} handleLogout={handleLogout} />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <UserProfile user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute user={user}>
                <PaymentPage user={user} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="/payment/payment-result" element={<PaymentResult user={user} handleLogout={handleLogout} />} />
          <Route
            path="/post-history"
            element={
              <ProtectedRoute user={user}>
                <HistoryNew user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute user={user}>
                <AdminUsers user={user} setUser={setUser} handleLogin={handleLogin} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute user={user}>
                <AdminPayments user={user} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vips"
            element={
              <ProtectedRoute user={user}>
                <AdminVips user={user} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <ProtectedRoute user={user}>
                <AdminPostsPage user={user} handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!loading && !isAdminPage && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}