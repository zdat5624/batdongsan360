import { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const { Option } = Select;

const CreateCategoryModal = ({ open, onClose, onCategoryCreated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Xử lý tạo danh mục
    const handleCreateCategory = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/api/admin/categories', {
                name: values.name,
                type: values.type,
            });
            if (response.data.statusCode === 201) {
                message.success('Tạo danh mục thành công!');
                onCategoryCreated();
                onClose();
                form.resetFields();
            } else {
                message.error(response.data.message || 'Tạo danh mục thất bại.');
            }
        } catch (err) {
            console.error('Error creating category:', err);
            message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi tạo danh mục.');
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
            title="Tạo danh mục mới"
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
                >
                    Tạo
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateCategory}
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
        </Modal>
    );
};

export default CreateCategoryModal;