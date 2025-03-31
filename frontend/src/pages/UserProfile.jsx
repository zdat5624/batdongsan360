/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col, Nav, Form, Image, InputGroup } from "react-bootstrap";
import apiServices from "../services/apiServices";

const customStyles = `
  .profile-card {
    max-width: 1000px;
    margin: 0 auto;
    border: none;
    border-radius: 15px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  .nav-tabs .nav-link {
    font-weight: bold;
    color: #007bff;
    border-radius: 10px 10px 0 0;
    font-size: 1.2rem;
  }
  .nav-tabs .nav-link.active {
    background-color: #007bff;
    color: white;
  }
  .avatar-wrapper {
    position: relative;
    display: inline-block;
  }
  .avatar-img {
    border: 5px solid #007bff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  .form-control {
    font-size: 1.1rem;
    padding: 12px;
  }
  .form-control:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
  }
  .form-label {
    font-size: 1.2rem;
  }
  .btn-custom {
    border-radius: 25px;
    padding: 12px 30px;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const UserProfile = ({ user, setUser }) => {
  const [avatar, setAvatar] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchUserById = async () => {
    if (!userId) {
      setError("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiServices.get(`/api/users/${userId}`);
      if (response.data.statusCode === 200) {
        const userData = response.data.data;
        setUser(userData);
        setEditedUser(userData);
        setAvatar(userData.avatar || "");
      } else {
        throw new Error(response.data.message || "Không thể lấy thông tin người dùng.");
      }
    } catch (err) {
      setError(err.message || "Không thể lấy thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Bạn cần đăng nhập để xem thông tin cá nhân.");
      setLoading(false);
      return;
    }
    fetchUserById();
  }, []);

  useEffect(() => {
    if (user) {
      setEditedUser(user);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h3 className="text-primary fw-bold">Đang tải thông tin...</h3>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <h3 className="text-danger fw-bold">{error}</h3>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5 text-center">
        <h3 className="text-danger fw-bold">Bạn cần đăng nhập để xem thông tin cá nhân.</h3>
      </Container>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file)); // Hiển thị tạm thời trên giao diện
      setEditedUser((prevUser) => ({ ...prevUser, avatarFile: file }));
    }
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiServices.post(`/api/users/upload-avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.avatarUrl; // Giả sử API trả về URL của avatar
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    if (!userId) {
      setError("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      let avatarUrl = editedUser.avatar;
      if (editedUser.avatarFile) {
        avatarUrl = await uploadAvatar(editedUser.avatarFile);
      }

      const updatedUserData = {
        name: editedUser.name,
        email: editedUser.email,
        phone: editedUser.phone,
        address: editedUser.address,
        gender: editedUser.gender,
        avatar: avatarUrl,
      };

      console.log("Dữ liệu gửi lên API:", updatedUserData);
      console.log("Dữ liệu hiện tại:", user);

      const response = await apiServices.put(`/api/users/${userId}`, updatedUserData);
      console.log("Phản hồi từ API:", response.data);

      if (response.data.statusCode === 200) {
        const updatedUser = response.data.data;
        console.log("Dữ liệu sau khi cập nhật:", updatedUser);
        setUser(updatedUser);
        setEditedUser(updatedUser);
        setAvatar(updatedUser.avatar || "");
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || "Không thể cập nhật thông tin người dùng.");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      setError(err.response?.data?.message || err.message || "Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.");
    }
  };

  const handleCancelClick = () => {
    setEditedUser(user);
    setAvatar(user.avatar || "");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBalance = (balance) => {
    return balance.toLocaleString("vi-VN") + " VNĐ";
  };

  return (
    <Container fluid className="py-5" style={{ backgroundColor: "#f0f8ff", minHeight: "100vh" }}>
      <style>{customStyles}</style>
      <Container>
        <Card className="profile-card p-4">
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-5">
            <Nav.Item>
              <Nav.Link eventKey="profile">Thông Tin Cá Nhân</Nav.Link>
            </Nav.Item>
          </Nav>

          <div>
            {activeTab === "profile" && (
              <>
                <Row className="text-center mb-5">
                  <Col>
                    <div className="avatar-wrapper">
                      <Image
                        src={avatar || "https://via.placeholder.com/200"}
                        alt="Avatar"
                        roundedCircle
                        className="avatar-img"
                        style={{ width: "200px", height: "200px", objectFit: "cover" }}
                      />
                      <div className="mt-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          style={{ display: "none" }}
                          id="upload-avatar"
                        />
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as="label"
                          htmlFor="upload-avatar"
                          className="btn-custom"
                        >
                          Đổi Ảnh Đại Diện
                        </Button>
                      </div>
                    </div>
                    <h4 className="mt-4 fw-bold text-primary" style={{ fontSize: "1.8rem" }}>
                      {editedUser.name}
                    </h4>
                  </Col>
                </Row>

                <Row className="g-5">
                  <Col md={6}>
                    <Form.Group controlId="email" className="mb-4">
                      <Form.Label className="fw-bold">Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-envelope"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          value={editedUser.email || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="phone" className="mb-4">
                      <Form.Label className="fw-bold">Số Điện Thoại</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-telephone"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={editedUser.phone || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="role" className="mb-4">
                      <Form.Label className="fw-bold">Quyền</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-shield-lock"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="role"
                          value={editedUser.role || ""}
                          onChange={handleChange}
                          disabled
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="balance" className="mb-4">
                      <Form.Label className="fw-bold">Số Dư</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-wallet"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="balance"
                          value={formatBalance(editedUser.balance || 0)}
                          disabled
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="address" className="mb-4">
                      <Form.Label className="fw-bold">Địa Chỉ</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-geo-alt"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="address"
                          value={editedUser.address || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="gender" className="mb-4">
                      <Form.Label className="fw-bold">Giới Tính</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-person"></i>
                        </InputGroup.Text>
                        <Form.Control
                          as="select"
                          name="gender"
                          value={editedUser.gender || ""}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="rounded-end"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </Form.Control>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="createdAt" className="mb-4">
                      <Form.Label className="fw-bold">Ngày Tạo</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-calendar"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="createdAt"
                          value={formatDate(editedUser.createdAt) || ""}
                          disabled
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="updatedAt" className="mb-4">
                      <Form.Label className="fw-bold">Ngày Cập Nhật</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-calendar-check"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="updatedAt"
                          value={formatDate(editedUser.updatedAt) || ""}
                          disabled
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="createdBy" className="mb-4">
                      <Form.Label className="fw-bold">Người Tạo</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-person-plus"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="createdBy"
                          value={editedUser.createdBy || ""}
                          disabled
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="updatedBy" className="mb-4">
                      <Form.Label className="fw-bold">Người Cập Nhật</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-person-check"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="updatedBy"
                          value={editedUser.updatedBy || ""}
                          disabled
                          className="rounded-end"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-center mt-5">
                  {!isEditing ? (
                    <Button variant="primary" className="btn-custom" onClick={handleEditClick}>
                      Chỉnh Sửa Thông Tin
                    </Button>
                  ) : (
                    <div className="d-flex justify-content-center gap-4">
                      <Button variant="success" className="btn-custom" onClick={handleSaveClick}>
                        Lưu
                      </Button>
                      <Button variant="outline-secondary" className="btn-custom" onClick={handleCancelClick}>
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </Container>
    </Container>
  );
};

export default UserProfile;