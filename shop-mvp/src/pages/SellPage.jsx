import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Spin, Badge, Pagination, Input, Button } from 'antd';
import { PictureOutlined, InfoCircleOutlined } from '@ant-design/icons';
import SearchForm from '../components/SearchForm';
import MapComponent from '../components/maps/MapComponent';
import ContactButton from '../components/notifications/ContactButton';
import apiServices from '../services/apiServices';

// Hàm chuyển đổi giá từ số sang chuỗi (triệu VNĐ hoặc tỷ VNĐ)
const formatPrice = (price) => {
    if (price >= 1000000000) {
        return `${(price / 1000000000).toLocaleString('vi-VN')} tỷ`;
    }
    return `${(price / 1000000).toLocaleString('vi-VN')} triệu`;
};

// Hàm tính thời gian đã đăng (phút, giờ, ngày trước)
const getTimeAgo = (createdAt) => {
    if (!createdAt) return 'N/A';
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffInMs = now - postDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInMinutes < 60) {
        return `Đăng ${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        return `Đăng ${diffInHours} giờ trước`;
    } else {
        return `Đăng ${diffInDays} ngày trước`;
    }
};

// CSS tùy chỉnh (giữ nguyên)
const customStyles = `
    .sell-page-container {
        background-color: #f0f8ff;
        min-height: 95vh;
    }
    .content-wrapper {
        display: flex;
        height: calc(100vh - 40px);
        overflow: hidden;
    }
    .left-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .posts-container {
        flex: 1;
        overflow-y: auto;
        padding: 0px 30px;
    }
    .map-container {
        flex: 1;
        position: relative;
    }
    .search-form-wrapper {
        margin-bottom: 0.5rem;
    }
    .hover-card {
        position: relative;
        transition: box-shadow 0.3s ease;
        background-color: #fff;
        border-radius: 12px;
        border: none;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-width: 1000px;
        margin: 0 auto 20px auto;
        min-height: 460px;
    }
    .hover-card:hover {
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
    .card-img-wrapper {
        position: relative;
        width: 100%;
        height: 240px;
        background-color: #f0f0f0;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        gap: 4px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }
    .main-img {
        width: 60%;
        height: 100%;
        object-fit: cover;
        border-top-left-radius: 12px;
    }
    .sub-img-container {
        width: 40%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .sub-img-top {
        width: 100%;
        height: 50%;
        object-fit: cover;
        border-top-right-radius: 12px;
    }
    .sub-img-bottom-wrapper {
        width: 100%;
        height: 50%;
        display: flex;
        flex-direction: row;
        gap: 4px;
    }
    .sub-img-bottom {
        width: 50%;
        height: 100%;
        object-fit: cover;
    }
    .sub-img-bottom:last-child {
        border-bottom-right-radius: 12px;
    }
    .single-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }
    .card-img-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 40%;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12px;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
    }
    .vip-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 0.8rem;
        padding: 4px 8px;
        border-radius: 12px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 1;
    }
    .vip-0 {
        background: linear-gradient(45deg, #007bff, #00b7eb);
    }
    .vip-1 {
        background: linear-gradient(45deg, #ffc107, #ffdb58);
    }
    .vip-2 {
        background: linear-gradient(45deg, #dc3545, #ff5e62);
    }
    .vip-3 {
        background: linear-gradient(45deg, #ff6f61, #ff9f43);
    }
    .vip-4 {
        background: linear-gradient(45deg, #dc3545, #ff5e62);
    }
    .image-count {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 0.8rem;
        padding: 4px 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 1;
    }
    .card-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        min-height: 220px;
        flex-grow: 1;
        overflow: hidden;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        background-color: #fff;
    }
    .card-title-body {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
        max-height: 3.12rem;
        color: #000;
        text-transform: uppercase;
    }
    .card-price {
        font-size: 1.2rem;
        font-weight: 700;
        color: #e74c3c;
        margin: 0;
    }
    .card-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.9rem;
        color: #555;
    }
    .card-info .info-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .card-info span {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .card-info i {
        color: #007bff;
    }
    .card-description {
        font-size: 0.9rem;
        color: #666;
        margin: 0;
        display: flex;
        margin-top: 5px;
        margin-bottom: 5px;
        align-items: flex-start;
        gap: 6px;
    }
    .card-description-icon {
        color: #666;
        flex-shrink: 0;
        font-size: 0.9rem;
        margin-top: 2px;
    }
    .card-description-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }
    .contact-button {
        background-color: #17a2b8;
        border: none;
        border-radius: 20px;
        padding: 6px 16px;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: background-color 0.3s ease;
        color: #fff;
        margin: 0;
    }
    .contact-button:hover {
        background-color: #138496;
    }
    .pagination-input {
        width: 70px;
        display: inline-block;
        margin: 0 5px;
    }
    .go-button {
        margin-left: 5px;
    }
    .post-count {
        font-size: 1rem;
        font-weight: 500;
        color: #555;
        text-align: center;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
    }
    .post-date {
        color: #28a745;
        font-weight: 500;
    }
    .error-message {
        color: #dc3545;
        font-weight: 500;
        text-align: center;
        margin-top: 1rem;
    }
    .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
    }
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }
    .user-details {
        display: flex;
        flex-direction: column;
    }
    .user-name {
        font-size: 0.9rem;
        font-weight: 500;
        color: #333;
    }
    .user-time {
        font-size: 0.8rem;
        color: #666;
    }
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        border-top: 1px solid #e0e0e0;
        padding: 8px 16px;
        background-color: #fff;
    }
    .ant-pagination {
        display: flex;
        gap: 5px;
        justify-content: center;
    }
    .ant-pagination-item {
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }
    .ant-pagination-item a {
        color: #007bff;
    }
    .ant-pagination-item-active {
        background-color: #007bff;
        border-color: #007bff;
    }
    .ant-pagination-item-active a {
        color: #fff;
    }
    .ant-pagination-item:hover {
        background-color: #e9ecef;
    }
    .ant-spin-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 50vh;
    }
    .loading-text {
        margin-top: 12px;
        color: #666;
    }
    .no-posts {
        text-align: center;
        padding: 40px 0;
        color: #666;
    }
    .no-posts-icon {
        margin-right: 8px;
    }

    /* Media Queries cho Responsive */
    @media (max-width: 768px) {
        .content-wrapper {
            flex-direction: column;
            height: auto;
        }
        .left-content {
            flex: none;
            overflow-y: auto;
        }
        .posts-container {
            flex: none;
            max-height: 50vh;
            overflow-y: auto;
            padding: 5px 15px;
        }
        .map-container {
            flex: none;
            height: 50vh;
        }
        .search-form-wrapper {
            margin-bottom: 0.5rem;
        }
        .hover-card {
            flex-direction: column;
            max-width: 100%;
            min-height: 500px;
        }
        .card-img-wrapper {
            width: 100%;
            height: 240px;
            flex-direction: column;
            border-bottom-left-radius: 0;
            border-top-right-radius: 12px;
        }
        .main-img {
            width: 100%;
            height: 66.66%;
            border-top-right-radius: 12px;
            border-bottom-left-radius: 0;
        }
        .sub-img-container {
            width: 100%;
            height: 33.33%;
            display: flex;
            flex-direction: row;
            gap: 4px;
        }
        .sub-img-top {
            width: 33.33%;
            height: 100%;
            border-top-right-radius: 0;
        }
        .sub-img-bottom-wrapper {
            width: 66.66%;
            height: 100%;
            display: flex;
            flex-direction: row;
            gap: 4px;
        }
        .sub-img-bottom {
            width: 50%;
            height: 100%;
        }
        .sub-img-bottom:last-child {
            border-bottom-right-radius: 12px;
        }
        .single-img {
            width: 100%;
            height: 100%;
            border-top-right-radius: 12px;
            border-bottom-left-radius: 0;
        }
        .card-img-overlay {
            right: 0;
        }
        .card-body {
            width: 100%;
            min-height: 260px;
            flex-grow: 1;
            padding: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .card-title-body {
            font-size: 1.1rem;
            line-height: 1.2;
            max-height: 2.64rem;
            flex-grow: 0;
            text-transform: uppercase;
        }
        .card-price {
            font-size: 1.1rem;
        }
        .card-info {
            font-size: 0.85rem;
            gap: 6px;
        }
        .card-description {
            font-size: 0.85rem;
        }
        .card-description-text {
            -webkit-line-clamp: 1;
        }
        .contact-button {
            padding: 8px 20px;
            font-size: 0.85rem;
        }
        .pagination-input {
            width: 60px;
        }
        .go-button {
            margin-top: 5px;
        }
        .post-count {
            font-size: 0.9rem;
        }
        .user-avatar {
            width: 28px;
            height: 28px;
        }
        .user-name {
            font-size: 0.85rem;
        }
        .user-time {
            font-size: 0.75rem;
        }
        .card-footer {
            padding: 12px;
        }
    }

    @media (max-width: 767px) {
        .sell-page-container {
            padding-top: 2px;
        }
        .posts-container {
            padding: 2px 10px;
        }
        .hover-card {
            min-height: 480px;
        }
        .card-img-wrapper {
            height: 220px;
        }
        .main-img {
            height: 66.66%;
        }
        .sub-img-container {
            height: 33.33%;
        }
        .sub-img-top {
            width: 33.33%;
            height: 100%;
        }
        .sub-img-bottom-wrapper {
            width: 66.66%;
            height: 100%;
        }
        .sub-img-bottom {
            width: 50%;
            height: 100%;
        }
        .card-body {
            min-height: 260px;
            flex-grow: 1;
        }
        .card-title-body {
            font-size: 1rem;
            line-height: 1.2;
            max-height: 2.4rem;
            text-transform: uppercase;
        }
        .card-price {
            font-size: 1rem;
        }
        .card-info {
            font-size: 0.8rem;
        }
        .card-description {
            font-size: 0.8rem;
        }
        .card-description-text {
            -webkit-line-clamp: 1;
        }
        .contact-button {
            padding: 6px 16px;
            font-size: 0.8rem;
        }
        .user-avatar {
            width: 24px;
            height: 24px;
        }
        .user-name {
            font-size: 0.8rem;
        }
        .user-time {
            font-size: 0.7rem;
        }
    }

    @media (max-width: 375px) {
        .card-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 12px;
        }
        .user-info {
            margin-left: -6px;
        }
        .contact-button {
            align-self: flex-start;
            margin-left: -6px;
        }
    }
`;

const SellPage = ({ setLoading: setParentLoading }) => {
    const [loading, setLoading] = useState(false);
    const [isShowingLoading, setIsShowingLoading] = useState(false);
    const [allProjects, setAllProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0); // Thêm state để lưu totalElements
    const [pageInput, setPageInput] = useState('');
    const [searchFilters, setSearchFilters] = useState({});
    const [revealedPhones, setRevealedPhones] = useState({});
    const [vipLevels, setVipLevels] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const projectsPerPage = 12; // Khớp với backend pageSize

    // Lấy danh sách gói VIP
    const fetchVipLevels = async () => {
        try {
            const response = await apiServices.get('/api/vips');
            if (response.data.statusCode === 200) {
                const vipData = response.data.data;
                const vipLevelMap = {};
                vipData.forEach((vip) => {
                    vipLevelMap[vip.id] = vip.vipLevel;
                });
                setVipLevels(vipLevelMap);
            } else {
                throw new Error(response.data.message || 'Không thể lấy danh sách gói VIP.');
            }
        } catch (err) {
            setVipLevels({});
        }
    };

    // Lấy danh sách bài đăng
    const fetchPosts = async (page = 0, filters = {}) => {
        try {
            setLoading(true);
            setErrorMessage('');

            const queryParams = new URLSearchParams({
                page,
                size: projectsPerPage,
                type: 'SALE',
                minPrice: filters.minPrice || 0,
                maxPrice: filters.maxPrice || 50000000000000000,
                minArea: filters.minArea || 0,
                maxArea: filters.maxArea || 1000000000,
            });

            if (filters.provinceCode) queryParams.append('provinceCode', filters.provinceCode);
            if (filters.districtCode) queryParams.append('districtCode', filters.districtCode);
            if (filters.wardCode) queryParams.append('wardCode', filters.wardCode);
            if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);

            const response = await apiServices.get(`/api/posts?${queryParams.toString()}`);
            if (response.data.statusCode === 200) {
                const posts = response.data.data.content || [];
                const totalElements = response.data.data.totalElements || 0;
                const totalPages = response.data.data.totalPages || 1;

                const formattedProjects = posts
                    .map((post) => {
                        const price = parseFloat(post.price);
                        if (isNaN(price)) return null;

                        const area = parseFloat(post.area);
                        if (isNaN(area)) return null;

                        const fullPhone = post.user?.phone || '0123456789';
                        const hiddenPhone = fullPhone.slice(0, 4) + '******';

                        let vipLevel = 0;
                        let vipName = 'Không có gói VIP';

                        if (post.vip) {
                            if (post.vip.vipLevel !== undefined) {
                                vipLevel = post.vip.vipLevel;
                                vipName = post.vip.name || `VIP ${vipLevel}`;
                            } else if (post.vip.id && vipLevels[post.vip.id] !== undefined) {
                                vipLevel = vipLevels[post.vip.id];
                                vipName = post.vip.name || `VIP ${vipLevel}`;
                            } else if (post.vip.name) {
                                const vipLevelMatch = post.vip.name.match(/VIP\s*(\d+)/i);
                                vipLevel = vipLevelMatch ? parseInt(vipLevelMatch[1], 10) : 0;
                                vipName = post.vip.name;
                            }
                        }

                        const timeAgo = getTimeAgo(post.createdAt);

                        const imageCount = post.images ? post.images.length : 0;

                        let images =
                            post.images && post.images.length > 0
                                ? post.images.slice(0, 4).map((image) => `http://localhost:8080/uploads/${image.url}`)
                                : [];
                        while (images.length < 4) {
                            images.push('https://placehold.co/300x300');
                        }

                        return {
                            id: post.id,
                            title: post.title || 'Không có tiêu đề',
                            desc: post.description || 'Không có mô tả',
                            images,
                            imageCount,
                            price: formatPrice(price),
                            area: `${area}m²`,
                            location: [
                                post.detailAddress,
                                post.ward?.name,
                                post.district?.name,
                                post.province?.name,
                            ].filter(Boolean).join(", ") || "Không xác định",
                            vipPackage: vipName,
                            vipLevel: vipLevel,
                            categoryId: post.category?.id || null,
                            phone: fullPhone,
                            hiddenPhone: hiddenPhone,
                            timeAgo,
                            userAvatar: post.user?.avatar
                                ? `http://localhost:8080/uploads/${post.user.avatar}`
                                : 'https://placehold.co/32x32',
                            userName: post.user?.name || 'Người dùng ẩn danh',
                        };
                    })
                    .filter((project) => project !== null);

                setAllProjects(formattedProjects);
                setTotalPages(totalPages);
                setTotalElements(totalElements); // Lưu totalElements
            } else {
                throw new Error(response.data.message || 'Không thể lấy danh sách bài đăng.');
            }
        } catch (err) {
            setAllProjects([]);
            setTotalPages(1);
            setTotalElements(0);
            setErrorMessage('Có lỗi xảy ra khi tải danh sách bài đăng. Vui lòng thử lại sau.');
            console.log(">>> err: ", err);
        } finally {
            setLoading(false);
            setIsShowingLoading(false);
        }
    };

    // Khởi tạo dữ liệu khi component mount
    useEffect(() => {
        fetchVipLevels();
        fetchPosts(0, searchFilters);
    }, []);

    // Gọi API khi thay đổi trang hoặc bộ lọc
    useEffect(() => {
        setIsShowingLoading(true);
        fetchPosts(currentPage - 1, searchFilters);
    }, [currentPage, searchFilters]);

    // Xử lý tìm kiếm
    const handleSearch = (searchData) => {
        setSearchFilters(searchData);
        setCurrentPage(1);
        setPageInput('');
        setIsShowingLoading(true);
        fetchPosts(0, searchData);
    };

    // Xử lý hiển thị/ẩn số điện thoại
    const handleTogglePhone = (projectId) => {
        setRevealedPhones((prev) => {
            const isRevealed = !!prev[projectId];
            if (isRevealed) {
                const newState = { ...prev };
                delete newState[projectId];
                return newState;
            } else {
                return {
                    ...prev,
                    [projectId]: allProjects.find((p) => p.id === projectId)?.phone,
                };
            }
        });
    };

    // Xử lý phân trang
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setPageInput('');
        }
    };

    const handlePageInput = () => {
        const pageNumber = parseInt(pageInput, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            handlePageChange(pageNumber);
        } else {
            alert(`Vui lòng nhập số trang hợp lệ từ 1 đến ${totalPages}`);
            setPageInput('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handlePageInput();
        }
    };

    return (
        <div className="sell-page-container">
            <style>{customStyles}</style>
            <div className="content-wrapper">
                <div className="left-content">
                    <div className="posts-container">
                        <div className="search-form-wrapper">
                            <SearchForm onSearch={handleSearch} hideTransactionType={true} projects={allProjects} />
                        </div>
                        <p className="post-count">
                            Tìm thấy <span style={{ color: '#007bff' }}>{totalElements}</span> bài đăng bán bất động sản
                        </p>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        {isShowingLoading ? (
                            <div className="ant-spin-container">
                                <Spin size="large" />
                                <p className="loading-text">Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <div>
                                <div className="project-list">
                                    {allProjects.length > 0 ? (
                                        allProjects.map((project) => (
                                            <div key={project.id} className="hover-card">
                                                <NavLink to={`/post/${project.id}`} style={{ textDecoration: 'none' }} target="_blank"
                                                    rel="noopener noreferrer" >
                                                    <div className="card-img-wrapper">
                                                        {project.images.length > 0 ? (
                                                            <>
                                                                <img src={project.images[0]} alt={project.title} className="main-img" />
                                                                {project.images.length > 1 && (
                                                                    <div className="sub-img-container">
                                                                        <img src={project.images[1]} alt={project.title} className="sub-img-top" />
                                                                        <div className="sub-img-bottom-wrapper">
                                                                            {project.images[2] && (
                                                                                <img src={project.images[2]} alt={project.title} className="sub-img-bottom" />
                                                                            )}
                                                                            {project.images[3] && (
                                                                                <img src={project.images[3]} alt={project.title} className="sub-img-bottom" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <img src="https://placehold.co/300x300" alt={project.title} className="single-img" />
                                                        )}
                                                        <div className="card-img-overlay">
                                                            {project.vipLevel > 0 && (
                                                                <Badge className={`vip-badge vip-${project.vipLevel}`}>
                                                                    {project.vipPackage}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="image-count">
                                                            <PictureOutlined hayvan="true" />
                                                            <span>{project.imageCount}</span>
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        <p className="card-title-body">{project.title}</p>
                                                        <p className="card-price">{project.price}</p>
                                                        <div className="card-info">
                                                            <div className="info-row">
                                                                <span>
                                                                    <i className="bi bi-rulers"></i> {project.area}
                                                                </span>
                                                                <span>
                                                                    <i className="bi bi-geo-alt"></i> {project.location}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="card-description">
                                                            <InfoCircleOutlined className="card-description-icon" />
                                                            <span className="card-description-text">{project.desc}</span>
                                                        </div>
                                                        <div className="card-footer">
                                                            <div className="user-info">
                                                                <img src={project.userAvatar} alt={project.userName} className="user-avatar" />
                                                                <div className="user-details">
                                                                    <span className="user-name">{project.userName}</span>
                                                                    <span className="user-time">{project.timeAgo}</span>
                                                                </div>
                                                            </div>
                                                            <ContactButton
                                                                projectId={project.id}
                                                                revealedPhones={revealedPhones}
                                                                hiddenPhone={project.hiddenPhone}
                                                                fullPhone={project.phone}
                                                                handleTogglePhone={handleTogglePhone}
                                                            />
                                                        </div>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-posts">
                                            <i className="bi bi-exclamation-triangle no-posts-icon"></i>
                                            Không tìm thấy bài đăng nào phù hợp với bộ lọc. Vui lòng thử các tiêu chí khác.
                                        </div>
                                    )}
                                </div>

                                {totalElements > projectsPerPage && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Pagination
                                                current={currentPage}
                                                total={totalElements} // Sử dụng totalElements thay vì totalPages * 10
                                                pageSize={projectsPerPage} // Khớp với backend
                                                onChange={handlePageChange}
                                                showSizeChanger={false}
                                                showLessItems
                                            />
                                            <Input
                                                type="number"
                                                min="1"
                                                max={totalPages}
                                                value={pageInput}
                                                onChange={(e) => setPageInput(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className="pagination-input"
                                                placeholder="Trang"
                                                style={{ width: '70px' }}
                                            />
                                            <Button type="primary" onClick={handlePageInput} className="go-button">
                                                Đi
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="map-container">
                    <MapComponent filters={searchFilters} />
                </div>
            </div>
        </div>
    );
};

export default SellPage;