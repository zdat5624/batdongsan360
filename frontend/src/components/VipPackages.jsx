import React, { useState } from 'react';
import { Card, Button, Tag, Typography, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

const { Title, Text } = Typography;

const vipPackages = [
    {
        name: 'VIP 0',
        price: 'Miễn phí',
        features: [
            { text: 'Hiển thị ngay không chờ duyệt', available: false },
            { text: 'Hiển thị nổi bật', available: false },
            { text: 'Thông báo xem tin', available: false },
            { text: 'Thông báo xem số điện thoại', available: false },
        ],
        color: 'gray',
        buttonText: 'Miễn phí',
    },
    {
        name: 'VIP 1',
        price: '2.000đ/ngày',
        features: [
            { text: 'Hiển thị ngay không chờ duyệt', available: true },
            { text: 'Hiển thị nổi bật', available: true },
            { text: 'Thông báo xem tin', available: true },
            { text: 'Thông báo xem số điện thoại', available: true },
        ],
        color: 'gold',
        buttonText: 'Nâng cấp VIP 1',
    },
    {
        name: 'VIP 2',
        price: '4.000đ/ngày',
        features: [
            { text: 'Hiển thị ngay không chờ duyệt', available: true },
            { text: 'Hiển thị nổi bật & ưu tiên nhất', available: true },
            { text: 'Thông báo xem tin', available: true },
            { text: 'Thông báo xem số điện thoại', available: true },
        ],
        color: 'red',
        buttonText: 'Nâng cấp VIP 2',
    },
];

const VipPackages = () => {
    const { isAuthenticated } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSuccess = () => {
        setIsModalVisible(false);
        // Navigation to /create-post is handled by Link after login
    };

    const handleButtonClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault(); // Prevent Link navigation
            showModal();
            return;
        }
        // If authenticated, Link will navigate to /create-post
    };

    return (
        // className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        <div >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
            >
                <Title level={2} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                    Chọn Gói VIP Phù Hợp Với Bạn
                </Title>
                <Text className="text-gray-600 text-sm sm:text-base">
                    Lựa chọn gói VIP cho tin đăng của bạn để nhận nhiều lợi ích hơn và tiếp cận khách hàng dễ dàng!
                </Text>
            </motion.div>
            <Row gutter={[16, 16]} justify="center">
                {vipPackages.map((pkg, index) => (
                    <Col xs={24} sm={12} md={8} key={pkg.name}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            <Card
                                title={
                                    <div className="flex items-center justify-between">
                                        <Tag color={pkg.color} className="text-base sm:text-lg font-semibold">
                                            {pkg.name}
                                        </Tag>
                                        <Tag color={pkg.color} className="text-sm sm:text-base">
                                            {pkg.price}
                                        </Tag>
                                    </div>
                                }
                                className="shadow-lg hover:shadow-xl transition-shadow rounded-lg border border-gray-200"
                                headStyle={{
                                    background: pkg.color === 'gray' ? '#f5f5f5' : pkg.color === 'gold' ? '#fff7e6' : '#ffe6e6',
                                    borderBottom: '1px solid #e8e8e8',
                                }}
                            >
                                <ul className="mb-4">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex items-center mb-3">
                                            {feature.available ? (
                                                <CheckCircleOutlined
                                                    className="mr-3 text-lg text-green-500"
                                                />
                                            ) : (
                                                <CloseCircleOutlined
                                                    className="mr-3 text-lg text-red-500"
                                                />
                                            )}
                                            <span className="text-gray-700 text-sm sm:text-base">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/create-post" onClick={handleButtonClick}>
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        className="mt-2"
                                        style={{
                                            backgroundColor: pkg.color === 'gray' ? '#d9d9d9' : pkg.color === 'gold' ? '#d4a017' : '#f5222d',
                                            borderColor: pkg.color === 'gray' ? '#d9d9d9' : pkg.color === 'gold' ? '#d4a017' : '#f5222d',
                                        }}
                                    >
                                        Đăng Tin Ngay!
                                    </Button>
                                </Link>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>
            <LoginModal
                visible={isModalVisible}
                onCancel={handleCancel}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default VipPackages;