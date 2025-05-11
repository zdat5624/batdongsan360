import { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const UpdatePriceModal = ({ open, vipId, onClose, onPriceUpdated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Xử lý cập nhật giá
    const handleUpdatePrice = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/api/admin/vips/${vipId}/price?newPrice=${values.price}`);
            if (response.data.statusCode === 200) {
                message.success('Cập nhật giá gói VIP thành công!');
                onPriceUpdated();
                onClose();
                form.resetFields();
            } else {
                message.error(response.data.message || 'Cập nhật giá thất bại.');
            }
        } catch (err) {
            console.error('Error updating price:', err);
            message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật giá.');
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
            title="Cập nhật giá gói VIP"
            open={open}
            onCancel={handleClose}
            centered
            width={400}
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
                    Lưu
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdatePrice}
                disabled={loading}
            >
                <Form.Item
                    name="price"
                    label="Giá mới mỗi ngày (VND)"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá mới!' },
                        {
                            type: 'number',
                            min: 0,
                            transform: (value) => Number(value),
                            message: 'Giá phải là số không âm!',
                        },
                    ]}
                >
                    <Input type="number" min={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdatePriceModal;