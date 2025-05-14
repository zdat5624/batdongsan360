import React, { useEffect, useState } from 'react';
import { PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../LoginModal';
import axiosInstance from '../../api/axiosConfig';
import { message } from 'antd';

const ContactButton = ({ projectId, recipientId, revealedPhones, hiddenPhone, fullPhone, handleTogglePhone }) => {
    const { isAuthenticated } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && isModalVisible) {
            console.log('>>> isAuthenticated changed to true, closing modal and calling handleViewPhone');
            setIsModalVisible(false);
            handleViewPhone();
        }
    }, [isAuthenticated, isModalVisible]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSuccess = () => {
        setIsModalVisible(false); // Đóng modal
        console.log(">>> isAuthenticated: ", isAuthenticated);
        // if (isAuthenticated) {
        //     console.log(">>> handleViewPhone();")
        console.log(">> cal handleViewPhone() from handleSuccess()");
        handleViewPhone(); // Chỉ gọi nếu đã xác thực
        // }
    };

    const handleViewPhone = async () => {
        console.log(">>> isAuthenticated handleViewPhone(): ", isAuthenticated);
        if (!isAuthenticated) {
            showModal();
            return;
        }

        setLoading(true);
        try {
            console.log(">>> call api: /api/notifications/view-phone");
            const response = await axiosInstance.post('/api/notifications/view-phone', {
                postId: projectId,
                recipientId: recipientId,
            });

            // Kiểm tra statusCode
            if (response.data.statusCode === 201) {
                // Cập nhật trạng thái số điện thoại

                // Hiển thị thông báo từ API
                // message.success(response.data.data.message || 'Đã gửi thông báo đến chủ bài đăng!');
            } else {
                // Xử lý trường hợp API trả về statusCode không mong muốn
                // message.error(response.data.message || 'Yêu cầu không thành công.');
            }
        } catch (error) {
            // Interceptor đã xử lý các lỗi 401, 403, 404, chỉ xử lý lỗi 400 hoặc lỗi khác
            if (error.response?.data?.message) {
                // message.error(error.response.data.message);
            } else {
                // message.error('Yêu cầu không hợp lệ.');
            }
        } finally {
            setLoading(false);
            handleTogglePhone(projectId);
        }
    };

    const handleContactClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleViewPhone();
    };

    return (
        <>
            <style>
                {`
                    .contact-button {
                        border-radius: 20px;
                        padding: 6px 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: none;
                        height: 35px;
                        min-width: 150px;
                        background-color: #00A3AD;
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 500;
                        line-height: 1;
                        transition: background-color 0.3s ease;
                    }

                    .contact-button:hover {
                        background-color: #008B94;
                        color: #ffffff;
                        cursor: pointer;
                    }

                    .contact-button .anticon {
                        margin-right: 8px;
                        font-size: 18px;
                    }

                    .contact-button:disabled {
                        background-color: #cccccc;
                        cursor: not-allowed;
                    }
                `}
            </style>
            <div
                className="contact-button"
                onClick={handleContactClick}
                disabled={loading}
            >
                <PhoneOutlined />
                {revealedPhones[projectId] ? `${revealedPhones[projectId]} - Ẩn` : `${hiddenPhone} - Hiện`}
            </div>
            <LoginModal
                visible={isModalVisible}
                onCancel={handleCancel}
                onSuccess={handleSuccess}
            />
        </>
    );
};

export default ContactButton;