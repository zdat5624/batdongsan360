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
  Modal,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import apiServices from "../services/apiServices";
import Sidebar from "../components/Sidebar"; // Thêm import Sidebar
import Footer from "../components/Footer"; // Thêm import Footer để đồng bộ với các trang khác

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
    width: 100%; /* Đảm bảo container cha chiếm toàn bộ chiều rộng */
  }
  .main-content {
    flex: 1;
    padding-top: 100px; /* Tăng padding-top để tránh bị che bởi header */
    padding-bottom: 150px;
    background: rgb(240, 248, 255); /* Đồng bộ với AdminUsers */
    margin-left: 20px; /* Đảm bảo nội dung chính không bị che bởi sidebar */
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
  .modal-content {
    border-radius: 10px;
    border: none;
  }
  .modal-header {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
    color: #fff;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 15px 20px;
  }
  .modal-title {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .modal-body {
    padding: 20px;
    font-size: 1rem;
    text-align: center;
    color: #333;
  }
  .modal-footer {
    padding: 15px 20px;
    border-top: none;
    display: flex;
    width: auto;
    justify-content: space-between;
    gap: 10px;
  }
  .modal-footer .btn {
    width: 48%;
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  .modal-footer .btn-secondary {
    background-color: #6c757d;
    border: none;
  }
  .modal-footer .btn-secondary:hover {
    background-color: #5a6268;
  }
  .modal-footer .btn-primary {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%) !important;
    
    border: none !important;
  }
  .modal-footer .btn-primary:hover {
    background: linear-gradient(135deg, #0f0f0f 0%, #1f2a3c 100%) !important;
  }
  .action-button {
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 0.9rem;
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
    .btn-outline-primary    {
    height: 40px;
    }
    .btn-primary{
        height: 40px;

    }
  /* Đảm bảo sidebar hiển thị */
  .sidebar {
    display: block !important;
    width: 250px !important; /* Đảm bảo chiều rộng cố định */
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    description: "",
    status: "SUCCESS",
    type: "Sell",
    userId: "",
  });
  const [editPayment, setEditPayment] = useState({
    id: null,
    amount: "",
    description: "",
    status: "SUCCESS",
    type: "Sell",
  });

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
        const transactions = response.data.data.content.map((txn) => {
          const postIdMatch = txn.description.match(/Thanh toán phí đăng tin (\d+)/);
          return {
            id: txn.id,
            transactionId: txn.txnId || `PT${txn.id}`,
            userId: txn.user.id,
            amount: Math.abs(txn.amount),
            paymentMethod: txn.paymentLink ? "VNPay" : "System",
            status: txn.status,
            paymentDate: new Date(txn.createdAt).toISOString().split("T")[0],
            type: postIdMatch ? "Sell" : "Deposit",
            description: txn.description,
          };
        });

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

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.toString().includes(searchTerm);
    const matchesType = filterType === "All" || payment.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (paymentId) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa giao dịch "${payments.find((p) => p.id === paymentId).transactionId}"?`
      )
    ) {
      try {
        const response = await apiServices.delete(`/api/admin/payment/transactions/${paymentId}`);
        if (response.data.statusCode === 200) {
          fetchPayments();
          alert("Giao dịch đã được xóa thành công!");
        } else {
          throw new Error(response.data.message || "Không thể xóa giao dịch.");
        }
      } catch (err) {
        setError(err.message || "Không thể xóa giao dịch. Vui lòng thử lại.");
      }
    }
  };

  const handleEdit = (paymentId) => {
    const paymentToEdit = payments.find((payment) => payment.id === paymentId);
    setEditPayment({
      id: paymentToEdit.id,
      amount: paymentToEdit.amount,
      description: paymentToEdit.description || "",
      status: paymentToEdit.status,
      type: paymentToEdit.type,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (
      !editPayment.amount ||
      !editPayment.description ||
      !editPayment.status ||
      !editPayment.type
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await apiServices.put(
        `/api/admin/payment/transactions/${editPayment.id}`,
        {
          amount: editPayment.type === "Sell" ? -editPayment.amount : editPayment.amount,
          description: editPayment.description,
          status: editPayment.status,
        }
      );

      if (response.data.statusCode === 200) {
        fetchPayments();
        setShowEditModal(false);
        alert("Giao dịch đã được cập nhật thành công!");
      } else {
        throw new Error(response.data.message || "Không thể cập nhật giao dịch.");
      }
    } catch (err) {
      setError(err.message || "Không thể cập nhật giao dịch. Vui lòng thử lại.");
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (
      !newPayment.amount ||
      !newPayment.description ||
      !newPayment.status ||
      !newPayment.type ||
      !newPayment.userId
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await apiServices.post("/api/admin/payment/transactions", {
        amount: newPayment.type === "Sell" ? -newPayment.amount : newPayment.amount,
        description: newPayment.description,
        status: newPayment.status,
        userId: newPayment.userId,
      });

      if (response.data.statusCode === 201) {
        fetchPayments();
        setNewPayment({
          amount: "",
          description: "",
          status: "SUCCESS",
          type: "Sell",
          userId: "",
        });
        setShowAddModal(false);
        alert("Giao dịch đã được thêm thành công!");
      } else {
        throw new Error(response.data.message || "Không thể thêm giao dịch.");
      }
    } catch (err) {
      setError(err.message || "Không thể thêm giao dịch. Vui lòng thử lại.");
    }
  };

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
                <Button
                  variant={filterType === "Sell" ? "primary" : "outline-primary"}
                  onClick={() => setFilterType("Sell")}
                >
                  Thanh toán bán
                </Button>
                <Button
                  variant={filterType === "Deposit" ? "primary" : "outline-primary"}
                  onClick={() => setFilterType("Deposit")}
                >
                  Nạp tiền
                </Button>
                <Button
                  variant={filterType === "All" ? "primary" : "outline-primary"}
                  onClick={() => setFilterType("All")}
                >
                  Tất cả
                </Button>
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
                <Button variant="success" onClick={() => setShowAddModal(true)}>
                  Thêm Giao Dịch
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Thêm Giao Dịch Mới</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={handleAddPayment}>
                      <Form.Group className="mb-3">
                        <Form.Label>ID Người Dùng</Form.Label>
                        <Form.Control
                          type="number"
                          value={newPayment.userId}
                          onChange={(e) => setNewPayment({ ...newPayment, userId: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Số Tiền (VND)</Form.Label>
                        <Form.Control
                          type="number"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Mô Tả</Form.Label>
                        <Form.Control
                          type="text"
                          value={newPayment.description}
                          onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Trạng Thái</Form.Label>
                        <Form.Control
                          as="select"
                          value={newPayment.status}
                          onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                        >
                          <option value="SUCCESS">Thành công</option>
                          <option value="PENDING">Đang kiểm</option>
                          <option value="FAILED">Thất bại</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Loại</Form.Label>
                        <Form.Control
                          as="select"
                          value={newPayment.type}
                          onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                        >
                          <option value="Sell">Thanh toán bán</option>
                          <option value="Deposit">Nạp tiền</option>
                        </Form.Control>
                      </Form.Group>
                      <Button variant="primary" type="submit">
                        Thêm
                      </Button>
                    </Form>
                  </Modal.Body>
                </Modal>

                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa Giao Dịch</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={handleSaveEdit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số Tiền (VND)</Form.Label>
                        <Form.Control
                          type="number"
                          value={editPayment.amount}
                          onChange={(e) => setEditPayment({ ...editPayment, amount: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Mô Tả</Form.Label>
                        <Form.Control
                          type="text"
                          value={editPayment.description}
                          onChange={(e) => setEditPayment({ ...editPayment, description: e.target.value })}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Trạng Thái</Form.Label>
                        <Form.Control
                          as="select"
                          value={editPayment.status}
                          onChange={(e) => setEditPayment({ ...editPayment, status: e.target.value })}
                        >
                          <option value="SUCCESS">Thành công</option>
                          <option value="PENDING">Đang kiểm</option>
                          <option value="FAILED">Thất bại</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Loại</Form.Label>
                        <Form.Control
                          as="select"
                          value={editPayment.type}
                          onChange={(e) => setEditPayment({ ...editPayment, type: e.target.value })}
                        >
                          <option value="Sell">Thanh toán bán</option>
                          <option value="Deposit">Nạp tiền</option>
                        </Form.Control>
                      </Form.Group>
                      <Button variant="primary" type="submit">
                        Lưu
                      </Button>
                    </Form>
                  </Modal.Body>
                </Modal>

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
                      <th>Loại</th>
                      <th>Hành động</th>
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
                          <td>{payment.type === "Sell" ? "Thanh toán bán" : "Nạp tiền"}</td>
                          <td>
                            <Button
                              variant="info"
                              size="sm"
                              className="me-2 action-button"
                              onClick={() => handleEdit(payment.id)}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="action-button"
                              onClick={() => handleDelete(payment.id)}
                            >
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">
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
      <Footer />
    </div>
  );
};

export default AdminPayments;