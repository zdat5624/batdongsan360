import React from 'react';
import { Popconfirm, Button, message, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';

const AdminDeletePostButton = ({ postId, onDeleteSuccess }) => {
    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(`/api/admin/posts/delete/${postId}`);
            if (response.data.statusCode === 200) {
                message.success('Xóa tin đăng thành công!');
                onDeleteSuccess(postId);
            } else {
                message.error('Xóa tin đăng thất bại!');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            message.error('Đã xảy ra lỗi khi xóa tin đăng!');
        }
    };

    return (
        <Tooltip title={'Xóa tin đăng'}>
            <Popconfirm
                title="Xóa vĩnh viễn tin đăng"
                description="Bạn có chắc chắn muốn xóa tin đăng?"
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >

                <Button
                    type="link"
                    icon={<DeleteOutlined />}
                    style={{ color: '#ff4d4f' }}

                />

            </Popconfirm>
        </Tooltip>
    );
};

export default AdminDeletePostButton;