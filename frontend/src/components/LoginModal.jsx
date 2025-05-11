import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Space, Typography } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosConfig';

const { Title } = Typography;

const LoginModal = ({ visible, onCancel, onSuccess }) => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Cấu hình message của Ant Design
    useEffect(() => {
        message.config({
            top: 20,
            duration: 3, // Tăng thời gian hiển thị lên 3 giây
            maxCount: 3,
            zIndex: 9999,
        });
    }, []);

    const onFinish = async (values) => {
        if (loading) return; // Ngăn gửi lại nếu đang loading
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                username: values.email,
                password: values.password,
            });

            if (response.data.statusCode === 200) {
                const { accessToken, user } = response.data.data;
                login(user, accessToken);
                message.success('Đăng nhập thành công! Chào mừng bạn!');
                form.resetFields();
                onSuccess(); // Gọi callback khi đăng nhập thành công
            } else {
                form.setFields([
                    {
                        name: 'password',
                        errors: ['Sai email hoặc mật khẩu!'],
                    },
                ]);
                message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
            }
        } catch (error) {
            form.setFields([
                {
                    name: 'password',
                    errors: [error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!'],
                },
            ]);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <Title level={2} className="text-center text-2xl font-bold text-gray-800">
                    Đăng Nhập
                </Title>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
        >
            <Space direction="vertical" className="w-full p-8">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    wrapperCol={{ span: 24 }}
                    disabled={loading} // Vô hiệu hóa toàn bộ form khi loading
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input placeholder="Nhập email" size="large" disabled={loading} />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" size="large" disabled={loading} />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            block
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                            size="large"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    );
};

export default LoginModal;