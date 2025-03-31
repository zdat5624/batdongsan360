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
import apiServices from "../services/apiServices"; // Giả sử bạn đã có apiServices để gọi API

const AdminPayments = ({ user }) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterType, setFilterType] = useState("All"); // Lọc theo Sell/Deposit
  const [statusFilter, setStatusFilter] = useState("SUCCESS"); // Lọc theo trạng thái
  const [startDate, setStartDate] = useState("2025-01-01"); // Ngày bắt đầu
  const [endDate, setEndDate] = useState("2025-12-31"); // Ngày kết thúc
  const [goToPage, setGoToPage] = useState(""); // State cho ô nhập số trang
  const paymentsPerPage = 10;

  // State cho form thêm và sửa thanh toán
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

  // Lấy danh sách giao dịch từ API
  const fetchPayments = async () => {
    setLoading(true); // Bật trạng thái loading
    try {
      // Kiểm tra startDate và endDate
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
            type: postIdMatch ? "Sell" : "Deposit", // Phân loại giao dịch
            description: txn.description, // Lưu description để sử dụng khi chỉnh sửa
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
      setLoading(false); // Tắt trạng thái loading
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, startDate, endDate]);

  // Lọc thanh toán dựa trên từ khóa tìm kiếm và loại
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.toString().includes(searchTerm);
    const matchesType = filterType === "All" || payment.type === filterType;
    return matchesSearch && matchesType;
  });

  // Xử lý xóa giao dịch
  const handleDelete = async (paymentId) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa giao dịch "${payments.find((p) => p.id === paymentId).transactionId}"?`
      )
    ) {
      try {
        const response = await apiServices.delete(`/api/admin/payment/transactions/${paymentId}`);
        if (response.data.statusCode === 200) {
          fetchPayments(); // Cập nhật lại danh sách sau khi xóa
          alert("Giao dịch đã được xóa thành công!");
        } else {
          throw new Error(response.data.message || "Không thể xóa giao dịch.");
        }
      } catch (err) {
        setError(err.message || "Không thể xóa giao dịch. Vui lòng thử lại.");
      }
    }
  };

  // Xử lý chỉnh sửa giao dịch
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

  // Lưu thay đổi sau khi sửa
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
          amount: editPayment.type === "Sell" ? -editPayment.amount : editPayment.amount, // Thanh toán phí là âm, nạp tiền là dương
          description: editPayment.description,
          status: editPayment.status,
        }
      );

      if (response.data.statusCode === 200) {
        fetchPayments(); // Cập nhật lại danh sách sau khi sửa
        setShowEditModal(false);
        alert("Giao dịch đã được cập nhật thành công!");
      } else {
        throw new Error(response.data.message || "Không thể cập nhật giao dịch.");
      }
    } catch (err) {
      setError(err.message || "Không thể cập nhật giao dịch. Vui lòng thử lại.");
    }
  };

  // Xử lý thêm giao dịch mới
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
        amount: newPayment.type === "Sell" ? -newPayment.amount : newPayment.amount, // Thanh toán phí là âm, nạp tiền là dương
        description: newPayment.description,
        status: newPayment.status,
        userId: newPayment.userId, // Thêm userId vào payload
      });

      if (response.data.statusCode === 201) {
        fetchPayments(); // Cập nhật lại danh sách sau khi thêm
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

  // Xử lý thay đổi trang
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Xử lý nhảy đến trang cụ thể
  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage(""); // Xóa ô nhập sau khi nhảy trang
    } else {
      alert("Vui lòng nhập số trang hợp lệ!");
    }
  };

  // Logic hiển thị các số trang
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; // Số trang tối đa hiển thị (1, 2, 3, ..., 601)
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Điều chỉnh startPage nếu endPage gần cuối
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Nút "Trang đầu" và "Trang trước"
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

    // Hiển thị số trang
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

    // Hiển thị "..." nếu có nhiều trang hơn
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

    // Nút "Trang sau" và "Trang cuối"
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
    <Container className="mt-4">
      <h2>Quản lý Thanh Toán</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Bộ lọc */}
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

      {/* Hiển thị spinner khi đang loading */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Modal thêm giao dịch */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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

          {/* Modal chỉnh sửa giao dịch */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
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

          <Table striped bordered hover responsive className="admin-table">
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
                        className="me-2"
                        onClick={() => handleEdit(payment.id)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
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

          {/* Phân trang */}
          <div className="d-flex justify-content-center align-items-center mt-3">
            <Pagination>
              {renderPaginationItems()}
            </Pagination>
            <InputGroup style={{ maxWidth: "150px", marginLeft: "10px" }}>
              <Form.Control
                type="number"
                placeholder="Nhập số trang"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
              />
              <Button variant="primary" onClick={handleGoToPage}>
                Đi
              </Button>
            </InputGroup>
          </div>
        </>
      )}
    </Container>
  );
};

export default AdminPayments;