/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Form,
  InputGroup,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import Sidebar from "../components/Sidebar";
import apiServices from "../services/apiServices";

// CSS tùy chỉnh
const customStyles = `
  .layout {
    display: grid;
    grid-template-columns: minmax(250px, 250px) 1fr;
    min-height: 100vh;
    background: #f0f4f8;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 20px;
    padding-top: 60px; /* Khoảng cách 60px từ đỉnh trang */
    background: #f0f4f8;
  }

  .custom-container {
    padding: 20px;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .admin-table {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .admin-table thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: #fff;
  }

  .admin-table tbody tr {
    transition: background-color 0.2s ease;
  }

  .admin-table tbody tr:hover {
    background-color: #e6f0ff;
  }

  .admin-table tbody tr:nth-child(odd) {
    background-color: #f8f9fa;
  }

  .search-input {
    border-radius: 25px;
    border: 1px solid #ced4da;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.2);
  }

  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 20px;
  }

  .pagination .page-item.active .page-link {
    background: linear-gradient(135deg, #007bff, #0056b3);
    border-color: #007bff;
    color: #fff;
  }

  .pagination .page-link {
    color: #007bff;
    border-radius: 8px;
    margin: 0 2px;
    transition: all 0.2s ease;
  }

  .pagination .page-link:hover {
    background-color: #e6f0ff;
  }

  .pagination-input {
    width: 70px;
    height: 38px;
    border-radius: 8px;
    font-size: 0.95rem;
  }

  .pagination-go-button {
    height: 38px;
    border-radius: 8px;
    font-size: 0.95rem;
    padding: 0 15px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
  }

  .badge {
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .sidebar {
      width: 100%;
      position: fixed;
      top: 0;
      z-index: 1000;
      display: none;
    }
    .main-content {
      padding: 15px;
      padding-top: 60px;
    }
    .page-title {
      font-size: 1.5rem;
    }
    .admin-table th:nth-child(5),
    .admin-table td:nth-child(5) {
      display: none;
    }
  }

  @media (max-width: 576px) {
    .page-title {
      font-size: 1.25rem;
    }
    .admin-table th:nth-child(7),
    .admin-table td:nth-child(7) {
      display: none;
    }
    .filter-group {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

const AdminPayments = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("SUCCESS");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [goToPage, setGoToPage] = useState("");
  const paymentsPerPage = 15;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        throw new Error("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
      }

      const startDateFormatted = `${startDate}T00:00:00Z`;
      const endDateFormatted = `${endDate}T23:59:59Z`;
      const response = await apiServices.get(
        `/api/admin/payment/transactions?page=${
          currentPage - 1
        }&size=${paymentsPerPage}&sort=createdAt&direction=DESC&status=${statusFilter}&startDate=${startDateFormatted}&endDate=${endDateFormatted}`
      );

      if (response.data.statusCode === 200) {
        const transactions = response.data.data.content.map((txn) => ({
          id: txn.id,
          transactionId: txn.txnId || `PT${txn.id}`,
          userId: txn.user.id,
          amount: Math.abs(txn.amount),
          paymentMethod: txn.paymentLink ? "VNPay" : "System",
          status: txn.status,
          paymentDate: new Date(txn.createdAt).toISOString().split("T")[0],
          description: txn.description,
        }));

        setPayments(transactions);
        setTotalPages(response.data.data.totalPages);
      } else {
        throw new Error(response.data.message || "Không thể lấy danh sách giao dịch.");
      }
    } catch (err) {
      setError(err.message || "Không thể lấy danh sách giao dịch. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, startDate, endDate]);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.toString().includes(searchTerm)
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage("");
    } else {
      alert("Vui lòng nhập số trang hợp lệ!");
    }
  };

  const renderPaginationItems = () => {
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
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      />
    );
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis" />);
      items.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <div className="layout">
      <Helmet>
        <title>Quản lý Thanh Toán - Admin Panel</title>
      </Helmet>
      <style>{customStyles}</style>
      <Sidebar user={user} handleLogout={handleLogout} />
      <div className="content-wrapper">
        <div className="main-content">
          <Container className="custom-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="page-title">
                <FaInfoCircle /> Quản lý Thanh Toán
              </h2>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <div className="d-flex justify-content-start mb-4">
                <div className="filter-group">
                  <InputGroup style={{ maxWidth: "350px" }}>
                    <InputGroup.Text
                      style={{ background: "#fff", borderRadius: "25px 0 0 25px" }}
                    >
                      <FaSearch className="text-primary" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm mã giao dịch hoặc ID người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                      style={{ borderRadius: "0 25px 25px 0" }}
                    />
                  </InputGroup>
                  <InputGroup style={{ maxWidth: "200px" }}>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </InputGroup>
                  <InputGroup style={{ maxWidth: "200px" }}>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </InputGroup>
                  <InputGroup style={{ maxWidth: "200px" }}>
                    <Form.Control
                      as="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="SUCCESS">Thành công</option>
                      <option value="PENDING">Đang kiểm</option>
                      <option value="FAILED">Thất bại</option>
                    </Form.Control>
                  </InputGroup>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  <Table responsive className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mã Giao Dịch</th>
                        <th>ID Người Dùng</th>
                        <th>Số Tiền (VND)</th>
                        <th>Phương Thức</th>
                        <th>Trạng Thái</th>
                        <th>Ngày Thanh Toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.id}</td>
                            <td>{payment.transactionId}</td>
                            <td>{payment.userId}</td>
                            <td>{payment.amount.toLocaleString()}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>
                              <span
                                className={`badge ${
                                  payment.status === "SUCCESS"
                                    ? "bg-success"
                                    : payment.status === "PENDING"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {payment.status === "SUCCESS"
                                  ? "Thành công"
                                  : payment.status === "PENDING"
                                  ? "Đang kiểm"
                                  : "Thất bại"}
                              </span>
                            </td>
                            <td>{payment.paymentDate}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            Không tìm thấy giao dịch nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  <div className="pagination-container">
                    <Pagination>{renderPaginationItems()}</Pagination>
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGoToPage();
                      }}
                      className="d-flex align-items-center gap-2"
                    >
                      <Form.Control
                        type="number"
                        value={goToPage}
                        onChange={(e) => setGoToPage(e.target.value)}
                        placeholder="Trang"
                        min="1"
                        max={totalPages}
                        className="pagination-input"
                      />
                      <Button
                        className="pagination-go-button"
                        onClick={handleGoToPage}
                      >
                        Đi
                      </Button>
                    </Form>
                  </div>
                </>
              )}
            </motion.div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;