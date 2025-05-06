import React, { useEffect, useRef, useState } from 'react';
import { Modal, Spin, Button, Typography, message } from 'antd';
import moment from 'moment';
import axiosInstance from '../../api/axiosConfig';

const { Text, Title } = Typography;

const NotificationDetailModal = ({ visible, notification, onClose, onMarkAsRead }) => {
    const [loading, setLoading] = useState(false);
    const markedAsReadRef = useRef(new Set()); // Lưu trữ ID của các thông báo đã được đánh dấu

    useEffect(() => {
        if (visible && notification && !notification.read && !markedAsReadRef.current.has(notification.id)) {
            const markAsRead = async () => {
                setLoading(true);
                try {
                    console.log('Marking notification as read:', notification.id);
                    const response = await axiosInstance.put('/api/notifications/mark-as-read', [notification.id]);
                    if (response.data.statusCode === 200) {
                        markedAsReadRef.current.add(notification.id); // Đánh dấu là đã gọi API
                        onMarkAsRead(notification.id, notification.type);
                    } else {
                        message.error('Không thể đánh dấu thông báo là đã đọc.');
                    }
                } catch (error) {
                    console.error('Error marking notification as read:', error);
                    message.error('Không thể đánh dấu thông báo là đã đọc.');
                } finally {
                    setLoading(false);
                }
            };
            markAsRead();
        }
    }, [visible, notification, onMarkAsRead]);

    // Xóa ID khỏi markedAsReadRef khi modal đóng để cho phép gọi lại API nếu mở lại
    useEffect(() => {
        return () => {
            if (notification) {
                markedAsReadRef.current.delete(notification.id);
            }
        };
    }, [notification]);

    return (
        <Modal
            title={<Title level={4}>Chi tiết thông báo</Title>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" type="primary" onClick={onClose} disabled={loading}>
                    Đóng
                </Button>,
            ]}
            width={600}
            className="rounded-lg"
        >
            {notification ? (
                <Spin spinning={loading}>
                    <div className="space-y-4">
                        <div>
                            <Text strong>Nội dung: </Text>
                            <Text>{notification.message}</Text>
                        </div>
                        <div>
                            <Text strong>Loại: </Text>
                            <Text>
                                {(() => {
                                    const typeMap = {
                                        POST: 'Bài đăng',
                                        TRANSACTION: 'Giao dịch',
                                        SYSTEM_ALERT: 'Hệ thống',
                                    };
                                    return typeMap[notification.type] || notification.type;
                                })()}
                            </Text>
                        </div>
                        <div>
                            <Text strong>Thời gian: </Text>
                            <Text>{moment(notification.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </div>
                    </div>
                </Spin>
            ) : (
                <div className="flex justify-center">
                    <Spin tip="Đang tải..." />
                </div>
            )}
        </Modal>
    );
};

export default React.memo(NotificationDetailModal);