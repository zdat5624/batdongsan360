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
import apiServices from "../services/apiServices";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const customStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    background: rgb(240, 248, 255);
    flex-direction: column;
  }
  .content-wrapper {
    display: flex;
    flex: 1;
    width: 100%;
  }
  .main-content {
    flex: 1;
    padding-top: 100px;
    padding-bottom: 150px;
    background: rgb(240, 248, 255);
    margin-left: 20px;
  }
  .custom-container {
    padding: 20px;
  }
  .admin-table {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .admin-table thead {
    background-color: #007bff;
    color: #fff;
  }
  .admin-table tbody tr {
    transition: background-color 0.3s;
  }
  .admin-table tbody tr:hover {
    background-color: #e9ecef;
  }
  .admin-table tbody tr:nth-child(odd) {
    background-color: #f8f9fa;
  }
  .admin-table tbody tr:nth-child(even) {
    background-color: #ffffff;
  }
  .search-input {
    border-radius: 20px;
    border: 1px solid #ced4da;
    transition: all 0.3s;
  }
  .search-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
  }
  .pagination .page-item.active .page-link {
    background-color: rgb(255, 255, 255);
    border-color: #007bff;
  }
  .pagination .page-link {
    color: #007bff;
  }
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    flex-wrap: nowrap;
  }
  .pagination-input {
    width: 60px;
    height: 32px;
    border-radius: 5px;
    font-size: 0.9rem;
  }
  .pagination-go-button {
    height: 32px;
    border-radius: 5px;
    font-size: 0.9rem;
    padding: 0 15px;
  }
  .pagination {
    margin-bottom: 0;
  }
  .pagination-form {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .btn-outline-primary {
    height: 40px;
  }
  .btn-primary {
    height: 40px;
  }
  .sidebar {
    display: block !important;
    width: 250px !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 100 !important;
    min-height: calc(100vh - 70px) !important;
    background-color: #f8f9fa !important;
    border-right: 1px solid #dee2e6 !important;
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
  const [filterType, setFilterType] = useState("All");
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
        `/api/admin/payment/transactions?page=${currentPage - 1}&size=${paymentsPerPage}&sort=createdAt&direction=DESC&status=${statusFilter}&startDate=${startDateFormatted}&endDate=${endDateFormatted}`
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

  const filteredPayments = payments.filter((payment) =>
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
      <style>{customStyles}</style>
      <div className="content-wrapper">
        <Sidebar user={user} handleLogout={handleLogout} />
        <div className="main-content">
          <Container className="custom-container">
            <h2 className="mb-4 text-primary fw-bold">Quản lý Thanh Toán</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="d-flex justify-content-between mb-4 flex-wrap">
              <div className="d-flex flex-wrap gap-2">
                {/* Giữ lại các nút lọc nếu cần, nhưng loại bỏ liên quan đến type */}
              </div>

              <div className="d-flex flex-wrap gap-2">
                <InputGroup style={{ maxWidth: "200px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
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
                        <td colSpan="7" className="text-center">
                          Không tìm thấy giao dịch nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <div className="pagination-container mt-3">
                  <Pagination>{renderPaginationItems()}</Pagination>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGoToPage();
                    }}
                    className="pagination-form"
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
                      variant="primary"
                      className="pagination-go-button"
                      onClick={handleGoToPage}
                    >
                      Đi
                    </Button>
                  </Form>
                </div>
              </>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;