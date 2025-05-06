import React from 'react';
import { Button, message, Tooltip } from 'antd';
import axiosInstance from '../../api/axiosConfig';
import { CheckCircleOutlined } from '@ant-design/icons';

const MarkAsReadButton = ({ selectedIds, onMarkAsRead, onRefresh, disabled }) => {
    const handleMarkAsRead = async () => {
        if (!selectedIds || selectedIds.length === 0) {
            message.warning('Vui lòng chọn ít nhất một thông báo.');
            return;
        }

        try {
            const response = await axiosInstance.put('/api/notifications/mark-as-read', selectedIds);
            if (response.data.statusCode === 200) {
                message.success(`Đã đánh dấu thông báo đã chọn là đã đọc.`);
                onMarkAsRead(selectedIds); // Cập nhật state giao diện
                onRefresh(); // Làm mới dữ liệu
            } else {
                message.error('Không thể đánh dấu thông báo là đã đọc.');
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            message.error('Không thể đánh dấu thông báo là đã đọc.');
        }
    };

    // Chỉ hiển thị nút nếu có thông báo được chọn
    if (!selectedIds || selectedIds.length === 0) {
        return null;
    }

    return (
        <Tooltip title="Đánh dấu đã đọc">
            <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsRead}
                disabled={disabled}
            />
        </Tooltip>
    );
};

export default MarkAsReadButton;