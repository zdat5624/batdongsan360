import React, { useState, useEffect, useRef } from 'react';
import { Modal, Typography, Descriptions, Tag, Button, Image } from 'antd';
import moment from 'moment';
import 'moment/locale/vi';
import { formatPrice } from '../../utils';
import PropertyMap from '../maps/PropertyMap';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

moment.locale('vi');

const { Title, Paragraph } = Typography;

const PostDetailModal = ({ visible, onCancel, post }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const thumbnailContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const preventDefault = (e) => {
                if (isDragging) e.preventDefault();
            };
            container.addEventListener('touchmove', preventDefault, { passive: false });
            return () => container.removeEventListener('touchmove', preventDefault);
        }
    }, [isDragging]);

    if (!post) return null;

    const {
        id,
        title,
        description,
        type,
        price,
        area,
        view,
        status,
        createdAt,
        expireDate,
        address,
        category,
        vipLevel,
        images,
        latitude,
        longitude,
    } = post;

    // Xử lý URL ảnh để thêm tiền tố
    const formattedImages = images && images.length > 0
        ? images.map(image => ({
            ...image,
            url: `http://localhost:8080/uploads/${image.url}`
        }))
        : [{ id: 'placeholder', url: 'https://placehold.co/600x400' }];

    const getStatusTag = (status) => {
        let color, text;
        switch (status) {
            case 'PENDING':
                color = 'yellow';
                text = 'Chờ duyệt';
                break;
            case 'REVIEW_LATER':
                color = 'orange';
                text = 'Duyệt lại sau';
                break;
            case 'APPROVED':
                color = 'green';
                text = 'Đang hiển thị';
                break;
            case 'REJECTED':
                color = 'red';
                text = 'Từ chối';
                break;
            case 'EXPIRED':
                color = 'gray';
                text = 'Hết hạn';
                break;
            default:
                color = 'blue';
                text = 'Không xác định';
        }
        return <Tag color={color}>{text}</Tag>;
    };

    const getVipTag = (vipLevel) => {
        let color, text;
        if (vipLevel === 0) {
            color = 'gray';
            text = 'VIP 0';
        } else if (vipLevel === 1) {
            color = 'gold';
            text = `VIP ${vipLevel}`;
        } else if (vipLevel === 2) {
            color = 'red';
            text = `VIP ${vipLevel}`;
        }
        return <Tag color={color}>{text}</Tag>;
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    const handleThumbnailClick = (index) => {
        setActiveIndex(index);
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

    return (
        <Modal
            title={<Title level={4}>Chi tiết tin đăng - Mã tin: {id}</Title>}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Đóng
                </Button>,
            ]}
            width={800}
            style={{ top: 5 }}
        >
            <div>
                <Image.PreviewGroup>
                    <div className="relative mx-auto">
                        <div
                            className="flex justify-center items-center"
                            style={{
                                padding: '0',
                                background: 'radial-gradient(circle, rgb(147, 143, 143) 0%, rgb(55, 54, 54) 100%)',
                            }}
                        >
                            <Image
                                src={formattedImages[activeIndex].url}
                                alt={`Ảnh ${activeIndex + 1}`}
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    objectFit: 'cover',
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
                                        activeIndex > 0 ? activeIndex - 1 : formattedImages.length - 1
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
                                        activeIndex < formattedImages.length - 1 ? activeIndex + 1 : 0
                                    )
                                }
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-2 rounded-full text-sm">
                            {activeIndex + 1}/{formattedImages.length}
                        </div>
                    </div>

                    {formattedImages.length > 1 && (
                        <div
                            className="mt-2 overflow-x-auto cursor-grab select-none px-1"
                            style={{
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
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
                                {formattedImages.map((img, index) => (
                                    <div key={img.id} className="flex-shrink-0">
                                        <Image
                                            src={img.url}
                                            alt={`Ảnh thu nhỏ ${index + 1}`}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                            className={`transition-all ${activeIndex === index
                                                ? 'border-blue-500 border-2 shadow-md'
                                                : 'border-gray-200 opacity-60 hover:opacity-80'
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

                <Descriptions bordered column={1} style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Tiêu đề">
                        {title}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thông tin mô tả">
                        <div>
                            <Paragraph
                                ellipsis={
                                    !isDescriptionExpanded && {
                                        rows: 5,
                                        expandable: false,
                                    }
                                }
                                style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}
                            >
                                {description}
                            </Paragraph>
                            <Button
                                type="link"
                                onClick={toggleDescription}
                                style={{ padding: 0 }}
                            >
                                {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </Button>
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại tin">
                        {type === 'SALE' ? 'Bán' : 'Cho thuê'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Danh mục">{category}</Descriptions.Item>
                    <Descriptions.Item label="Giá">
                        {formatPrice(price)}
                        {type === 'RENT' && ' /tháng'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Diện tích">{area} m²</Descriptions.Item>
                    <Descriptions.Item label="Lượt xem">{view}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">{getStatusTag(status)}</Descriptions.Item>
                    <Descriptions.Item label="VIP">{getVipTag(vipLevel)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {moment(createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày hết hạn">
                        {moment(expireDate).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{address}</Descriptions.Item>

                </Descriptions>

                {(latitude && longitude) && (
                    <div style={{ marginTop: 16 }}>
                        <Title level={5}>Vị trí bất động sản</Title>
                        <PropertyMap latitude={latitude} longitude={longitude} />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PostDetailModal;