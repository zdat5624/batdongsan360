import { useState, useEffect } from 'react';
import { Typography, Table, Button, Row, Col, Space, Tooltip, Select, message, Popconfirm } from 'antd';
import { FolderOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import CreateCategoryModal from '../../components/categories/CreateCategoryModal';
import UpdateCategoryModal from '../../components/categories/UpdateCategoryModal';
import ViewCategoryModal from '../../components/categories/ViewCategoryModal';

const { Title } = Typography;
const { Option } = Select;

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: [6, 12, 24],
    });
    const [filters, setFilters] = useState({
        type: '',
        sortBy: 'id',
        sortDirection: 'asc',
    });
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // Gọi API để lấy danh sách danh mục
    const fetchCategories = async (page = 1, pageSize = 6, filters = {}) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/admin/categories', {
                params: {
                    page: page - 1,
                    size: pageSize,
                    type: filters.type || undefined,
                    sort: `${filters.sortBy},${filters.sortDirection}`,
                },
            });
            if (response.data.statusCode === 200) {
                setCategories(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                    pageSizeOptions: [6, 12, 24],
                });
            } else {
                console.error('Error fetching categories:', response.data.message);
                message.error(response.data.message || 'Không thể tải danh sách danh mục.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Đã xảy ra lỗi khi tải danh sách danh mục.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi component được render
    useEffect(() => {
        fetchCategories(pagination.current, pagination.pageSize, filters);
    }, []);

    // Xử lý thay đổi phân trang hoặc sắp xếp
    const handleTableChange = (newPagination, _, sorter) => {
        const newFilters = {
            ...filters,
            sortBy: sorter.field || filters.sortBy,
            sortDirection: sorter.order === 'ascend' ? 'asc' : 'desc',
        };
        setFilters(newFilters);
        fetchCategories(newPagination.current, newPagination.pageSize, newFilters);
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    // Xử lý thay đổi bộ lọc type
    const handleFilterChange = (value) => {
        const newFilters = { ...filters, type: value || '' };
        setFilters(newFilters);
        fetchCategories(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    // Xử lý xóa danh mục
    const handleDeleteCategory = async (categoryId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.delete(`/api/admin/categories/${categoryId}`);
            if (response.data.statusCode === 200) {
                message.success('Xóa danh mục thành công!');
                fetchCategories(pagination.current, pagination.pageSize, filters);
            } else {
                message.error(response.data.message || 'Xóa danh mục thất bại.');
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi xóa danh mục.');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý sau khi tạo hoặc cập nhật danh mục thành công
    const handleCategoryUpdated = () => {
        fetchCategories(pagination.current, pagination.pageSize, filters);
    };

    // Xử lý mở modal cập nhật
    const handleOpenUpdateModal = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsUpdateModalVisible(true);
    };

    // Xử lý mở modal xem chi tiết
    const handleOpenViewModal = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsViewModalVisible(true);
    };

    // Định dạng loại danh mục
    const formatType = (type) => {
        switch (type) {
            case 'RENT':
                return 'Cho thuê';
            case 'SALE':
                return 'Bán';
            default:
                return type;
        }
    };

    // Định nghĩa các cột của bảng
    const columns = [
        { title: 'Mã', dataIndex: 'id', key: 'id', sorter: true },
        { title: 'Tên', dataIndex: 'name', key: 'name', sorter: true },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (text) => formatType(text),
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
                            onClick={() => handleOpenViewModal(record.id)}
                        >

                        </Button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenUpdateModal(record.id)}
                        >

                        </Button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa danh mục này?"
                            onConfirm={() => handleDeleteCategory(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                            >

                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>
                    <FolderOutlined className="mr-2" />Quản lý danh mục
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalVisible(true)}
                >
                    Tạo mới
                </Button>
            </div>

            {/* Bộ lọc */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                        placeholder="Lọc danh mục"
                        style={{ width: '100%' }}
                        onChange={handleFilterChange}
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="RENT">Cho thuê</Option>
                        <Option value="SALE">Bán</Option>
                    </Select>
                </Col>
            </Row>

            {/* Bảng danh sách danh mục */}
            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} danh mục`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            {/* Modal tạo danh mục */}
            <CreateCategoryModal
                open={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onCategoryCreated={handleCategoryUpdated}
            />

            {/* Modal cập nhật danh mục */}
            <UpdateCategoryModal
                open={isUpdateModalVisible}
                categoryId={selectedCategoryId}
                onClose={() => setIsUpdateModalVisible(false)}
                onCategoryUpdated={handleCategoryUpdated}
            />

            {/* Modal xem chi tiết danh mục */}
            <ViewCategoryModal
                open={isViewModalVisible}
                categoryId={selectedCategoryId}
                onClose={() => setIsViewModalVisible(false)}
            />
        </div>
    );
};

export default CategoryManagement;