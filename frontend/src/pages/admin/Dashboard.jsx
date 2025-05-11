import { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Spin, Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../api/axiosConfig';

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);

    // Gọi API để lấy dữ liệu dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [statsResponse, revenueResponse] = await Promise.all([
                    axiosInstance.get('/api/admin/statistics'),
                    axiosInstance.get(`/api/admin/statistics/revenue-by-month?year=${selectedYear}`)
                ]);

                if (statsResponse.data.statusCode === 200) {
                    setDashboardData(statsResponse.data.data);
                }
                if (revenueResponse.data.statusCode === 200) {
                    setRevenueByMonth(revenueResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedYear]);

    // Hàm định dạng số tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Lấy tháng hiện tại (từ 1-12) và năm hiện tại
    const currentYear = new Date().getFullYear();
    const currentMonth = selectedYear === currentYear ? new Date().getMonth() + 1 : 12;

    // Lọc dữ liệu biểu đồ: chỉ giữ các tháng từ 1 đến tháng hiện tại hoặc tất cả nếu không phải năm hiện tại
    const chartData = revenueByMonth.filter((item) => item.month <= currentMonth);

    // Tạo danh sách năm cho Select (từ 2020 đến năm hiện tại)
    const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

    // Custom title with Select component
    const chartTitle = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Biểu đồ doanh thu năm {selectedYear}</span>
            <Select
                defaultValue={selectedYear}
                style={{ width: 120 }}
                onChange={(value) => setSelectedYear(value)}
            >
                {years.map((year) => (
                    <Option key={year} value={year}>
                        {year}
                    </Option>
                ))}
            </Select>
        </div>
    );

    return (
        <div >
            <Title level={2}>Admin Dashboard</Title>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Thống kê */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Doanh thu tháng" bordered={false} className="shadow-md">
                                <p className="text-lg font-semibold">
                                    {dashboardData ? formatCurrency(dashboardData.totalRevenueMonth) : '0'}
                                </p>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Doanh thu năm" bordered={false} className="shadow-md">
                                <p className="text-lg font-semibold">
                                    {dashboardData ? formatCurrency(dashboardData.totalRevenueYear) : '0'}
                                </p>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Tổng người dùng" bordered={false} className="shadow-md">
                                <p className="text-lg font-semibold">{dashboardData ? dashboardData.totalUsers : '0'}</p>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Bài đăng chờ duyệt" bordered={false} className="shadow-md">
                                <p className="text-lg font-semibold">{dashboardData ? dashboardData.pendingPosts : '0'}</p>
                            </Card>
                        </Col>
                    </Row>

                    {/* Biểu đồ doanh thu */}
                    <Card title={chartTitle} bordered={false} className="shadow-md">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    label={{ value: 'Tháng', position: 'insideBottomRight', offset: -10 }}
                                    tickFormatter={(month) => `Th${month}`}
                                />
                                <YAxis
                                    label={{
                                        value: 'Doanh thu (VND)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        dx: -5,
                                        dy: 50,
                                    }}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => `Tháng ${label}`}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Doanh thu"
                                    stroke="#1890ff"
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;