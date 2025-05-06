import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const DepositModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/payment/create', {
                amount: values.amount,
            });
            if (response.data.statusCode === 201) {
                const { paymentLink } = response.data.data;
                window.location.href = paymentLink; // Chuyển hướng đến link thanh toán VNPAY
            } else {
                message.error('Tạo link thanh toán thất bại!');
            }
        } catch (error) {
            console.error('Error creating payment link:', error);
            message.error('Đã có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleFinishFailed = ({ errorFields }) => {
        // Hiển thị thông báo lỗi đầu tiên từ các trường không hợp lệ
        if (errorFields && errorFields.length > 0) {
            message.error(errorFields[0].errors[0]);
        }
    };

    return (
        <Modal
            title="Nạp tiền qua VNPAY"
            open={visible}
            onCancel={onCancel}
            footer={null}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onFinishFailed={handleFinishFailed}
            >
                <Form.Item
                    label="Số tiền (VND)"
                    name="amount"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số tiền!' },
                        {
                            type: 'integer',
                            message: 'Số tiền phải là số nguyên!',
                        },
                        {
                            validator: (_, value) =>
                                value && value >= 50000
                                    ? Promise.resolve()
                                    : Promise.reject('Số tiền phải lớn hơn hoặc bằng 50,000 VND!'),
                        },
                    ]}
                >
                    <InputNumber
                        min={50000}
                        step={1000}
                        style={{ width: '100%' }}
                        placeholder="Nhập số tiền (tối thiểu 50,000)"
                        formatter={(value) =>
                            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                        }
                        parser={(value) => value.replace(/\D/g, '')} // Loại bỏ mọi ký tự không phải số
                        onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (charCode < 48 || charCode > 57) {
                                e.preventDefault();
                            }
                        }}
                    />

                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                        block
                    >
                        Tiếp tục thanh toán
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DepositModal;