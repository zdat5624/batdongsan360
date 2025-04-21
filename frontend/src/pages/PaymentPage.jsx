/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
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
  Pagination,
} from "react-bootstrap";
import apiServices from "../services/apiServices";
import { motion } from "framer-motion";

// CSS tối ưu
const customStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }
  .main-content {
    flex: 1;
    padding: 20px;
    padding-top: 70px;
    background: #f0f4f8;
  }
  .custom-tabs .nav-link {
    font-weight: bold;
    color: #007bff;
    border-radius: 10px 10px 0 0;
  }
  .custom-tabs .nav-link.active {
    background: #007bff;
    color: white;
  }
  .modal-custom {
    max-width: 400px;
  }
  .balance-card {
    max-width: 400px;
    margin: 30px auto;
    border-radius: 15px;
    overflow: hidden;
    background: linear-gradient(45deg, #007bff, #00b4d8);
  }
  .balance-card h3 {
    font-size: 1.5rem;
    color: white;
  }
  .balance-card .badge {
    font-size: 1.2rem;
    padding: 8px 16px;
  }
  .table th {
    background: #f8f9fa;
  }
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  .pagination .page-item.active .page-link {
    background: #007bff;
    border-color: #007bff;
    color: #fff;
  }
  .pagination .page-link {
    color: #007bff;
    border-radius: 8px;
    margin: 0 2px;
  }
  .pagination .page-link:hover {
    background: #e6f0ff;
  }
`;

const PaymentPage = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [allDeposits, setAllDeposits] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDepositPage, setCurrentDepositPage] = useState(1);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [totalDepositPages, setTotalDepositPages] = useState(1);
  const [totalPaymentPages, setTotalPaymentPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!user || !user.id) {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchBalance = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const response = await apiServices.get(`/api/users/${user.id}`);
      if (response.data.statusCode === 200) {
        setBalance(response.data.data.balance);
      } else {
        throw new Error("Không thể lấy số dư.");
      }
    } catch (err) {
      setError(err.message || "Không thể tải số dư.");
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/api/payment/my-transactions?page=0&size=1000&sort=createdAt,desc`
      );
      if (response.data.statusCode === 200) {
        const transactions = response.data.data.content || [];

        const deposits = transactions
          .filter((txn) => txn.amount > 0)
          .map((txn) => ({
            id: txn.id,
            status: txn.status === "SUCCESS" ? "Thành công" : "Thất bại",
            depositDate: new Date(txn.createdAt).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            depositAmount: `+${Math.abs(txn.amount).toLocaleString("vi-VN")}`,
            netAmount: Math.abs(txn.amount).toLocaleString("vi-VN"),
            transactionId: txn.txnId || `PT${txn.id}`,
          }));

        const payments = transactions
          .filter((txn) => txn.amount < 0)
          .map((txn) => {
            const postIdMatch = txn.description?.match(/Thanh toán phí đăng tin (\d+)/);
            return {
              id: txn.id,
              time: new Date(txn.createdAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              fee: Math.abs(txn.amount).toLocaleString("vi-VN"),
              activityType: "Đăng tin",
              postId: postIdMatch ? postIdMatch[1] : "N/A",
            };
          });

        setAllDeposits(deposits);
        setAllPayments(payments);

        setTotalDepositPages(Math.ceil(deposits.length / pageSize) || 1);
        setTotalPaymentPages(Math.ceil(payments.length / pageSize) || 1);

        setDepositHistory(deposits.slice(0, pageSize));
        setPaymentHistory(payments.slice(0, pageSize));
      } else {
        throw new Error("Không thể lấy lịch sử giao dịch.");
      }
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử giao dịch.");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const start = (currentDepositPage - 1) * pageSize;
    const end = start + pageSize;
    setDepositHistory(allDeposits.slice(start, end));
  }, [currentDepositPage, allDeposits, pageSize]);

  useEffect(() => {
    const start = (currentPaymentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaymentHistory(allPayments.slice(start, end));
  }, [currentPaymentPage, allPayments, pageSize]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const vnpResponseCode = query.get("vnp_ResponseCode");
    const vnpTransactionStatus = query.get("vnp_TransactionStatus");

    if (status || vnpResponseCode || vnpTransactionStatus) {
      if (status === "1" || vnpResponseCode === "00" || vnpTransactionStatus === "00") {
        setSuccessMessage("Thanh toán thành công! Số dư đã được cập nhật.");
      } else {
        setError("Thanh toán thất bại. Vui lòng thử lại.");
      }
      window.history.replaceState({}, document.title, "/payment");
    }

    if (user && user.id) {
      setLoading(true);
      Promise.all([fetchBalance(), fetchTransactions()])
        .catch((err) => setError("Lỗi khi tải dữ liệu: " + err.message))
        .finally(() => setLoading(false));
    }
  }, [user, location.search, fetchBalance, fetchTransactions]);

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
      if (isNaN(amount) || amount <= 0) throw new Error("Số tiền không hợp lệ.");
      const response = await apiServices.post("/api/payment/create", { amount });
      if (response.data.statusCode === 201 && response.data.data.paymentLink) {
        window.location.href = response.data.data.paymentLink;
      } else {
        throw new Error("Không thể tạo link thanh toán.");
      }
    } catch (err) {
      setError(err.message || "Không thể tạo link thanh toán.");
      setShowModal(false);
    }
  };

  const getStatusColor = (status) => {
    return status === "Thành công" ? "success" : "danger";
  };

  const renderPagination = (currentPage, totalPages, setPage) => {
    const items = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    items.push(
      <Pagination.First
        key="first"
        onClick={() => setPage(1)}
        disabled={currentPage === 1}
      />
    );
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis" />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => setPage(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => setPage(totalPages)}
        disabled={currentPage === totalPages}
      />
    );

    return (
      <div className="pagination-container">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="layout">
      <style>{customStyles}</style>
      <div className="main-content">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Row className="justify-content-center mb-5">
              <Col xs={12} md={8} lg={6}>
                <Card className="shadow-lg border-0 balance-card">
                  <Card.Body className="p-4 d-flex flex-column align-items-center">
                    <h3 className="fw-bold mb-3 text-white">Số dư tài khoản</h3>
                    <Badge bg="light" className="py-2 px-4 text-dark shadow-sm mb-4">
                      {balance.toLocaleString("vi-VN")} VNĐ
                    </Badge>
                    <Button
                      variant="light"
                      className="fw-bold shadow-sm"
                      style={{ borderRadius: "25px" }}
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
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải...</p>
                  </div>
                ) : (
                  <Tabs defaultActiveKey="deposit" className="mb-4 custom-tabs" justify>
                    <Tab eventKey="deposit" title="Lịch sử nạp tiền">
                      <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                          <h4 className="text-primary fw-bold mb-4">Lịch sử nạp tiền</h4>
                          <Table hover>
                            <thead>
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
                                    <td className={item.status === "Thất bại" ? "text-danger" : "text-success"}>
                                      {item.depositAmount}
                                    </td>
                                    <td>{item.netAmount}</td>
                                    <td>{item.transactionId}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" className="text-center py-4">
                                    Chưa có lịch sử nạp tiền
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                          {totalDepositPages > 1 && (
                            renderPagination(currentDepositPage, totalDepositPages, setCurrentDepositPage)
                          )}
                        </Card.Body>
                      </Card>
                    </Tab>
                    <Tab eventKey="payment" title="Lịch sử thanh toán">
                      <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                          <h4 className="text-primary fw-bold mb-4">Lịch sử thanh toán</h4>
                          <Table hover>
                            <thead>
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
                                    <td className="text-danger">{item.fee}</td>
                                    <td>{item.activityType}</td>
                                    <td>{item.postId}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center py-4">
                                    Chưa có lịch sử thanh toán
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                          {totalPaymentPages > 1 && (
                            renderPagination(currentPaymentPage, totalPaymentPages, setCurrentPaymentPage)
                          )}
                        </Card.Body>
                      </Card>
                    </Tab>
                  </Tabs>
                )}
              </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="modal-custom">
              <Modal.Header closeButton style={{ background: "linear-gradient(45deg, #007bff, #00b4d8)" }}>
                <Modal.Title className="text-white">Nạp tiền vào tài khoản</Modal.Title>
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
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button variant="success" onClick={handleDeposit}>
                  Nạp tiền
                </Button>
              </Modal.Footer>
            </Modal>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default PaymentPage;