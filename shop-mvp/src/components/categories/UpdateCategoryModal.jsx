import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const { Option } = Select;

const UpdateCategoryModal = ({ open, categoryId, onClose, onCategoryUpdated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [category, setCategory] = useState(null);

    // Gọi API để lấy thông tin chi tiết danh mục
    const fetchCategoryDetails = async () => {
        if (!categoryId) return;

        setFetching(true);
        try {
            const response = await axiosInstance.get(`/api/categories/${categoryId}`);
            if (response.data.statusCode === 200) {
                setCategory(response.data.data);
                form.setFieldsValue({
                    name: response.data.data.name,
                    type: response.data.data.type,
                });
            } else {
                message.error('Không thể tải thông tin danh mục.');
            }
        } catch (err) {
            console.error('Error fetching category details:', err);
            message.error('Đã xảy ra lỗi khi tải thông tin danh mục.');
        } finally {
            setFetching(false);
        }
    };

    // Gọi API khi modal mở
    useEffect(() => {
        if (open && categoryId) {
            fetchCategoryDetails();
        }
        // Reset form khi modal đóng
        if (!open) {
            setCategory(null);
            form.resetFields();
        }
    }, [open, categoryId, form]);

    // Xử lý cập nhật danh mục
    const handleUpdateCategory = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.put('/api/admin/categories', {
                id: categoryId,
                name: values.name,
                type: values.type,
            });
            if (response.data.statusCode === 200) {
                message.success('Cập nhật danh mục thành công!');
                onCategoryUpdated();
                onClose();
                form.resetFields();
            } else {
                message.error(response.data.message || 'Cập nhật danh mục thất bại.');
            }
        } catch (err) {
            console.error('Error updating category:', err);
            message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật danh mục.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form khi đóng Modal
    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Cập nhật danh mục"
            open={open}
            onCancel={handleClose}
            centered
            width={500}
            bodyStyle={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 0 }}
            footer={[
                <Button key="cancel" onClick={handleClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()}
                    disabled={fetching}
                >
                    Lưu
                </Button>,
            ]}
        >
            {fetching ? (
                <Spin tip="Đang tải..." />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateCategory}
                    disabled={loading}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Loại danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn loại danh mục!' }]}
                    >
                        <Select>
                            <Option value="RENT">Cho thuê</Option>
                            <Option value="SALE">Bán</Option>
                        </Select>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default UpdateCategoryModal;