import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Alert } from "react-bootstrap";
import Footer from "../components/Footer"; // Giả sử bạn đã có Footer component
import Sidebar from "../components/Sidebar"; // Giả sử bạn đã có Sidebar component

const customStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  .content-wrapper {
    display: flex;
    flex: 1;
  }
  .main-content {
    flex: 1;
    padding-top: 70px;
    padding-bottom: 150px;
    background: linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%);
  }
  .result-card {
    max-width: 600px;
    margin: 0 auto;
    border: none;
    border-radius: 15px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    text-align: center;
  }
  .success-icon {
    font-size: 4rem;
    color: #28a745;
  }
  .btn-custom {
    border-radius: 25px;
    padding: 10px 30px;
    font-weight: bold;
    font-size: 1.1rem;
  }
  .transaction-info {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    margin-top: 20px;
  }
`;

const PaymentResult = ({ user, handleLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy query parameters từ URL
  const query = new URLSearchParams(location.search);
  const status = query.get("status");
  const orderInfo = decodeURIComponent(query.get("orderInfo") || ""); // Giải mã orderInfo
  const paymentTime = query.get("paymentTime");
  const transactionId = query.get("transactionId");
  const totalPrice = query.get("totalPrice");

  // Định dạng thời gian thanh toán
  const formatPaymentTime = (time) => {
    if (!time) return "N/A";
    const year = time.substring(0, 4);
    const month = time.substring(4, 6);
    const day = time.substring(6, 8);
    const hour = time.substring(8, 10);
    const minute = time.substring(10, 12);
    const second = time.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Định dạng số tiền
  const formatPrice = (price) => {
    if (!price) return "0 VNĐ";
    return parseInt(price).toLocaleString("vi-VN") + " VNĐ";
  };

  // Kiểm tra trạng thái thanh toán
  const isSuccess = status === "1";

  // Xử lý nút quay lại
  const handleBack = () => {
    navigate("/payment"); // Quay lại trang thanh toán
  };

  return (
    <div className="layout">
      <style>{customStyles}</style>
      <div className="content-wrapper">
        <Sidebar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <Container>
            <Card className="result-card">
              <Card.Body>
                {isSuccess ? (
                  <>
                    <div className="success-icon mb-4">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2 className="text-success fw-bold mb-4">Thanh Toán Thành Công</h2>
                    <div className="transaction-info">
                      <Row>
                        <Col md={6} className="text-start">
                          <p className="mb-2">
                            <strong>Thời gian thanh toán:</strong>
                          </p>
                          <p className="mb-2">
                            <strong>Mã giao dịch:</strong>
                          </p>
                          <p className="mb-2">
                            <strong>Số tiền:</strong>
                          </p>
                          <p className="mb-2">
                            <strong>Thông tin đơn hàng:</strong>
                          </p>
                        </Col>
                        <Col md={6} className="text-end">
                          <p className="mb-2">{formatPaymentTime(paymentTime)}</p>
                          <p className="mb-2">{transactionId || "N/A"}</p>
                          <p className="mb-2">{formatPrice(totalPrice)}</p>
                          <p className="mb-2">{orderInfo || "N/A"}</p>
                        </Col>
                      </Row>
                    </div>
                  </>
                ) : (
                  <Alert variant="danger" className="rounded-pill text-center">
                    Thanh toán thất bại. Vui lòng thử lại.
                  </Alert>
                )}
                <div className="mt-5">
                  <Button variant="primary" className="btn-custom" onClick={handleBack}>
                    Quay Lại Trang Thanh Toán
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentResult;