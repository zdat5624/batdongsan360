import React from 'react';
import { Button, message, Tooltip } from 'antd';
import axiosInstance from '../../api/axiosConfig';
import { CheckCircleOutlined } from '@ant-design/icons';

const MarkAllAsReadButton = ({ onRefresh, disabled }) => {
    const handleMarkAllAsRead = async () => {
        try {
            const response = await axiosInstance.put('/api/notifications/mark-all-as-read');
            if (response.data.statusCode === 200) {
                message.success('Đã đánh dấu tất cả thông báo là đã đọc.');
                onRefresh(); // Làm mới dữ liệu
            } else {
                message.error('Không thể đánh dấu tất cả thông báo là đã đọc.');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            message.error('Không thể đánh dấu tất cả thông báo là đã đọc.');
        }
    };

    return (
        <Tooltip title="Đánh dấu tất cả đã đọc">
            <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAllAsRead}
                disabled={disabled}
                className="flex items-center"
            >

            </Button>
        </Tooltip>
    );
};

export default MarkAllAsReadButton;