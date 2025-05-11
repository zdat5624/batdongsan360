import React from 'react';
import { Button, message, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';

const DeleteSelectedNotificationsButton = ({ selectedIds, onDelete, onRefresh, disabled }) => {
    const handleDelete = async () => {
        if (!selectedIds || selectedIds.length === 0) {
            message.warning('Vui lòng chọn ít nhất một thông báo để xóa.');
            return;
        }

        try {
            const response = await axiosInstance.delete('/api/notifications', {
                data: selectedIds,
            });
            if (response.data.statusCode === 200) {
                message.success(`Đã xóa ${response.data.data} thông báo.`);
                onDelete(selectedIds); // Cập nhật state giao diện
                onRefresh(); // Làm mới dữ liệu
            } else {
                message.error('Không thể xóa thông báo.');
            }
        } catch (error) {
            console.error('Error deleting notifications:', error);
            message.error('Không thể xóa thông báo.');
        }
    };

    // Chỉ hiển thị nút nếu có thông báo được chọn
    if (!selectedIds || selectedIds.length === 0) {
        return null;
    }

    return (
        <Tooltip title="Xóa thông báo"

            getPopupContainer={(triggerNode) => triggerNode.parentNode}
        >
            <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                disabled={disabled}
                style={{ boxSizing: 'border-box' }}
            />
        </Tooltip>
    );
};

export default DeleteSelectedNotificationsButton;