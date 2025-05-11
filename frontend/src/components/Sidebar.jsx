import { Layout, Menu, Avatar, Typography, Space } from 'antd';
import {
    PlusCircleOutlined,
    FileTextOutlined,
    BellOutlined,
    UserOutlined,
    CreditCardOutlined,
    LockOutlined,
    LeftOutlined,
    RightOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
    {
        key: 'create-post',
        icon: <PlusCircleOutlined />,
        label: <Link to="/create-post">Đăng tin</Link>,
    },
    {
        key: 'posts',
        icon: <FileTextOutlined />,
        label: <Link to="/posts">Quản lý tin đăng</Link>,
    },
    {
        key: 'notifications',
        icon: <BellOutlined />,
        label: <Link to="/notifications">Thông báo</Link>,
    },
    {
        key: 'payments',
        icon: <CreditCardOutlined />,
        label: <Link to="/payments">Thanh toán</Link>,
    },
    {
        key: 'vips',
        icon: <StarOutlined />,
        label: <Link to="/vips">Gói VIP</Link>,
    },
    {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Thông tin cá nhân</Link>,
    },

    {
        key: 'change-password',
        icon: <LockOutlined />,
        label: <Link to="/change-password">Đổi mật khẩu</Link>,
    },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getSelectedKey = (path) => {
        if (path.startsWith('/create-post')) return 'create-post';
        if (path.startsWith('/posts')) return 'posts';
        if (path.startsWith('/notifications')) return 'notifications';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/payments')) return 'payments';
        if (path.startsWith('/change-password')) return 'change-password';
        return '';
    };

    const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;
    const avatarUrl = user?.avatar ? `${UPLOADS_URL}/${user.avatar}` : null;

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={200}
            collapsedWidth={80}
            theme="light"
            trigger={
                <div style={{ textAlign: 'center', padding: 4 }}>
                    {collapsed ? <RightOutlined /> : <LeftOutlined />}
                </div>
            }
        >
            {/* Phần hiển thị tên và avatar của user */}
            <div style={{ padding: collapsed ? '16px 8px' : '16px', textAlign: 'center' }}>
                <Space direction="vertical" align="center">
                    <Avatar
                        size={collapsed ? 40 : 64}
                        src={avatarUrl}
                        icon={<UserOutlined />}
                        style={{ marginBottom: 8 }}
                    />
                    {!collapsed && (
                        <Text strong style={{ fontSize: 16 }}>
                            {user?.name || 'User'}
                        </Text>
                    )}
                </Space>
            </div>

            <Menu
                mode="inline"
                theme="light"
                items={menuItems}
                defaultSelectedKeys={['create-post']}
                selectedKeys={[getSelectedKey(location.pathname)]}
            />
        </Sider>
    );
};

export default Sidebar;