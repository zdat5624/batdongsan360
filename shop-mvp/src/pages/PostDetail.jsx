import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../api/axiosConfig';
import { useParams, NavLink } from "react-router-dom";
import {
    Card,
    Spin,
    Result,
    Typography,
    Space,
    Badge,
    Button,
    Divider,
    Image,
    List,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    MoneyCollectOutlined,
    AreaChartOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    FolderOutlined,
    StarOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import axios from "axios";
import ContactButton from "../components/notifications/ContactButton";
import PropertyMap from "../components/maps/PropertyMap"; // Import PropertyMap

const { Title, Text, Paragraph } = Typography;

const formatPrice = (price, type) => {
    if (price >= 1000000000) {
        return `${(price / 1000000000).toLocaleString("vi-VN")} tỷ${type === "RENT" ? "/tháng" : ""}`;
    }
    return `${(price / 1000000).toLocaleString("vi-VN")} triệu${type === "RENT" ? "/tháng" : ""}`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) return `${diffInYears} năm trước`;
    if (diffInMonths > 0) return `${diffInMonths} tháng trước`;
    if (diffInDays > 0) return `${diffInDays} ngày trước`;
    if (diffInHours > 0) return `${diffInHours} giờ trước`;
    if (diffInMinutes > 0) return `${diffInMinutes} phút trước`;
    return `${diffInSeconds} giây trước`;
};

const formatHiddenPhone = (phone) => {
    if (!phone || phone.length < 10) return "Số điện thoại không hợp lệ";
    return phone.slice(0, 2) + "******" + phone.slice(-2);
};

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [error, setError] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [revealedPhones, setRevealedPhones] = useState({});

    const thumbnailContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const fetchPostDetail = async () => {
        try {
            const response = await axiosInstance.get(`http://localhost:8080/api/posts/${id}`);
            if (response.data.statusCode === 200) {
                const postData = response.data.data;

                const formattedPost = {
                    id: postData.id,
                    title: postData.title || "Không có tiêu đề",
                    description: postData.description || "Không có mô tả",
                    type: postData.type || "Không xác định",
                    price: formatPrice(postData.price || 0, postData.type),
                    area: postData.area ? `${postData.area}m²` : "Không xác định",
                    address: [
                        postData.detailAddress,
                        postData.ward?.name,
                        postData.district?.name,
                        postData.province?.name,
                    ].filter(Boolean).join(", ") || "Không xác định",
                    category: postData.category?.name || "Không xác định",
                    vip: postData.vip?.name || "VIP 4",
                    createdAt: formatDate(postData.createdAt || new Date()),
                    expireDate: formatDate(postData.expireDate || new Date()),
                    seller: postData.user?.name || "Không xác định",
                    contact: postData.user?.phone || "Không có số điện thoại",
                    email: postData.user?.email || "Không có email",
                    avatar: postData.user?.avatar
                        ? `http://localhost:8080/uploads/${postData.user.avatar}`
                        : "https://placehold.co/100x100",
                    joinDate: postData.user?.createdAt
                        ? formatDate(postData.user.createdAt)
                        : "Không xác định",
                    images: postData.images && postData.images.length > 0
                        ? postData.images.map(img => `http://localhost:8080/uploads/${img.url}`)
                        : ["https://placehold.co/600x400"],
                    updatedAt: postData.updatedAt
                        ? formatDate(postData.updatedAt)
                        : "Không xác định",
                    latitude: postData.latitude || null,
                    longitude: postData.longitude || null,
                };

                setPost(formattedPost);
                setLoading(false);
                fetchRelatedPosts(formattedPost.type);
            } else {
                throw new Error(response.data.message || "Không thể lấy chi tiết bài đăng.");
            }
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết bài đăng:", err);
            setError(err.message || "Không thể lấy chi tiết bài đăng. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    const fetchRelatedPosts = async (type) => {
        try {
            setLoadingRelated(true);
            // Chọn ngẫu nhiên giữa page 0 và page 1
            const randomPage = Math.floor(Math.random() * 2); // Tạo số ngẫu nhiên 0 hoặc 1
            const response = await axiosInstance.get(
                `http://localhost:8080/api/posts?page=${randomPage}&size=20&type=${type}`
            );
            if (response.data.statusCode === 200) {
                const posts = response.data.data.content;

                const filteredPosts = posts
                    .filter(post => String(post.id) !== String(id))
                    .slice(0, 11)
                    .map(post => ({
                        id: post.id,
                        title: post.title,
                        price: formatPrice(post.price, post.type),
                        createdAt: post.createdAt || new Date(),
                        image: post.images && post.images.length > 0
                            ? `http://localhost:8080/uploads/${post.images[0].url}`
                            : "https://placehold.co/100x100",
                    }));

                setRelatedPosts(filteredPosts);
            } else {
                throw new Error("Không thể lấy danh sách tin mới đăng.");
            }
        } catch (err) {
            console.error("Lỗi khi lấy danh sách tin mới đăng:", err);
            setRelatedPosts([]);
        } finally {
            setLoadingRelated(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchPostDetail();
    }, [id]);

    const handleTogglePhone = (projectId) => {
        setRevealedPhones(prev => {
            if (prev[projectId]) {
                const newState = { ...prev };
                delete newState[projectId];
                return newState;
            }
            return { ...prev, [projectId]: post.contact };
        });
    };

    const handleThumbnailClick = (index) => {
        setActiveIndex(index);
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    const handleDragStart = (clientX) => {
        if (!thumbnailContainerRef.current) return;
        setIsDragging(true);
        const rect = thumbnailContainerRef.current.getBoundingClientRect();
        const paddingLeft = 4; // Tailwind px-1 = 4px
        setStartX(clientX - rect.left - paddingLeft);
        setScrollLeft(thumbnailContainerRef.current.scrollLeft);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        handleDragStart(e.touches[0].clientX);
    };

    const handleDragMove = (clientX) => {
        if (!isDragging || !thumbnailContainerRef.current) return;
        const rect = thumbnailContainerRef.current.getBoundingClientRect();
        const paddingLeft = 4; // Tailwind px-1 = 4px
        const x = clientX - rect.left - paddingLeft;
        const walk = (x - startX) * 1.2; // Hệ số nhạy
        thumbnailContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseMove = (e) => {
        e.preventDefault();
        handleDragMove(e.clientX);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const preventDefault = (e) => {
                if (isDragging) e.preventDefault();
            };
            container.addEventListener("touchmove", preventDefault, { passive: false });
            return () => container.removeEventListener("touchmove", preventDefault);
        }
    }, [isDragging]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <Spin tip="Đang tải dữ liệu..." size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <Result status="error" title="Lỗi" subTitle={error} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="flex flex-col lg:flex-row gap-2">
                        <div className="flex-1">
                            <div className="bg-white rounded-md shadow-md mb-2">
                                <div className="p-0">
                                    <div className="mb-4 rounded-md overflow-hidden">
                                        <Image.PreviewGroup>
                                            <div className="relative mx-auto">
                                                <div
                                                    className="flex justify-center items-center"
                                                    style={{
                                                        padding: "0",
                                                        background: "radial-gradient(circle, rgb(147, 143, 143) 0%, rgb(55, 54, 54) 100%)",
                                                    }}
                                                >
                                                    <Image
                                                        src={post.images[activeIndex]}
                                                        alt={`Ảnh ${activeIndex + 1}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "320px",
                                                            objectFit: "cover",
                                                        }}
                                                        preview={{
                                                            visible: showImageModal,
                                                            onVisibleChange: (visible) => setShowImageModal(visible),
                                                        }}
                                                    />
                                                </div>
                                                <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
                                                    <Button
                                                        shape="circle"
                                                        icon={<LeftOutlined />}
                                                        size="small"
                                                        onClick={() =>
                                                            handleThumbnailClick(
                                                                activeIndex > 0 ? activeIndex - 1 : post.images.length - 1
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                                                    <Button
                                                        shape="circle"
                                                        icon={<RightOutlined />}
                                                        size="small"
                                                        onClick={() =>
                                                            handleThumbnailClick(
                                                                activeIndex < post.images.length - 1 ? activeIndex + 1 : 0
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-2 rounded-full text-sm">
                                                    {activeIndex + 1}/{post.images.length}
                                                </div>
                                            </div>

                                            {post.images.length > 1 && (
                                                <div
                                                    className="mt-2 overflow-x-auto cursor-grab select-none px-1"
                                                    style={{
                                                        WebkitOverflowScrolling: "touch",
                                                        scrollbarWidth: "none",
                                                        msOverflowStyle: "none",
                                                    }}
                                                    ref={thumbnailContainerRef}
                                                    onMouseDown={handleMouseDown}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseUp={handleDragEnd}
                                                    onMouseLeave={handleDragEnd}
                                                    onTouchStart={handleTouchStart}
                                                    onTouchMove={handleTouchMove}
                                                    onTouchEnd={handleDragEnd}
                                                >
                                                    <div className="flex space-x-2 justify-start">
                                                        {post.images.map((img, index) => (
                                                            <div key={index} className="flex-shrink-0">
                                                                <Image
                                                                    src={img}
                                                                    alt={`Ảnh thu nhỏ ${index + 1}`}
                                                                    style={{
                                                                        width: "60px",
                                                                        height: "60px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "4px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    className={`transition-all ${activeIndex === index
                                                                        ? "border-blue-500 border-2 shadow-md"
                                                                        : "border-gray-200 opacity-60 hover:opacity-80"
                                                                        }`}
                                                                    preview={false}
                                                                    onClick={() => handleThumbnailClick(index)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <style>
                                                {`
                                                    div[ref="thumbnailContainerRef"]::-webkit-scrollbar {
                                                        display: none;
                                                    }
                                                `}
                                            </style>
                                        </Image.PreviewGroup>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-md shadow-md">
                                <div className="px-4 pt-2 pb-4">
                                    <div className="mb-4">
                                        <Title
                                            level={4}
                                            className="text-blue-600 font-semibold uppercase"
                                        >
                                            {post.title}
                                        </Title>

                                        <Space direction="vertical" size="middle" className="w-full">
                                            <div className="flex items-center">
                                                <MoneyCollectOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Giá: </Text>
                                                <Badge
                                                    count={post.price}
                                                    className="ml-2 font-semibold"
                                                    style={{
                                                        backgroundColor: "#1890ff",
                                                        padding: "0 8px",
                                                        borderRadius: "5px",
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <AreaChartOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Diện tích: </Text>
                                                <Text className="ml-2">{post.area}</Text>
                                            </div>
                                            <div className="flex items-center">
                                                <EnvironmentOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Vị trí: </Text>
                                                <Text className="ml-2">{post.address}</Text>
                                            </div>
                                            <div className="flex items-center">
                                                <HomeOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Loại bài đăng: </Text>
                                                <Text className="ml-2">{post.type === "SALE" ? "Bán" : "Cho thuê"}</Text>
                                            </div>
                                            <div className="flex items-center">
                                                <FolderOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Danh mục: </Text>
                                                <Text className="ml-2">{post.category}</Text>
                                            </div>
                                            <div className="flex items-center">
                                                <StarOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Gói VIP: </Text>
                                                <div className="flex items-center ml-2">
                                                    <StarOutlined className="text-yellow-500 mr-1" />
                                                    <Text>{post.vip}</Text>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <CalendarOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Ngày đăng: </Text>
                                                <Text className="ml-2">{post.createdAt}</Text>
                                            </div>
                                            <div className="flex items-center">
                                                <ClockCircleOutlined className="text-blue-500 mr-3 text-lg" />
                                                <Text strong>Ngày hết hạn: </Text>
                                                <Text className="ml-2">{post.expireDate}</Text>
                                            </div>
                                        </Space>
                                    </div>

                                    <Divider className="my-4" />

                                    <div>
                                        <Title level={4} className="text-blue-600 mb-4 font-semibold">
                                            Thông tin mô tả
                                        </Title>
                                        <div className="flex flex-col">
                                            <Paragraph
                                                className="mt-2 whitespace-pre-wrap mb-0"
                                                ellipsis={
                                                    !isDescriptionExpanded && {
                                                        rows: 10,
                                                        expandable: false,
                                                    }
                                                }
                                            >
                                                {post.description}
                                            </Paragraph>
                                            <div className="flex justify-end">
                                                <Button
                                                    type="link"
                                                    onClick={toggleDescription}
                                                    className="p-0 mt-0"
                                                >
                                                    {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thêm PropertyMap vào box bên trái, dưới Thông tin mô tả */}
                                    <Divider className="my-4" />
                                    <div>
                                        <Title level={4} className="text-blue-600 mb-4 font-semibold">
                                            Bản đồ vị trí
                                        </Title>
                                        <PropertyMap
                                            latitude={post.latitude}
                                            longitude={post.longitude}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-64">
                            <div className="bg-white rounded-md shadow-md mb-2">
                                <div className="p-4">
                                    <Space direction="vertical" size="middle" className="w-full">
                                        <div className="flex justify-center">
                                            <Image
                                                src={post.avatar}
                                                alt="Avatar người dùng"
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    objectFit: "cover",
                                                    borderRadius: "50%",
                                                }}
                                                preview={false}
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <Text>{post.seller}</Text>
                                        </div>
                                        <div className="flex justify-center">
                                            <ContactButton
                                                projectId={post.id}
                                                revealedPhones={revealedPhones}
                                                hiddenPhone={formatHiddenPhone(post.contact)}
                                                fullPhone={post.contact}
                                                handleTogglePhone={handleTogglePhone}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <MailOutlined className="text-blue-500 mr-2 text-base" />
                                            <Text strong>Email: </Text>
                                            <a href={`mailto:${post.email}`} className="ml-2 text-blue-500 hover:underline">
                                                {post.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarOutlined className="text-blue-500 mr-2 text-base" />
                                            <Text strong>Tham gia từ: </Text>
                                            <Text className="ml-2">{post.joinDate}</Text>
                                        </div>
                                    </Space>
                                </div>
                            </div>

                            <div className="bg-white rounded-md shadow-md">
                                <div className="p-4">
                                    <Title level={4} className="text-blue-600 mb-4 font-semibold">
                                        Tin mới đăng
                                    </Title>
                                    {loadingRelated ? (
                                        <div className="flex justify-center items-center">
                                            <Spin tip="Đang tải..." />
                                        </div>
                                    ) : relatedPosts.length > 0 ? (
                                        <List
                                            dataSource={relatedPosts}
                                            renderItem={(item) => (
                                                <List.Item className="p-0 border-b">
                                                    <div className="flex items-center space-x-3"> {/* Thay items-start thành items-center */}
                                                        <div className="flex-shrink-0">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.title}
                                                                style={{
                                                                    width: "60px",
                                                                    height: "65px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "4px",
                                                                }}
                                                                preview={false}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <NavLink
                                                                to={`/post/${item.id}`}
                                                                className="text-blue-500 hover:underline font-semibold block"
                                                                style={{
                                                                    fontSize: "14px",
                                                                    display: "-webkit-box",
                                                                    WebkitBoxOrient: "vertical",
                                                                    WebkitLineClamp: 2,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    wordBreak: "break-all",
                                                                }}
                                                            >
                                                                {item.title}
                                                            </NavLink>
                                                            <div className="text-gray-500 text-sm">
                                                                <span className="text-gray-600 font-medium">{item.price}</span>
                                                            </div>
                                                            <div className="text-gray-500 text-sm">
                                                                {formatTimeAgo(item.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Text className="text-gray-500">Không có bài đăng mới nào phù hợp.</Text>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PostDetail;