import React, { useState, useEffect } from 'react';
import { Typography, Button, Tabs, Table, Select, Space, notification } from 'antd';
import axiosInstance from '../../api/axiosConfig';
import { CreditCardOutlined, WalletOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';
import DepositModal from '../../components/payments/DepositModal';
import TransactionDetailModal from '../../components/payments/TransactionDetailModal';
import { useAuth } from '../../contexts/AuthContext';
const { Text } = Typography;
moment.locale('vi');

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Payments = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('ALL');
    const [status, setStatus] = useState('SUCCESS');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: [6, 12, 24],
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const getQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            paymentStatus: params.get('status'),
            orderInfo: params.get('orderInfo'),
            paymentTime: params.get('paymentTime'),
            transactionId: params.get('transactionId'),
            totalPrice: params.get('totalPrice'),
            transactionStatus: params.get('transactionStatus'),
        };
    };

    const showTransactionNotification = ({ transactionStatus, transactionId, totalPrice, paymentTime }) => {
        let message = '';
        let description = '';
        let type = 'info';

        switch (transactionStatus) {
            case '00':
                message = 'Giao dịch thành công';
                description = `Giao dịch ${transactionId} với số tiền ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(totalPrice / 100)} đã hoàn tất vào ${moment(paymentTime, 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm')}.`;
                type = 'success';
                break;
            case '02':
            case '24':
                message = 'Giao dịch bị hủy';
                description = `Giao dịch ${transactionId} đã bị hủy bởi người dùng.`;
                type = 'warning';
                break;
            case '07':
                message = 'Giao dịch bị nghi ngờ';
                description = `Giao dịch ${transactionId} bị nghi ngờ (lừa đảo, bất thường). Vui lòng liên hệ hỗ trợ.`;
                type = 'error';
                break;
            case '09':
            case '10':
            case '12':
            case '13':
            case '79':
                message = 'Lỗi xác thực';
                description = `Giao dịch ${transactionId} thất bại do lỗi xác thực thông tin. Vui lòng kiểm tra lại.`;
                type = 'error';
                break;
            case '11':
                message = 'Hết hạn thanh toán';
                description = `Giao dịch ${transactionId} đã hết hạn chờ thanh toán.`;
                type = 'error';
                break;
            case '51':
            case '65':
                message = 'Không đủ điều kiện giao dịch';
                description = `Giao dịch ${transactionId} thất bại do không đủ số dư hoặc vượt hạn mức.`;
                type = 'error';
                break;
            case '75':
                message = 'Ngân hàng bảo trì';
                description = `Giao dịch ${transactionId} thất bại do ngân hàng đang bảo trì.`;
                type = 'error';
                break;
            case '99':
            default:
                message = 'Lỗi không xác định';
                description = `Giao dịch ${transactionId} thất bại với lỗi không xác định. Vui lòng liên hệ hỗ trợ.`;
                type = 'error';
                break;
        }

        notification[type]({
            message,
            description,
            placement: 'topRight',
            duration: 5,
        });
    };

    const fetchTransactions = async (
        tab = 'ALL',
        statusFilter = null,
        page = 1,
        pageSize = 6,
        sortField = 'createdAt',
        sortOrder = 'descend'
    ) => {
        setLoading(true);
        try {
            const params = {
                type: tab,
                page: page - 1,
                size: pageSize,
                sort: `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`,
            };
            if (statusFilter) {
                params.status = statusFilter;
            }
            const response = await axiosInstance.get('/api/payment/my-transactions', { params });
            const { content, totalElements } = response.data.data;
            setTransactions(
                content.map((item) => ({
                    key: item.id,
                    id: item.id,
                    amount: item.amount,
                    status: item.status,
                    description: item.description,
                    createdAt: item.createdAt,
                    paymentLink: item.paymentLink,
                    txnId: item.txnId,
                    user: item.user,
                }))
            );
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: totalElements,
            }));
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = getQueryParams();
        if (queryParams.transactionId && queryParams.transactionStatus) {
            showTransactionNotification(queryParams);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        fetchTransactions(activeTab, status, pagination.current, pagination.pageSize);
    }, [activeTab, status, pagination.current, pagination.pageSize]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleStatusChange = (value) => {
        setStatus(value === undefined ? 'SUCCESS' : value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (pagination, filters, sorter) => {
        const { field, order } = sorter;
        fetchTransactions(
            activeTab,
            status,
            pagination.current,
            pagination.pageSize,
            field || 'createdAt',
            order || 'descend'
        );
    };

    const handleDeposit = () => {
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleRowClick = (record) => {
        setSelectedTransaction(record);
        setIsDetailModalVisible(true);
    };

    const handleDetailModalCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedTransaction(null);
    };

    const columns = [
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            sorter: true,
            render: (amount) =>
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
            width: '20%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (status) => (
                <span
                    className={`font-semibold ${status === 'SUCCESS'
                        ? 'text-green-600'
                        : status === 'FAILED'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                >
                    {status === 'SUCCESS' ? 'Thành công' : status === 'FAILED' ? 'Thất bại' : 'Đang xử lý'}
                </span>
            ),
            width: '15%',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            width: '35%',
            sorter: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            sorter: true,
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
            width: '20%',
        },
    ];

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return '0 VNĐ';
        return `${Number(price).toLocaleString('vi-VN')} VNĐ`;
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <Title level={2} className="m-0 text-gray-800">
                        <CreditCardOutlined className="mr-2" />
                        Thanh toán
                    </Title>
                    {/* <Button
                        type="primary"
                        size="large"
                        onClick={handleDeposit}
                        className="mb-4 sm:mb-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 px-6 py-3 rounded-lg shadow-md"
                    >
                        <WalletOutlined className="" />
                        Nạp tiền
                    </Button> */}
                    <div className="flex items-center gap-2 mb-4 sm:mb-0">
                        <div className="flex items-center gap-1">
                            <Text className="text-base text-blue-500 font-medium">
                                Số dư: {user?.balance ? formatPrice(user.balance) : '0 VNĐ'}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleDeposit}
                            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 px-6 py-3 rounded-lg shadow-md"
                        >
                            <WalletOutlined />
                            Nạp tiền
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 ">
                        <Tabs
                            type="card"
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            className="flex-1"
                        >
                            <TabPane tab="Tất cả" key="ALL" />
                            <TabPane tab="Nạp tiền" key="DEPOSIT" />
                            <TabPane tab="Thanh toán" key="PAYMENT" />
                        </Tabs>
                        <Select
                            allowClear
                            placeholder="Lọc theo trạng thái"
                            onChange={handleStatusChange}
                            value={status}
                            className="w-full sm:w-48"
                            defaultValue="SUCCESS"
                        >
                            <Option value={null}>Tất cả</Option>
                            <Option value="PENDING">Đang xử lý</Option>
                            <Option value="SUCCESS">Thành công</Option>
                            <Option value="FAILED">Thất bại</Option>
                        </Select>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={transactions}
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
                        className="rounded-lg"
                        rowClassName="cursor-pointer hover:bg-gray-100"
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                        })}
                    />
                </div>
            </div>
            <DepositModal visible={isModalVisible} onCancel={handleModalCancel} />
            <TransactionDetailModal
                visible={isDetailModalVisible}
                onCancel={handleDetailModalCancel}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default Payments;