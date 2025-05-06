import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Table, Select, Space, Tooltip, Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { FileTextOutlined, EditOutlined, QuestionCircleOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';
import { formatPrice } from '../../utils';
import DeletePostButton from '../../components/posts/DeletePostButton';
import PostDetailModal from '../../components/posts/PostDetailModal';

moment.locale('vi');

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Posts = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState(null);
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

    const fetchPosts = async (
        tab = 'ALL',
        type = null,
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
            };
            if (tab !== 'ALL') {
                params.status = tab;
            }
            if (type) {
                params.type = type;
            }
            const response = await axiosInstance.get('/api/posts/my-posts', { params });
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
        fetchPosts(activeTab, typeFilter, pagination.current, pagination.pageSize);
    }, [activeTab, typeFilter, pagination.current, pagination.pageSize]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTypeChange = (value) => {
        setTypeFilter(value || null);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (pagination, filters, sorter) => {
        const { field, order } = sorter;
        fetchPosts(
            activeTab,
            typeFilter,
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
            width: 90,
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
            title: 'Tiêu đề',
            dataIndex: 'title',
            sorter: true,
            width: '100%',
            render: (text) => (
                <Tooltip title={text}>
                    <span
                        className="font-medium block overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                    >
                        {text}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'VIP',
            dataIndex: 'vipLevel',
            sorter: true,
            width: 100,
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
            responsive: ['md'],
            sorter: true,
            width: 150,
            render: (price, record) => {
                const formattedPrice = formatPrice(price);
                return record.type === 'RENT' ? `${formattedPrice}/tháng` : formattedPrice;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            width: 120,
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
            responsive: ['md'],
            width: 110,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            responsive: ['md'],
            sorter: true,
            width: 150,
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Ngày hết hạn',
            dataIndex: 'expireDate',
            responsive: ['md'],
            sorter: true,
            width: 150,
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
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
                        <Tooltip title={record.status === 'REJECTED' ? 'Chỉnh sửa để đăng lại tin' : 'Chỉnh sửa tin đăng'}>
                            <Button
                                type="link"
                                icon={
                                    record.status === 'REJECTED' ? (
                                        <QuestionCircleOutlined style={{ color: '#f97316' }} /> // Màu cam trực tiếp
                                    ) : (
                                        <EditOutlined style={{ color: '#3b82f6' }} /> // Màu xanh trực tiếp
                                    )
                                }
                                className={record.status === 'REJECTED' ? 'text-orange-500' : 'text-blue-500'}
                            />
                        </Tooltip>
                    </Link>
                    <DeletePostButton postId={record.id} onDeleteSuccess={handleDeleteSuccess} />
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Title level={2} className="m-0 text-gray-800 flex items-center text-lg sm:text-2xl">
                    <FileTextOutlined className="mr-2" />
                    Quản lý tin đăng
                </Title>
                <div className="mt-6">
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center md:space-y-6 lg:space-x-6 lg:space-y-6 wrap">
                        <Tabs
                            type="card"
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            className="flex-1 w-full"
                            tabBarStyle={{ marginBottom: '0' }}
                        >
                            <TabPane tab="Tất cả" key="ALL" />
                            <TabPane tab="Chờ duyệt" key="PENDING" />
                            <TabPane tab="Duyệt lại sau" key="REVIEW_LATER" />
                            <TabPane tab="Đang hiển thị" key="APPROVED" />
                            <TabPane tab="Từ chối" key="REJECTED" />
                            <TabPane tab="Hết hạn" key="EXPIRED" />
                        </Tabs>
                        <Select
                            allowClear
                            placeholder="Lọc theo loại tin"
                            onChange={handleTypeChange}
                            value={typeFilter}
                            className="w-full lg:w-48 lg:w-56 lg-mt-1"
                        >
                            <Option value={null}>Tất cả</Option>
                            <Option value="SALE">Tin bán</Option>
                            <Option value="RENT">Tin cho thuê</Option>
                        </Select>
                    </div>
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
                            className="rounded-lg "
                            tableLayout="fixed"
                            scroll={{ x: 800 }}
                        />
                    </div>
                </div>
                <PostDetailModal
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    post={selectedPost}
                />
            </div>
        </div>
    );
};

export default Posts;