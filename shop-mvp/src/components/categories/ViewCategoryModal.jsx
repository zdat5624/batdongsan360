import { useState, useEffect } from 'react';
import { Modal, Descriptions, Spin, Button, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const ViewCategoryModal = ({ open, categoryId, onClose }) => {
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    // Gọi API để lấy thông tin chi tiết danh mục
    const fetchCategoryDetails = async () => {
        if (!categoryId) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/categories/${categoryId}`);
            if (response.data.statusCode === 200) {
                setCategory(response.data.data);
            } else {
                message.error(response.data.message || 'Không thể tải thông tin danh mục.');
            }
        } catch (err) {
            console.error('Error fetching category details:', err);
            message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi tải thông tin danh mục.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi modal mở
    useEffect(() => {
        if (open && categoryId) {
            fetchCategoryDetails();
        }
        // Reset dữ liệu khi modal đóng
        if (!open) {
            setCategory(null);
        }
    }, [open, categoryId]);

    // Định dạng loại danh mục
    const formatType = (type) => {
        switch (type) {
            case 'RENT':
                return 'Cho thuê';
            case 'SALE':
                return 'Bán';
            default:
                return type;
        }
    };

    return (
        <Modal
            title="Chi tiết danh mục"
            open={open}
            onCancel={onClose}
            centered
            width={500}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
        >
            {loading ? (
                <Spin tip="Đang tải..." />
            ) : category ? (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Mã">{category.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên">{category.name}</Descriptions.Item>
                    <Descriptions.Item label="Loại">{formatType(category.type)}</Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không có dữ liệu để hiển thị.</p>
            )}
        </Modal>
    );
};

export default ViewCategoryModal;