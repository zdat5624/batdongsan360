import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvironmentOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import VipPackages from '../../components/VipPackages';


const { Title, Paragraph } = Typography;

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;

const Home = () => {
    const [salePosts, setSalePosts] = useState([]);
    const [rentPosts, setRentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const cardVariants = {
        hover: { scale: 1.02, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' },
        initial: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
    };

    const fetchPosts = async (type, setPosts) => {
        try {
            const response = await axiosInstance.get('api/posts', {
                params: {
                    type: type,
                    page: 0,
                    size: 4,
                },
            });
            if (response.data.statusCode === 200) {
                setPosts(response.data.data.content);
            }
        } catch (error) {
            console.error(`Error fetching ${type} posts:`, error);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchPosts('SALE', setSalePosts),
            fetchPosts('RENT', setRentPosts),
        ]).finally(() => setLoading(false));
    }, []);

    const formatPrice = (price, type) => {
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(1)} tỷ${type === 'RENT' ? '/tháng' : ''}`;
        } else if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} triệu${type === 'RENT' ? '/tháng' : ''}`;
        }
        return `${price} VNĐ${type === 'RENT' ? '/tháng' : ''}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);

        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours < 24) {
            return `Đăng ${diffHours} giờ trước`;
        }

        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
            return `Đăng ${diffDays} ngày trước`;
        }

        const diffMonths = Math.floor(diffDays / 30);
        return `Đăng ${diffMonths} tháng trước`;
    };

    const locationParts = (post) => {
        const locationParts = [
            post.ward?.name,
            post.district?.name,
            post.province?.name
        ].filter(Boolean).join(', ');

        return locationParts;
    }

    const renderPostCard = (post) => (
        <Col xs={24} sm={12} md={6}>
            <Link to={`/posts/${post.id}`}>
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    transition={{ duration: 0.3 }}
                >
                    <Card
                        className="border-none shadow-md rounded-lg overflow-hidden"
                        cover={
                            <div style={{ position: 'relative' }}>
                                <img
                                    alt={post.title}
                                    src={
                                        post.images && post.images.length > 0
                                            ? `${UPLOADS_URL}/${post.images[0].url}`
                                            : 'https://via.placeholder.com/300x200'
                                    }
                                    className="w-full h-40 object-cover"
                                />
                                {post.vip && post.vip.vipLevel > 0 && (
                                    <Tag
                                        color={post.vip.vipLevel === 1 ? 'gold' : 'red'}
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            zIndex: 10,
                                            border: 'none',
                                        }}
                                    >
                                        {post.vip.name}
                                    </Tag>
                                )}
                            </div>
                        }
                    >
                        <div className="p-0" style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <Paragraph
                                    ellipsis={{ rows: 2 }}
                                    className="text-gray-800 font-semibold text-sm m-0"
                                    style={{ lineHeight: '1.3', marginBottom: '10px' }}
                                >
                                    {post.title}
                                </Paragraph>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <span className="text-red-500 font-bold text-base">
                                        {formatPrice(post.price, post.type)}
                                    </span>
                                    <span className="text-gray-600 text-sm ml-1">
                                        • {post.area} m²
                                    </span>
                                </div>
                                <div className="text-gray-600 text-sm flex items-center" style={{ marginBottom: '8px' }}>
                                    <EnvironmentOutlined className="mr-1 text-gray-500" style={{ fontSize: '12px' }} />
                                    <span style={{ lineHeight: '1.2' }}>
                                        {locationParts(post)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-gray-400 text-xs">
                                {formatDate(post.createdAt)}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </Link>
        </Col>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 pt-5 pb-5" style={{ maxWidth: '1080px' }}>
                <Title level={2} className="text-center mb-12 text-gray-800">
                    Bất động sản 360 - Nơi tin cậy cho mọi giao dịch bất động sản
                </Title>
                <Row gutter={[24, 24]} justify="center" className="mt-8" >
                    <Col xs={24} md={12} >
                        <motion.div
                            variants={cardVariants}
                            initial="initial"
                            whileHover="hover"
                            transition={{ duration: 0.3 }}
                        >
                            <Card
                                className="h-full border-none shadow-md rounded-2xl overflow-hidden"
                                style={{ height: '450px', display: 'flex', flexDirection: 'column' }}
                            >
                                <div className="flex flex-col items-center justify-between h-full p-8 sm:p-2">
                                    <div className="text-center">
                                        <img
                                            src="https://www.zillowstatic.com/s3/homepage/static/Sell_a_home.png"
                                            alt="Sell a home"
                                            className="mx-auto mb-6"
                                            style={{ maxWidth: '180px' }}
                                        />
                                        <Title level={3} className="text-gray-800 mb-4">
                                            Bán nhà
                                        </Title>
                                        <Paragraph className="text-gray-600 leading-relaxed">
                                            Dù bạn chọn con đường nào để bán nhà, chúng tôi sẽ giúp bạn điều hướng để có một giao dịch thành công. Từ việc định giá chính xác, quảng bá bất động sản đến hỗ trợ pháp lý, chúng tôi luôn đồng hành cùng bạn trong từng bước.
                                        </Paragraph>
                                    </div>
                                    <Link to="/sell">
                                        <Button
                                            type="primary"
                                            shape="round"
                                            size="large"
                                            className="mt-4 bg-blue-600 border-blue-600 hover:bg-blue-700"
                                        >
                                            Tìm tin bán
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                    <Col xs={24} md={12}>
                        <motion.div
                            variants={cardVariants}
                            initial="initial"
                            whileHover="hover"
                            transition={{ duration: 0.3 }}
                        >
                            <Card
                                className="h-full border-none shadow-md rounded-2xl overflow-hidden"
                                style={{ height: '450px', display: 'flex', flexDirection: 'column' }}
                            >
                                <div className="flex flex-col items-center justify-between h-full p-8 sm:p-2">
                                    <div className="text-center">
                                        <img
                                            src="https://www.zillowstatic.com/s3/homepage/static/Buy_a_home.png"
                                            alt="Rent a home"
                                            className="mx-auto mb-6"
                                            style={{ maxWidth: '180px' }}
                                        />
                                        <Title level={3} className="text-gray-800 mb-4">
                                            Thuê nhà
                                        </Title>
                                        <Paragraph className="text-gray-600 leading-relaxed">
                                            Chúng tôi mang đến trải nghiệm trực tuyến mượt mà – từ tìm kiếm trên mạng lưới cho thuê lớn nhất, đến nộp hồ sơ và thanh toán tiền thuê. Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn tìm được ngôi nhà ưng ý với chi phí hợp lý và điều kiện thuê tốt nhất.
                                        </Paragraph>
                                    </div>
                                    <Link to="/rent">
                                        <Button
                                            type="primary"
                                            shape="round"
                                            size="large"
                                            className="mt-4 bg-blue-600 border-blue-600 hover:bg-blue-700"
                                        >
                                            Tìm tin thuê
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>

                <div className="mt-16">
                    <div className="flex justify-between items-center mb-6">
                        <Title level={3} className="text-gray-800">
                            Tin bán mới nhất
                        </Title>
                        <Link to="/sell" className="text-blue-600 hover:underline">
                            Tìm nhà đất bán mới nhất
                        </Link>
                    </div>
                    <Row gutter={[16, 16]} style={{ minHeight: '300px' }}>
                        {loading ? (
                            <Col span={24} className="text-center">
                                <Paragraph>Đang tải...</Paragraph>
                            </Col>
                        ) : salePosts.length > 0 ? (
                            salePosts.map((post) => renderPostCard(post))
                        ) : (
                            <Col span={24} className="text-center">
                                <Paragraph>Không có tin bán nào.</Paragraph>
                            </Col>
                        )}
                    </Row>
                </div>

                <div className="mt-16">
                    <div className="flex justify-between items-center mb-6">
                        <Title level={3} className="text-gray-800">
                            Tin cho thuê mới nhất
                        </Title>
                        <Link to="/rent" className="text-blue-600 hover:underline">
                            Tìm nhà đất cho thuê mới nhất
                        </Link>
                    </div>
                    <Row gutter={[16, 16]} style={{ minHeight: '300px' }}>
                        {loading ? (
                            <Col span={24} className="text-center">
                                <Paragraph>Đang tải...</Paragraph>
                            </Col>
                        ) : rentPosts.length > 0 ? (
                            rentPosts.map((post) => renderPostCard(post))
                        ) : (
                            <Col span={24} className="text-center">
                                <Paragraph>Không có tin cho thuê nào.</Paragraph>
                            </Col>
                        )}
                    </Row>
                </div>

                <div className="mt-16">
                    <VipPackages />
                </div>
            </div>
        </div >
    );
};

export default Home;