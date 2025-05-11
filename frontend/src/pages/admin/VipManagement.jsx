import { useState, useEffect } from 'react';
import { Typography, Table, Input, Button, Row, Col, Space, Tooltip, Tag } from 'antd';
import { StarOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import UpdatePriceModal from '../../components/vips/UpdatePriceModal';

const { Title } = Typography;
const { Search } = Input;

const VipManagement = () => {
    const [vips, setVips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: [6, 12, 24],
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdatePriceModalVisible, setIsUpdatePriceModalVisible] = useState(false);
    const [selectedVipId, setSelectedVipId] = useState(null);

    // Gọi API để lấy danh sách gói VIP
    const fetchVips = async (page = 1, pageSize = 6, search = '') => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/vips', {
                params: {
                    page: page - 1,
                    size: pageSize,
                    search: search || undefined,
                },
            });
            if (response.data.statusCode === 200) {
                setVips(response.data.data);
                // Giả lập pagination client-side vì API không trả về totalElements
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: pageSize,
                    total: response.data.data.length, // Điều chỉnh nếu API hỗ trợ totalElements
                });
            } else {
                console.error('Error fetching VIPs:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching VIPs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi component được render
    useEffect(() => {
        fetchVips(pagination.current, pagination.pageSize, searchQuery);
    }, []);

    // Xử lý thay đổi phân trang
    const handleTableChange = (newPagination) => {
        fetchVips(newPagination.current, newPagination.pageSize, searchQuery);
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };



    // Xử lý mở modal cập nhật giá
    const handleOpenUpdatePriceModal = (vipId) => {
        setSelectedVipId(vipId);
        setIsUpdatePriceModalVisible(true);
    };

    // Xử lý sau khi cập nhật giá thành công
    const handlePriceUpdated = () => {
        fetchVips(pagination.current, pagination.pageSize, searchQuery);
    };

    // Định dạng số tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Định nghĩa các cột của bảng
    const columns = [
        { title: 'Cấp VIP', dataIndex: 'vipLevel', key: 'vipLevel', sorter: (a, b) => a.vipLevel - b.vipLevel },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, record) => {
                let color, text;
                if (record.vipLevel === 0) {
                    color = 'gray';
                    text = 'VIP 0';
                } else if (record.vipLevel === 1) {
                    color = 'gold';
                    text = `VIP ${record.vipLevel}`;
                } else if (record.vipLevel === 2) {
                    color = 'red';
                    text = `VIP ${record.vipLevel}`;
                } else {
                    color = 'blue';
                    text = record.name;
                }
                return (
                    <Tag color={color} className="font-semibold">
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá mỗi ngày',
            dataIndex: 'pricePerDay',
            key: 'pricePerDay',
            render: (text) => formatCurrency(text),
            sorter: (a, b) => a.pricePerDay - b.pricePerDay,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa giá">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenUpdatePriceModal(record.id)}
                        >

                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={2}>
                    <StarOutlined className="mr-2" />Quản lý gói VIP
                </Title>

            </div>



            {/* Bảng danh sách gói VIP */}
            <Table
                columns={columns}
                dataSource={vips}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} gói VIP`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            {/* Modal cập nhật giá */}
            <UpdatePriceModal
                open={isUpdatePriceModalVisible}
                vipId={selectedVipId}
                onClose={() => setIsUpdatePriceModalVisible(false)}
                onPriceUpdated={handlePriceUpdated}
            />
        </div>
    );
};

export default VipManagement;