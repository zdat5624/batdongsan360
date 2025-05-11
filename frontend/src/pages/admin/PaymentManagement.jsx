import { useState, useEffect } from 'react';
import { Typography, Table, Input, Button, Row, Col, Select, DatePicker, message, Tag, Tooltip } from 'antd';
import { CreditCardOutlined, EyeOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import moment from 'moment';
import 'moment/locale/vi';
import TransactionDetailModal from '../../components/payments/TransactionDetailModal';
import AdminTransactionDetailModal from '../../components/payments/AdminTransactionDetailModal';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: [6, 12, 24],
    });
    const [filters, setFilters] = useState({
        searchField: 'email',
        searchTerm: '',
        status: '',
        type: 'ALL',
        startDate: null,
        endDate: null,
        sortBy: 'createdAt',
        sortDirection: 'asc',
    });

    // Gọi API để lấy danh sách giao dịch
    const fetchTransactions = async (page = 1, pageSize = 6, filters = {}) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1,
                size: pageSize,
                sort: `${filters.sortBy},${filters.sortDirection}`,
                status: filters.status || undefined,
                type: filters.type !== 'ALL' ? filters.type : undefined,
                startDate: filters.startDate ? filters.startDate : undefined,
                endDate: filters.endDate ? filters.endDate : undefined,
            };

            if (filters.searchTerm) {
                if (filters.searchField === 'email') {
                    params.email = filters.searchTerm;
                } else if (filters.searchField === 'transactionId') {
                    params.transactionId = filters.searchTerm;
                } else if (filters.searchField === 'txnId') {
                    params.txnId = filters.searchTerm;
                }
            }

            const response = await axiosInstance.get('/api/admin/payment/transactions', { params });
            if (response.data.statusCode === 200) {
                setTransactions(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                    pageSizeOptions: [6, 12, 24],
                });
            } else {
                message.error(response.data.message || 'Không thể tải danh sách giao dịch.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi tải danh sách giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API để lấy chi tiết giao dịch
    const fetchTransactionDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/payment/transactions/${id}`);
            if (response.data.statusCode === 200) {
                setSelectedTransaction(response.data.data);
                setIsModalVisible(true);
            } else {
                message.error(response.data.message || 'Không thể tải chi tiết giao dịch.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi tải chi tiết giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(pagination.current, pagination.pageSize, filters);
    }, []);

    const handleTableChange = (newPagination, _, sorter) => {
        const newFilters = {
            ...filters,
            sortBy: sorter.field || filters.sortBy,
            sortDirection: sorter.order === 'ascend' ? 'asc' : 'desc',
        };
        setFilters(newFilters);
        fetchTransactions(newPagination.current, newPagination.pageSize, newFilters);
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    const handleSearchFieldChange = (value) => {
        setFilters({ ...filters, searchField: value, searchTerm: '' });
        fetchTransactions(1, pagination.pageSize, { ...filters, searchField: value, searchTerm: '' });
        setPagination({ ...pagination, current: 1 });
    };

    const handleSearch = (value) => {
        const newFilters = { ...filters, searchTerm: value };
        setFilters(newFilters);
        fetchTransactions(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    const handleStatusFilterChange = (value) => {
        const newFilters = { ...filters, status: value || '' };
        setFilters(newFilters);
        fetchTransactions(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTypeFilterChange = (value) => {
        const newFilters = { ...filters, type: value || 'ALL' };
        setFilters(newFilters);
        fetchTransactions(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    const handleDateRangeChange = (dates) => {
        const newFilters = {
            ...filters,
            startDate: dates && dates[0] ? dates[0].toISOString() : null,
            endDate: dates && dates[1] ? dates[1].toISOString() : null,
        };
        setFilters(newFilters);
        fetchTransactions(1, pagination.pageSize, newFilters);
        setPagination({ ...pagination, current: 1 });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'PENDING':
                return <Tag color="blue">Đang xử lý</Tag>;
            case 'SUCCESS':
                return <Tag color="green">Thành công</Tag>;
            case 'FAILED':
                return <Tag color="red">Thất bại</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    const formatType = (amount) => {
        return amount > 0 ? 'Nạp tiền' : 'Thanh toán';
    };

    const handleViewDetail = (id) => {
        fetchTransactionDetail(id);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedTransaction(null);
    };

    const columns = [
        { title: 'Mã', dataIndex: 'id', key: 'id', sorter: true },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            sorter: true,
            render: (text) => formatAmount(text)
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            key: 'description'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            key: 'status',
            render: (text) => formatStatus(text)
        },
        {
            title: 'Loại',
            key: 'type',
            render: (_, record) => formatType(record.amount)
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record.id)}
                    >

                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={2}>
                    <CreditCardOutlined className="mr-2" />Quản lý thanh toán
                </Title>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end">
                <Col xs={24} sm={12} md={6} lg={3}>
                    <Select
                        placeholder="Lọc trạng thái"
                        style={{ width: '100%' }}
                        onChange={handleStatusFilterChange}
                        allowClear
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="PENDING">Đang xử lý</Option>
                        <Option value="SUCCESS">Thành công</Option>
                        <Option value="FAILED">Thất bại</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={3}>
                    <Select
                        placeholder="Lọc loại giao dịch"
                        style={{ width: '100%' }}
                        onChange={handleTypeFilterChange}
                        allowClear
                    >
                        <Option value="ALL">Tất cả</Option>
                        <Option value="DEPOSIT">Nạp tiền</Option>
                        <Option value="PAYMENT">Thanh toán</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                        style={{ width: '100%' }}
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Select
                        value={filters.searchField}
                        onChange={handleSearchFieldChange}
                        style={{ width: '100%' }}
                    >
                        <Option value="email">Email người dùng</Option>
                        <Option value="transactionId">Mã giao dịch</Option>
                        <Option value="txnId">Mã VNPAY</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={8}>
                    <Input.Search
                        placeholder={`Tìm theo ${filters.searchField === 'email'
                            ? 'email'
                            : filters.searchField === 'transactionId'
                                ? 'mã giao dịch'
                                : 'mã giao dịch VNPAY'
                            }`}
                        onSearch={handleSearch}
                        allowClear
                        enterButton
                    />
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={transactions}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} giao dịch`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
            />

            <AdminTransactionDetailModal
                visible={isModalVisible}
                transaction={selectedTransaction}
                onClose={handleModalClose}
                formatAmount={formatAmount}
                formatStatus={formatStatus}
                formatType={formatType}
            />
        </div>
    );
};

export default PaymentManagement;