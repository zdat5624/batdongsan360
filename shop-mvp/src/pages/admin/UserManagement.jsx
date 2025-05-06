import { useState, useEffect } from 'react';
import { Typography, Table, Input, Select, Row, Col, Button, Space, Tooltip, Popconfirm, message } from 'antd';
import { UserOutlined, EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import moment from 'moment';
import UserDetailModal from '../../components/users/UserDetailModal';
import UserCreateModal from '../../components/users/UserCreateModal';
import UserEditModal from '../../components/users/UserEditModal';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: [6, 12, 24],
    });
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        gender: '',
        sortBy: 'id',
        sortDirection: 'DESC',
    });
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Gọi API để lấy danh sách người dùng
    const fetchUsers = async (page = 1, pageSize = 6, filters = {}) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/admin/users', {
                params: {
                    page: page - 1,
                    size: pageSize,
                    role: filters.role || undefined,
                    gender: filters.gender || undefined,
                    search: filters.search || undefined,
                    sortBy: filters.sortBy || 'id',
                    sortDirection: filters.sortDirection || 'DESC',
                },
            });
            if (response.data.statusCode === 200) {
                setUsers(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                    pageSizeOptions: [6, 12, 24],
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Đã xảy ra lỗi khi tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi component được render
    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, filters);
    }, []);

    // Xử lý thay đổi phân trang hoặc sắp xếp
    const handleTableChange = (newPagination, _, sorter) => {
        const newFilters = {
            ...filters,
            sortBy: sorter.field || filters.sortBy,
            sortDirection: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        };
        setFilters(newFilters);
        fetchUsers(newPagination.current, newPagination.pageSize, newFilters);
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            pageSizeOptions: [6, 12, 24],
        });
    };

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);
        fetchUsers(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (value, type) => {
        const newFilters = { ...filters, [type]: value || '' };
        setFilters(newFilters);
        fetchUsers(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Định dạng giới tính
    const formatGender = (gender) => {
        switch (gender) {
            case 'MALE':
                return 'Nam';
            case 'FEMALE':
                return 'Nữ';
            case 'OTHER':
                return 'Khác';
            default:
                return gender;
        }
    };

    // Định dạng số tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Xử lý xem chi tiết người dùng
    const handleViewUser = (userId) => {
        setSelectedUserId(userId);
        setIsDetailModalVisible(true);
    };

    // Xử lý chỉnh sửa người dùng
    const handleEditUser = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalVisible(true);
    };

    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
            if (response.data.statusCode === 200) {
                message.success('Xóa người dùng thành công!');
                fetchUsers(pagination.current, pagination.pageSize, filters);
            } else {
                message.error(response.data.message || 'Xóa người dùng thất bại.');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi xóa người dùng.');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý sau khi tạo hoặc cập nhật người dùng thành công
    const handleUserUpdated = () => {
        fetchUsers(pagination.current, pagination.pageSize, filters);
    };

    // Định nghĩa các cột của bảng
    const columns = [
        { title: 'Mã', dataIndex: 'id', key: 'id', sorter: true },
        { title: 'Tên', dataIndex: 'name', key: 'name', sorter: true },
        { title: 'Email', dataIndex: 'email', key: 'email', sorter: true },
        { title: 'Vai trò', dataIndex: 'role', key: 'role', sorter: true },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => formatGender(text),
            sorter: true,
        },
        {
            title: 'Số dư',
            dataIndex: 'balance',
            key: 'balance',
            render: (text) => formatCurrency(text),
            sorter: true,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewUser(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditUser(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa người dùng này?"
                            onConfirm={() => handleDeleteUser(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={2}>
                    <UserOutlined className="mr-2" />Quản lý người dùng
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalVisible(true)}
                >
                    Tạo mới
                </Button>
            </div>

            {/* Bộ lọc và tìm kiếm */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                        placeholder="Tìm theo email, mã hoặc SĐT"
                        onSearch={handleSearch}
                        enterButton
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                        placeholder="Lọc vai trò"
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange(value, 'role')}
                        allowClear
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="ADMIN">ADMIN</Option>
                        <Option value="USER">USER</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                        placeholder="Lọc giới tính"
                        style={{ width: '100%' }}
                        onChange={(value) => handleFilterChange(value, 'gender')}
                        allowClear
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="MALE">Nam</Option>
                        <Option value="FEMALE">Nữ</Option>
                        <Option value="OTHER">Khác</Option>
                    </Select>
                </Col>
            </Row>

            {/* Bảng danh sách người dùng */}
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} người dùng`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            {/* Modal xem chi tiết */}
            <UserDetailModal
                visible={isDetailModalVisible}
                userId={selectedUserId}
                onClose={() => setIsDetailModalVisible(false)}
                formatGender={formatGender}
            />

            {/* Modal tạo người dùng */}
            <UserCreateModal
                open={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onUserCreated={handleUserUpdated}
            />

            {/* Modal chỉnh sửa người dùng */}
            <UserEditModal
                visible={isEditModalVisible}
                userId={selectedUserId}
                onClose={() => setIsEditModalVisible(false)}
                onUserUpdated={handleUserUpdated}
            />
        </div>
    );
};

export default UserManagement;