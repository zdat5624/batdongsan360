/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Tabs,
  Tab,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import apiServices from "../services/apiServices";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

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
  .custom-tabs .nav-link {
    font-weight: bold;
    color: #007bff;
    border-radius: 10px 10px 0 0;
    font-size: 1.1rem;
  }
  .custom-tabs .nav-link.active {
    background-color: #007bff;
    color: white;
  }
  .modal-custom {
    max-width: 400px;
  }
  .balance-card {
    margin-top: 30px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
  .balance-card h3 {
    font-size: 1.5rem;
  }
  .balance-card .badge {
    font-size: 1.2rem;
    padding: 8px 16px;
  }
  .balance-card .btn {
    font-size: 0.9rem;
    padding: 6px 20px;
  }
  .sidebar {
    display: block !important;
  }
  .failed-transaction {
    color: red !important;
  }
`;

const PaymentPage = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositHistory, setDepositHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDepositPage, setCurrentDepositPage] = useState(0);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(0);
  const [totalDepositPages, setTotalDepositPages] = useState(0);
  const [totalPaymentPages, setTotalPaymentPages] = useState(0);
  const pageSize = 10;

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (!user || !user.id) {
      navigate("/");
    }
  }, [user, navigate]);

  // Xác định xem có phải tài khoản khách hay không
  const isGuest = user?.role === "GUEST"; // Điều chỉnh điều kiện dựa trên logic của bạn

  // Lấy số dư
  const fetchBalance = async () => {
    if (!user || !user.id) return;
    try {
      const response = await apiServices.get(`/api/users/${user.id}`);
      if (response.data.statusCode === 200) {
        setBalance(response.data.data.balance);
      } else {
        throw new Error("Không thể lấy số dư: " + (response.data.message || "Lỗi không xác định"));
      }
    } catch (err) {
      setError(err.message || "Không thể tải số dư. Vui lòng thử lại.");
    }
  };

  // Lấy lịch sử giao dịch
  const fetchTransactions = async (page = 0, type = "all") => {
    setLoading(true);
    try {
      // Nếu là tài khoản khách, lấy tất cả giao dịch mà không phân trang
      const url = isGuest
        ? `/api/payment/my-transactions?page=0&size=1000&sort=createdAt,desc`
        : `/api/payment/my-transactions?page=${page}&size=${pageSize}&sort=createdAt,desc`;

      const response = await apiServices.get(url);
      if (response.data.statusCode === 200) {
        const transactions = response.data.data.content || [];
        const deposits = transactions
          .filter((txn) => txn.amount > 0)
          .map((txn) => {
            const createdAt = new Date(txn.createdAt);
            const now = new Date();
            const timeDiff = (now - createdAt) / (1000 * 60);
            let status;

            if (txn.status === "SUCCESS") {
              status = "Thành công";
            } else if (txn.status === "FAILED" || timeDiff > 15) {
              status = "Thất bại";
            } else {
              status = "Đang kiểm";
            }

            return {
              id: txn.id,
              status,
              depositDate: createdAt.toLocaleString("vi-VN"),
              depositAmount: `+${txn.amount.toLocaleString("vi-VN")}`,
              netAmount: txn.amount.toLocaleString("vi-VN"),
              transactionId: txn.txnId || `PT${txn.id}`,
            };
          });

        const payments = transactions
          .filter((txn) => txn.amount < 0)
          .map((txn) => {
            const postIdMatch = txn.description.match(/Thanh toán phí đăng tin (\d+)/);
            return {
              id: txn.id,
              time: new Date(txn.createdAt).toLocaleString("vi-VN"),
              fee: Math.abs(txn.amount).toLocaleString("vi-VN"),
              activityType: "Đăng tin",
              postId: postIdMatch ? postIdMatch[1] : "N/A",
            };
          });

        if (type === "deposit" || type === "all") {
          setDepositHistory(deposits);
          if (!isGuest) {
            setTotalDepositPages(Math.ceil(response.data.data.totalElements / pageSize));
          }
        }

        if (type === "payment" || type === "all") {
          setPaymentHistory(payments);
          if (!isGuest) {
            setTotalPaymentPages(Math.ceil(response.data.data.totalElements / pageSize));
          }
        }
      } else {
        throw new Error("Không thể lấy lịch sử giao dịch: " + (response.data.message || "Lỗi không xác định"));
      }
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý kết quả thanh toán và tải dữ liệu ban đầu
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const vnpResponseCode = query.get("vnp_ResponseCode");
    const vnpTransactionStatus = query.get("vnp_TransactionStatus");

    if (status || vnpResponseCode || vnpTransactionStatus) {
      if (status === "1" || vnpResponseCode === "00" || vnpTransactionStatus === "00") {
        setSuccessMessage("Thanh toán thành công! Số dư đã được cập nhật.");
        localStorage.setItem("paymentMessage", "Thanh toán thành công! Số dư đã được cập nhật.");
      } else {
        setError("Thanh toán thất bại. Vui lòng thử lại.");
        localStorage.setItem("paymentMessage", "Thanh toán thất bại. Vui lòng thử lại.");
      }
      window.history.replaceState({}, document.title, "/payment");
    }

    const storedMessage = localStorage.getItem("paymentMessage");
    if (storedMessage) {
      if (storedMessage.includes("Thành công")) {
        setSuccessMessage(storedMessage);
      } else {
        setError(storedMessage);
      }
      localStorage.removeItem("paymentMessage");
    }

    if (user && user.id) {
      setLoading(true);
      Promise.all([fetchBalance(), fetchTransactions(0)])
        .catch((err) => {
          setError("Lỗi khi tải dữ liệu: " + err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location.search, user]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, "");
    setDepositAmount(rawValue);
  };

  const handleDeposit = async () => {
    try {
      const amount = parseInt(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Số tiền không hợp lệ.");
      }
      const payload = { amount };
      const response = await apiServices.post("/api/payment/create", payload);
      if (response.data.statusCode === 201 && response.data.data.paymentLink) {
        window.location.href = response.data.data.paymentLink;
      } else {
        throw new Error("Không thể tạo link thanh toán: " + (response.data.message || "Lỗi không xác định"));
      }
    } catch (err) {
      setError(err.message || "Không thể tạo link thanh toán. Vui lòng thử lại.");
      setShowModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang kiểm":
        return "warning";
      case "Thành công":
        return "success";
      case "Thất bại":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Hàm tạo phân trang (chỉ dùng cho tài khoản không phải khách)
  const renderPagination = (currentPage, totalPages, setPage) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <nav>
          <ul className="pagination custom-pagination">
            <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(0)}>
                «
              </button>
            </li>
            <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(currentPage - 1)}>
                ‹
              </button>
            </li>
            {startPage > 0 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {pageNumbers.map((page) => (
              <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(page)}>
                  {page + 1}
                </button>
              </li>
            ))}
            {endPage < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {totalPages > 0 && (
              <li className="page-item">
                <button className="page-link" onClick={() => setPage(totalPages - 1)}>
                  {totalPages}
                </button>
              </li>
            )}
            <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(currentPage + 1)}>
                ›
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(totalPages - 1)}>
                »
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // Xử lý thay đổi trang (chỉ áp dụng cho tài khoản không phải khách)
  const handleDepositPageChange = (page) => {
    setCurrentDepositPage(page);
    fetchTransactions(page, "deposit");
  };

  const handlePaymentPageChange = (page) => {
    setCurrentPaymentPage(page);
    fetchTransactions(page, "payment");
  };

  if (!user) return null;

  return (
    <div className="layout">
      <style>{customStyles}</style>
      <div className="content-wrapper">
        <Sidebar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Row className="justify-content-center mb-5">
                <Col md={8} lg={6}>
                  <Card className="shadow-lg border-0 balance-card" style={{ borderRadius: "15px", overflow: "hidden" }}>
                    <Card.Body
                      className="p-4 d-flex flex-column align-items-center"
                      style={{ background: "linear-gradient(45deg, #007bff, #00b4d8)" }}
                    >
                      <h3 className="text-white fw-bold mb-3">Số dư tài khoản</h3>
                      <Badge
                        bg="light"
                        className="py-2 px-4 text-dark shadow-sm mb-4"
                        style={{ borderRadius: "10px" }}
                      >
                        {balance.toLocaleString("vi-VN")} VNĐ
                      </Badge>
                      <Button
                        variant="light"
                        className="fw-bold shadow-sm"
                        style={{ borderRadius: "25px", width: "fit-content" }}
                        onClick={() => setShowModal(true)}
                      >
                        Nạp tiền ngay
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col>
                  {error && <Alert variant="danger" className="rounded-pill text-center">{error}</Alert>}
                  {successMessage && <Alert variant="success" className="rounded-pill text-center">{successMessage}</Alert>}

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3 text-muted fw-bold">Đang tải dữ liệu...</p>
                    </div>
                  ) : (
                    <Tabs
                      defaultActiveKey="deposit"
                      className="mb-4 custom-tabs"
                      justify
                      style={{ borderBottom: "none" }}
                    >
                      <Tab eventKey="deposit" title="Lịch sử nạp tiền">
                        <Card className="shadow-sm border-0" style={{ borderRadius: "15px" }}>
                          <Card.Body className="p-4">
                            <h4 className="text-primary fw-bold mb-4">Lịch sử nạp tiền</h4>
                            <div className="table-responsive">
                              <Table hover className="align-middle">
                                <thead style={{ background: "#f8f9fa" }}>
                                  <tr>
                                    <th>Trạng thái</th>
                                    <th>Ngày nạp</th>
                                    <th>Số tiền</th>
                                    <th>Thực nhận</th>
                                    <th>Mã GD</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {depositHistory.length > 0 ? (
                                    depositHistory.map((item) => (
                                      <tr key={item.id}>
                                        <td>
                                          <Badge bg={getStatusColor(item.status)}>{item.status}</Badge>
                                        </td>
                                        <td>{item.depositDate}</td>
                                        <td
                                          className={
                                            item.status === "Thất bại"
                                              ? "failed-transaction fw-bold"
                                              : "text-success fw-bold"
                                          }
                                        >
                                          {item.depositAmount}
                                        </td>
                                        <td>{item.netAmount}</td>
                                        <td>{item.transactionId}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="text-center py-4 text-muted">
                                        Chưa có lịch sử nạp tiền
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                            {!isGuest && totalDepositPages > 1 && (
                              renderPagination(
                                currentDepositPage,
                                totalDepositPages,
                                handleDepositPageChange
                              )
                            )}
                          </Card.Body>
                        </Card>
                      </Tab>

                      <Tab eventKey="payment" title="Lịch sử thanh toán">
                        <Card className="shadow-sm border-0" style={{ borderRadius: "15px" }}>
                          <Card.Body className="p-4">
                            <h4 className="text-primary fw-bold mb-4">Lịch sử thanh toán</h4>
                            <div className="table-responsive">
                              <Table hover className="align-middle">
                                <thead style={{ background: "#f8f9fa" }}>
                                  <tr>
                                    <th>Thời gian</th>
                                    <th>Phí</th>
                                    <th>Hoạt động</th>
                                    <th>Mã tin</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paymentHistory.length > 0 ? (
                                    paymentHistory.map((item) => (
                                      <tr key={item.id}>
                                        <td>{item.time}</td>
                                        <td className="text-danger fw-bold">{item.fee}</td>
                                        <td>{item.activityType}</td>
                                        <td>{item.postId}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        Chưa có lịch sử thanh toán
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                            {!isGuest && totalPaymentPages > 1 && (
                              renderPagination(
                                currentPaymentPage,
                                totalPaymentPages,
                                handlePaymentPageChange
                              )
                            )}
                          </Card.Body>
                        </Card>
                      </Tab>
                    </Tabs>
                  )}
                </Col>
              </Row>

              <Row className="mt-5">
                <Col className="text-center">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="px-5 py-2 shadow-sm"
                    style={{ borderRadius: "25px" }}
                    onClick={() => navigate("/")}
                  >
                    Quay lại trang chủ
                  </Button>
                </Col>
              </Row>

              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                dialogClassName="modal-custom"
              >
                <Modal.Header
                  closeButton
                  className="border-0"
                  style={{ background: "linear-gradient(45deg, #007bff, #00b4d8)" }}
                >
                  <Modal.Title className="text-white fw-bold">Nạp tiền vào tài khoản</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                  <Form>
                    <Form.Group>
                      <Form.Label className="fw-bold">Số tiền (VNĐ)</Form.Label>
                      <Form.Control
                        type="text"
                        value={depositAmount ? formatNumber(depositAmount) : ""}
                        onChange={handleAmountChange}
                        placeholder="Nhập số tiền, ví dụ: 100000"
                        className="shadow-sm"
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                  <Button
                    variant="outline-secondary"
                    style={{ borderRadius: "20px" }}
                    onClick={() => setShowModal(false)}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    variant="success"
                    style={{ borderRadius: "20px" }}
                    onClick={handleDeposit}
                  >
                    Xác nhận nạp
                  </Button>
                </Modal.Footer>
              </Modal>
            </motion.div>
          </Container>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;