import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/user/Home';
import Profile from './pages/user/Profile';
import Login from './pages/user/Login';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/VipManagement';

import Register from './pages/user/Register';
import ChangePassword from './pages/user/ChangePassword';
import ForgotPassword from './pages/user/ForgotPassword';
import { AuthProvider } from './contexts/AuthContext';
import SellPage from './pages/SellPage';
import RentPage from './pages/RentPage';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/user/CreatePost';
import Posts from './pages/user/Posts';
import Notifications from './pages/user/Notifications';
import Payments from './pages/user/Payments';
import PaymentResult from './pages/user/PaymentResult';
import EditPost from './pages/user/EditPost';
import VipManagement from './pages/admin/VipManagement';
import CategoryManagement from './pages/admin/categoryManagement';
import PostManagement from './pages/admin/PostManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import Vips from './pages/user/Vips';


const { Content, Header: AntHeader, Footer: AntFooter } = Layout;

// Layout chính để quản lý header động
const MainLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Layout>
      <AntHeader style={{ padding: 0 }}>
        {isAdminRoute ? <AdminHeader /> : <Header />}
      </AntHeader>
      <Layout>
        <Outlet />
      </Layout>
      <AntFooter style={{ textAlign: 'center' }}>
        <Footer />
      </AntFooter>
    </Layout>
  );
};

// Layout cho các trang user không có Sidebar
const HomeLayout = ({ children }) => (
  <Layout>
    {/* <div style={{ width: 200 }} /> Placeholder cho Sidebar */}
    <Content style={{ minHeight: 'calc(100vh - 64px - 70px)' }}>
      {children}
    </Content>
  </Layout>
);

// Layout cho các trang user có Sidebar
const UserLayout = ({ children }) => (
  <Layout hasSider>
    <Sidebar />
    <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px - 70px)' }}>
      {children}
    </Content>
  </Layout>
);

// Layout cho các trang admin
const AdminLayout = ({ children }) => (
  <Layout hasSider>
    <AdminSidebar />
    <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px - 70px)' }}>
      {children}
    </Content>
  </Layout>
);

function App() {
  return (
    <AuthProvider>

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeLayout><Home /></HomeLayout>} />
          <Route path="/sell" element={<HomeLayout><SellPage /></HomeLayout>} />
          <Route path="/rent" element={<HomeLayout><RentPage /></HomeLayout>} />
          <Route path="/posts/:id" element={<HomeLayout><PostDetail /></HomeLayout>} />

          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <CreatePost />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-post/:id"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <EditPost />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Posts />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Notifications />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Payments />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/payment-result"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <PaymentResult />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Profile />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vips"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <Vips />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <ChangePassword />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vips"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <VipManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <CategoryManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <PaymentManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <PostManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} /> {/* Xử lý tất cả các route không khớp */}
      </Routes>
    </AuthProvider>
  );
}

export default App;