import { Typography, Form, Input, Button, message, Card, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig.js';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Cấu hình message của Ant Design
    useEffect(() => {
        message.config({
            top: 20,
            duration: 1,
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

                // Gọi hàm login từ AuthContext để cập nhật trạng thái
                login(user, accessToken);

                message.success('Đăng nhập thành công!', 1, () => {
                    if (user.role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                });
            } else {
                message.error('Đăng nhập thất bại. Sai tên đăng nhập hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý quay lại trang trước
    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
            {/* Nút Quay lại ở góc trên bên trái */}
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 p-0"
            >
                Quay lại
            </Button>

            <Card className="w-full max-w-md shadow-lg" bordered={true}>
                <Space direction="vertical" className="w-full p-8">
                    <Title level={2} className="text-center text-2xl font-bold text-gray-800">
                        Đăng Nhập
                    </Title>
                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        wrapperCol={{ span: 24 }}
                        disabled={loading} // Vô hiệu hóa form khi loading
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
                        <div className="flex justify-between text-blue-500">
                            <Link to="/register" className="hover:underline">
                                Đăng ký tài khoản
                            </Link>
                            <Link to="/forgot-password" className="hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </Form>
                </Space>
            </Card>
        </div>
    );
};

export default Login;