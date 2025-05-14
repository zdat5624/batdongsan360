import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Table, Select, Space, Tooltip, Button, Tag, Input, Row, Col } from 'antd';
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
const { Search } = Input;

const Posts = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState(null);
    const [postIdFilter, setPostIdFilter] = useState(null);
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
        postId = null,
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
            if (postId) {
                params.postId = postId;
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
        fetchPosts(activeTab, typeFilter, postIdFilter, pagination.current, pagination.pageSize);
    }, [activeTab, typeFilter, postIdFilter, pagination.current, pagination.pageSize]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTypeChange = (value) => {
        setTypeFilter(value || null);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handlePostIdSearch = (value) => {
        const postId = value ? parseInt(value, 10) : null;
        if (value && isNaN(postId)) {
            return; // Ignore invalid input
        }
        setPostIdFilter(postId);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (pagination, filters, sorter) => {
        const { field, order } = sorter;
        fetchPosts(
            activeTab,
            typeFilter,
            postIdFilter,
            pagination.current,
            pagination.pageSize,
            field || 'createdAt',
            order || 'ascend'
        );
    };

    const handleDeleteSuccess = (postId) => {
        fetchPosts(
            activeTab,
            typeFilter,
            postIdFilter,
            pagination.current,
            pagination.pageSize
        );
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
                    to={`/posts/${id}`}
                    target="_blank"
                    className="text-blue-500 hover:text-blue-700 text-sm"
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
                    <span className="font-medium block overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-sm">
                        {text}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'VIP',
            dataIndex: 'vipLevel',
            sorter: true,
            width: 80,
            responsive: ['md'],
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
                    <Tag color={color} className="font-semibold text-xs">
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            sorter: true,
            width: 120,
            responsive: ['md'],
            render: (price, record) => {
                const formattedPrice = formatPrice(price);
                return (
                    <span className="text-sm">
                        {record.type === 'RENT' ? `${formattedPrice}/tháng` : formattedPrice}
                    </span>
                );
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
                        color = 'gold';
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
                        color = 'geekblue';
                        text = 'Hết hạn';
                        break;
                    default:
                        color = 'blue';
                        text = 'Không xác định';
                }
                return (
                    <Tag color={color} style={{ fontWeight: 'semibold' }}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Lượt xem',
            dataIndex: 'view',
            sorter: true,
            width: 110,
            responsive: ['lg'],
            render: (view) => <span className="text-sm">{view}</span>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            sorter: true,
            width: 120,
            responsive: ['xl'],
            render: (date) => <span className="text-sm">{moment(date).format('DD/MM/YYYY')}</span>,
        },
        // {
        //     title: 'Hết hạn',
        //     dataIndex: 'expireDate',
        //     sorter: true,
        //     width: 120,
        //     responsive: ['xl'],
        //     render: (date) => <span className="text-sm">{moment(date).format('DD/MM/YYYY')}</span>,
        // },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            className="text-blue-500 p-0"
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {record.status !== 'EXPIRED' && (
                        <Link to={`/edit-post/${record.id}`}>
                            <Tooltip title={record.status === 'REJECTED' ? 'Chỉnh sửa để đăng lại tin' : 'Chỉnh sửa tin đăng'}>
                                <Button
                                    type="link"
                                    icon={
                                        record.status === 'REJECTED' ? (
                                            <QuestionCircleOutlined className="text-orange-500" />
                                        ) : (
                                            <EditOutlined className="text-blue-500" />
                                        )
                                    }
                                    className="p-0"
                                />
                            </Tooltip>
                        </Link>
                    )}
                    <DeletePostButton postId={record.id} onDeleteSuccess={handleDeleteSuccess} />
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Title level={2} className="m-0 text-gray-800 flex items-center text-lg sm:text-xl lg:text-2xl mb-4">
                    <FileTextOutlined className="mr-2" />
                    Quản lý tin đăng
                </Title>
                <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} lg={16}>
                        <Tabs
                            type="card"
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            className="w-full"
                            tabBarStyle={{ marginBottom: 0 }}
                            size="small"
                        >
                            <TabPane tab="Tất cả" key="ALL" />
                            <TabPane tab="Chờ duyệt" key="PENDING" />
                            <TabPane tab="Duyệt lại sau" key="REVIEW_LATER" />
                            <TabPane tab="Đang hiển thị" key="APPROVED" />
                            <TabPane tab="Từ chối" key="REJECTED" />
                            <TabPane tab="Hết hạn" key="EXPIRED" />
                        </Tabs>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={12}>
                                <Search
                                    placeholder="Tìm theo mã tin"
                                    onSearch={handlePostIdSearch}
                                    allowClear
                                    enterButton
                                    size="middle"
                                    className="w-full"
                                />
                            </Col>
                            <Col xs={24} sm={12}>
                                <Select
                                    allowClear
                                    placeholder="Lọc theo loại tin"
                                    onChange={handleTypeChange}
                                    value={typeFilter}
                                    size="middle"
                                    className="w-full"
                                >
                                    <Option value={null}>Tất cả</Option>
                                    <Option value="SALE">Tin bán</Option>
                                    <Option value="RENT">Tin cho thuê</Option>
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <div className="overflow-x-auto">
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
                            responsive: true,
                        }}
                        onChange={handleTableChange}
                        className="rounded-lg"
                        tableLayout="fixed"
                        scroll={{ x: 800 }}
                    />
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