import React, { useState, useEffect } from 'react';
import { Table, Select, Badge, Typography, Spin, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { BellOutlined } from '@ant-design/icons';
import moment from 'moment';
import axiosInstance from '../../api/axiosConfig';
import NotificationDetailModal from '../../components/notifications/NotificationDetailModal';
import MarkAsReadButton from '../../components/notifications/MarkAsReadButton';
import DeleteSelectedNotificationsButton from '../../components/notifications/DeleteSelectedNotificationsButton';
import NotificationTabs from '../../components/notifications/NotificationTabs';
import MarkAllAsReadButton from '../../components/notifications/MarkAllAsReadButton';
import NotificationText from '../../components/notifications/NotificationText';
// import './Notifications.css';

const { Title } = Typography;
const { Option } = Select;

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({
        TRANSACTION: 0,
        SYSTEM_ALERT: 0,
        POST: 0,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: ['6', '12', '24'],

    });
    const [activeTab, setActiveTab] = useState('ALL');
    const [readFilter, setReadFilter] = useState('all');
    const [sortInfo, setSortInfo] = useState({ field: 'createdAt', order: 'desc' });
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const fetchUnreadCounts = async () => {
        try {
            const response = await axiosInstance.get('/api/notifications/unread-count-by-type');
            setUnreadCounts(response.data.data);
        } catch (error) {
            console.error('Error fetching unread counts:', error);
            message.error('Không thể tải số lượng thông báo chưa đọc.');
        }
    };

    const fetchNotifications = async (
        page = 0,
        pageSize = 6,
        type = null,
        isRead = null,
        sortField = 'createdAt',
        sortOrder = 'desc'
    ) => {
        if (!user) return;
        setLoading(true);
        try {
            const params = {
                page,
                size: pageSize,
                sort: `${sortField},${sortOrder}`,
                ...(type && type !== 'ALL' && { type }),
                ...(isRead !== null && { isRead }),
            };
            const response = await axiosInstance.get('/api/notifications', { params });
            const { content, totalElements, number, size } = response.data.data;
            setNotifications(content);
            setPagination((prev) => ({
                ...prev,
                current: number + 1,
                pageSize: size,
                total: totalElements,
            }));
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error('Không thể tải danh sách thông báo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCounts();
            fetchNotifications(
                pagination.current - 1,
                pagination.pageSize,
                activeTab,
                readFilter === 'all' ? null : readFilter === 'read',
                sortInfo.field,
                sortInfo.order
            );
        }
    }, [user, activeTab, readFilter, sortInfo]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleReadFilterChange = (value) => {
        setReadFilter(value || 'all');
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (newPagination, filters, sorter) => {
        const sortField = sorter.field || 'createdAt';
        const sortOrder = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : 'desc';
        setSortInfo({ field: sortField, order: sortOrder });
        setPagination(newPagination);
        fetchNotifications(
            newPagination.current - 1,
            newPagination.pageSize,
            activeTab,
            readFilter === 'all' ? null : readFilter === 'read',
            sortField,
            sortOrder
        );
    };

    const handleRowClick = (record) => {
        setSelectedNotification(record);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedNotification(null);
    };

    const handleMarkAsRead = async (notificationIds, notificationType = null) => {
        try {
            const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) =>
                    ids.includes(notif.id) ? { ...notif, read: true } : notif
                )
            );
            if (notificationType) {
                setUnreadCounts((prevCounts) => ({
                    ...prevCounts,
                    [notificationType]: Math.max(0, prevCounts[notificationType] - 1),
                }));
            } else {
                const types = notifications
                    .filter((notif) => ids.includes(notif.id))
                    .map((notif) => notif.type);
                setUnreadCounts((prevCounts) => {
                    const newCounts = { ...prevCounts };
                    types.forEach((type) => {
                        newCounts[type] = Math.max(0, newCounts[type] - 1);
                    });
                    return newCounts;
                });
            }
            await fetchUnreadCounts();
            await fetchNotifications(
                pagination.current - 1,
                pagination.pageSize,
                activeTab,
                readFilter === 'all' ? null : readFilter === 'read',
                sortInfo.field,
                sortInfo.order
            );
        } catch (error) {
            console.error('Error in handleMarkAsRead:', error);
            message.error('Không thể cập nhật trạng thái thông báo.');
        }
    };

    const handleDelete = (notificationIds) => {
        const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notif) => !ids.includes(notif.id))
        );
        setSelectedRowKeys([]);
    };

    const handleRefresh = () => {
        fetchUnreadCounts();
        fetchNotifications(
            pagination.current - 1,
            pagination.pageSize,
            activeTab,
            readFilter === 'all' ? null : readFilter === 'read',
            sortInfo.field,
            sortInfo.order
        );
    };

    const columns = [
        {
            title: 'Nội dung',
            dataIndex: 'message',
            key: 'message',
            sorter: true,
            width: '100%',
            render: (text, record) => (
                <span
                    className={`${!record.read ? 'font-medium' : 'font-normal'} cursor-pointer flex items-center`}
                >
                    {!record.read && (
                        <Badge
                            size="small"
                            status="error"
                            className="mr-2"
                        />
                    )}
                    <span
                        style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {text}
                    </span>
                </span>
            ),
            onCell: (record) => ({
                onClick: () => handleRowClick(record),
            }),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            sorter: true,
            responsive: ['md'],
            width: 160,
            minWidth: 160,
            render: (type) => {
                const typeMap = {
                    POST: 'Bài đăng',
                    TRANSACTION: 'Giao dịch',
                    SYSTEM_ALERT: 'Hệ thống',
                };
                return typeMap[type] || type;
            },
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            width: 160,
            minWidth: 160,
            render: (time) => moment(time).format('DD/MM/YYYY HH:mm'),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    return (
        <div className=" min-h-screen">
            <div className=" mx-auto">
                <Title level={2} className="m-0 text-gray-800">
                    <BellOutlined className="mr-2" />
                    Thanh toán
                </Title>

                <div className="  mb-0 flex flex-col md:flex-row md:justify-between md:items-center">
                    <NotificationTabs
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        unreadCounts={unreadCounts}
                    />
                    <NotificationText onRefresh={handleRefresh} /> {/* //bình thường không hiện nếu có thông báo mới sẽ hiện: 'Bạn có thông báo mới 15 giây trước' */}
                    <div className="flex gap-2 mb-1">

                        <MarkAsReadButton
                            selectedIds={selectedRowKeys}
                            onMarkAsRead={handleMarkAsRead}
                            onRefresh={handleRefresh}
                            disabled={loading}
                        />
                        <DeleteSelectedNotificationsButton
                            selectedIds={selectedRowKeys}
                            onDelete={handleDelete}
                            onRefresh={handleRefresh}
                            disabled={loading}
                        />
                        <MarkAllAsReadButton
                            onRefresh={handleRefresh}
                            disabled={loading}
                        />
                        <Select
                            className="w-full md:w-40"
                            value={readFilter}
                            onChange={handleReadFilterChange}
                            allowClear
                            placeholder="Lọc theo trạng thái"
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="read">Đã đọc</Option>
                            <Option value="unread">Chưa đọc</Option>
                        </Select>
                    </div>
                </div>
                <Spin spinning={loading}>
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={notifications}
                        rowKey="id"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            pageSizeOptions: pagination.pageSizeOptions,
                            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên ${total} thông báo`,
                        }}
                        onChange={handleTableChange}

                        className=" rounded-lg"
                        scroll={{ x: 800 }}
                        tableLayout="fixed"

                    />
                </Spin>
                <NotificationDetailModal
                    visible={modalVisible}
                    notification={selectedNotification}
                    onClose={handleModalClose}
                    onMarkAsRead={handleMarkAsRead}
                />
            </div>
        </div>
    );
};

export default Notifications;