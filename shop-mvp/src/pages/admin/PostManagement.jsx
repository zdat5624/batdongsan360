import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Table, Space, Tooltip, Button, Tag } from 'antd';
import { FileTextOutlined, EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import moment from 'moment';
import 'moment/locale/vi';
import { formatPrice } from '../../utils';
import PostDetailModal from '../../components/posts/PostDetailModal';
import PostFilterModal from '../../components/posts/PostFilterModal';
import AdminDeletePostButton from '../../components/posts/AdminDeletePostButton';
import PostDetailModalWithUser from '../../components/posts/PostDetailModalWithUser';

moment.locale('vi');

const { Title } = Typography;
const { TabPane } = Tabs;

const PostManagement = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState(null);
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const [minArea, setMinArea] = useState(null);
    const [maxArea, setMaxArea] = useState(null);
    const [categoryId, setCategoryId] = useState(null);
    const [email, setEmail] = useState(null);
    const [vipId, setVipId] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: [6, 12, 24],
    });
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const fetchPosts = async (
        tab = 'ALL',
        type = null,
        minPrice = null,
        maxPrice = null,
        minArea = null,
        maxArea = null,
        categoryId = null,
        vipId = null,
        email = null,
        page = 1,
        pageSize = 6,
        sortField = 'createdAt',
        sortOrder = 'asc'
    ) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1,
                size: pageSize,
                sort: `${sortField === 'vipLevel' ? 'vip.vipLevel' : sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`,
                isDeleteByUser: false,
            };
            if (tab !== 'ALL') {
                params.status = tab;
            }
            if (type) {
                params.type = type;
            }
            if (minPrice) {
                params.minPrice = minPrice;
            }
            if (maxPrice) {
                params.maxPrice = maxPrice;
            }
            if (minArea) {
                params.minArea = minArea;
            }
            if (maxArea) {
                params.maxArea = maxArea;
            }
            if (categoryId) {
                params.categoryId = categoryId;
            }
            if (vipId) {
                params.vipId = vipId;
            }
            if (email) {
                params.email = email;
            }

            const response = await axiosInstance.get('/api/admin/posts', { params });
            const { content, totalElements } = response.data.data;
            setPosts(
                content.map((item) => ({
                    key: item.id,
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    status: item.status,
                    price: item.price,
                    area: item.area,
                    view: item.view,
                    createdAt: item.createdAt,
                    expireDate: item.expireDate,
                    address: `${item.detailAddress}, ${item.ward.name}, ${item.district.name}, ${item.province.name}`,
                    category: item.category.name,
                    vipLevel: item.vip ? item.vip.vipLevel : 0,
                    description: item.description,
                    images: item.images,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    userEmail: item.user.email,
                }))
            );
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: totalElements,
            }));
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(
            activeTab,
            typeFilter,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            categoryId,
            vipId,
            email,
            pagination.current,
            pagination.pageSize
        );
    }, [activeTab, typeFilter, minPrice, maxPrice, minArea, maxArea, categoryId, vipId, email, pagination.current, pagination.pageSize]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (pagination, filters, sorter) => {
        const { field, order } = sorter;
        fetchPosts(
            activeTab,
            typeFilter,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            categoryId,
            vipId,
            email,
            pagination.current,
            pagination.pageSize,
            field || 'createdAt',
            order || 'ascend'
        );
    };

    const handleDeleteSuccess = (postId) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        setPagination((prev) => ({
            ...prev,
            total: prev.total - 1,
        }));
    };

    const handleViewDetail = (post) => {
        setSelectedPost(post);
        setModalVisible(true);
    };

    const columns = [
        {
            title: 'Mã tin',
            dataIndex: 'id',
            sorter: true,
            render: (id) => (
                <Link
                    to={`/post/${id}`}
                    target="_blank"
                    className="text-blue-500 hover:text-blue-700"
                >
                    {id}
                </Link>
            ),
        },
        {
            title: 'VIP',
            dataIndex: 'vipLevel',
            sorter: true,
            render: (vipLevel) => {
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
                return (
                    <Tag color={color} className="font-semibold">
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            sorter: true,
            render: (price, record) => {
                const formattedPrice = formatPrice(price);
                return record.type === 'RENT' ? `${formattedPrice}/tháng` : formattedPrice;
            },
        },
        {
            title: 'Diện tích',
            dataIndex: 'area',
            sorter: true,
            render: (area) => `${area} m²`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (status) => {
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
                return <span className={`text-${color}-600 font-semibold`}>{text}</span>;
            },
        },
        {
            title: 'Lượt xem',
            dataIndex: 'view',
            sorter: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            sorter: true,
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            className="text-blue-500"
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    <Link to={`/edit-post/${record.id}`}>
                        <Tooltip title="Chỉnh sửa tin đăng">
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                className="text-blue-500"
                            />
                        </Tooltip>
                    </Link>
                    <AdminDeletePostButton postId={record.id} onDeleteSuccess={handleDeleteSuccess} />
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Title level={2} className="m-0 text-gray-800 flex items-center text-lg sm:text-2xl">
                        <FileTextOutlined className="mr-2" />
                        Quản lý tin đăng
                    </Title>
                    <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        onClick={() => setFilterModalVisible(true)}
                        className="flex items-center"
                    >
                        Lọc
                    </Button>
                </div>
                <div className="mt-4">
                    <Tabs
                        type="card"
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        className="w-full"
                        tabBarStyle={{ marginBottom: '0' }}
                    >
                        <TabPane tab="Tất cả" key="ALL" />
                        <TabPane tab="Chờ duyệt" key="PENDING" />
                        <TabPane tab="Duyệt lại sau" key="REVIEW_LATER" />
                        <TabPane tab="Đang hiển thị" key="APPROVED" />
                        <TabPane tab="Từ chối" key="REJECTED" />
                        <TabPane tab="Hết hạn" key="EXPIRED" />
                    </Tabs>
                </div>
                <div className="mt-6 bg-white p-6 rounded-lg shadow">
                    <div className="mt-4 overflow-x-auto">
                        <Table
                            columns={columns}
                            dataSource={posts}
                            loading={loading}
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                pageSizeOptions: pagination.pageSizeOptions,
                                showTotal: (total, range) =>
                                    `Hiển thị ${range[0]}-${range[1]} trên ${total} tin đăng`,
                            }}
                            onChange={handleTableChange}
                            className="rounded-lg"
                        />
                    </div>
                </div>
                <PostDetailModalWithUser
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    post={selectedPost}
                />
                <PostFilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    minArea={minArea}
                    setMinArea={setMinArea}
                    maxArea={maxArea}
                    setMaxArea={setMaxArea}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    vipId={vipId}
                    setVipId={setVipId}
                    email={email}
                    setEmail={setEmail}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
};

export default PostManagement;