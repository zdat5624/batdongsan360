import { useState } from 'react';
import { Typography, Form, Input, Button, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const { Title } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/auth/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            if (response.data.statusCode === 200) {
                message.success(response.data.message);
                form.resetFields(); // Xóa dữ liệu form sau khi đổi mật khẩu thành công
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen max-w-md">
            <div className=" ">
                <Title level={2}>Đổi mật khẩu</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ currentPassword: '', newPassword: '', confirmNewPassword: '' }}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmNewPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                </Form>
            </div>

        </div>
    );
};

export default ChangePassword;