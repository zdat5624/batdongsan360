/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col, Nav, Form, Image, InputGroup, Modal } from "react-bootstrap";
import apiServices from "../services/apiServices";
import Sidebar from "../components/Sidebar";

const customStyles = `
  .layout {
    display: flex;
    min-height: 100vh;
    flex-direction: row; /* Thay đổi thành row để chứa sidebar và nội dung chính */
  }
  .main-content {
    flex: 1;
    padding-top: 90px; /* Tăng padding-top để tránh bị che bởi header cố định */
    padding-bottom: 50px;
    background-color: #f0f8ff;
    overflow-y: auto; /* Cho phép cuộn nếu nội dung dài */
  }
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
    border: 3px solidrgb(0, 6, 12);
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
  .btn-profile-custom {
    border-radius: 25px;
    padding: 12px 30px;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const UserProfile = ({ user, setUser, handleLogout }) => {
  const [avatar, setAvatar] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      console.log("API Response /api/users:", response.data);
      if (response.data.statusCode === 200) {
        const userData = response.data.data;
        console.log("User Data:", userData);
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
      setAvatar(URL.createObjectURL(file));
      setEditedUser((prevUser) => ({ ...prevUser, avatarFile: file }));
      setAvatarChanged(true);
    }
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiServices.post(`/api/users/upload-avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.avatarUrl;
  };

  const handleSaveAvatar = async () => {
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
        id: parseInt(userId),
        name: editedUser.name || "",
        email: editedUser.email || "",
        gender: editedUser.gender || "",
        avatar: avatarUrl,
        phone: editedUser.phone || "",
        address: editedUser.address || "",
      };

      console.log("Dữ liệu gửi lên API (Save Avatar):", updatedUserData);

      const response = await apiServices.put(`/api/users`, updatedUserData);
      console.log("Phản hồi từ API (Save Avatar):", response.data);

      if (response.data.statusCode === 200) {
        const updatedUser = response.data.data;
        console.log("Dữ liệu sau khi cập nhật (Save Avatar):", updatedUser);
        setUser(updatedUser);
        setEditedUser(updatedUser);
        setAvatar(updatedUser.avatar || "");
        setAvatarChanged(false);
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || "Không thể cập nhật ảnh đại diện.");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật ảnh đại diện:", err);
      setError(err.response?.data?.message || err.message || "Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.");
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    if (!userId) {
      setError("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      if (!editedUser.email) {
        throw new Error("Email không được để trống.");
      }
      if (!editedUser.phone) {
        throw new Error("Số điện thoại không được để trống.");
      }

      const updatedUserData = {
        id: parseInt(userId),
        name: editedUser.name || "",
        email: editedUser.email,
        gender: editedUser.gender || "",
        avatar: editedUser.avatar || "",
        phone: editedUser.phone,
        address: editedUser.address || "",
      };

      console.log("Dữ liệu gửi lên API:", updatedUserData);

      const response = await apiServices.put(`/api/users`, updatedUserData);
      console.log("Phản hồi từ API:", response.data);

      if (response.data.statusCode === 200) {
        const updatedUser = response.data.data;
        console.log("Dữ liệu sau khi cập nhật:", updatedUser);
        setUser(updatedUser);
        setEditedUser(updatedUser);
        setAvatar(updatedUser.avatar || "");
        setIsEditing(false);
        setShowSuccessModal(true);
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
    setAvatarChanged(false);
  };

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  return (
    <div className="layout">
      <style>{customStyles}</style>
      <Sidebar user={user} handleLogout={handleLogout} />
      <div className="main-content">
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
                          src={`http://localhost:8080/uploads/${avatar}`}
                          alt="Avatar"
                          roundedCircle
                          className="avatar-img"
                          style={{ width: "200px", height: "200px", objectFit: "cover" }}
                        />
                        <div className="mt-4 d-flex justify-content-center gap-2">
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
                            className="btn-profile-custom"
                          >
                            Đổi Ảnh Đại Diện
                          </Button>
                          {avatarChanged && (
                            <Button
                              variant="success"
                              size="sm"
                              className="btn-profile-custom"
                              onClick={handleSaveAvatar}
                            >
                              Lưu Ảnh
                            </Button>
                          )}
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
                    </Col>
                  </Row>

                  <div className="text-center mt-5">
                    {!isEditing ? (
                      <Button variant="primary" className="btn-profile-custom" onClick={handleEditClick}>
                        Chỉnh Sửa Thông Tin
                      </Button>
                    ) : (
                      <div className="d-flex justify-content-center gap-4">
                        <Button variant="success" className="btn-profile-custom" onClick={handleSaveClick}>
                          Lưu
                        </Button>
                        <Button variant="outline-secondary" className="btn-profile-custom" onClick={handleCancelClick}>
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
      </div>

      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-success text-center">Chỉnh sửa thành công!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseSuccessModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;