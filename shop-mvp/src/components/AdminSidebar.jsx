import { Layout, Menu } from 'antd';
import { UserOutlined, ShoppingOutlined, FileTextOutlined, MessageOutlined, LeftOutlined, RightOutlined, FolderOutlined, StarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
    {
        key: 'users',
        icon: <UserOutlined />,
        label: <Link to="/admin/users">Người dùng</Link>,
    },
    {
        key: 'vips',
        icon: <StarOutlined />,
        label: <Link to="/admin/vips">Gói VIP</Link>,
    },
    {
        key: 'categories',
        icon: <FolderOutlined />,
        label: <Link to="/admin/categories">Danh mục</Link>,
    },
    {
        key: 'payments',
        icon: <CreditCardOutlined />,
        label: <Link to="/admin/payments">Thanh toán</Link>,
    },
    {
        key: 'posts',
        icon: <FileTextOutlined />,
        label: <Link to="/admin/posts">Tin đăng</Link>,
    },
];

const AdminSidebar = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const location = useLocation();
    const getSelectedKey = (path) => {
        if (path.startsWith('/admin/users')) return 'users';
        if (path.startsWith('/admin/vips')) return 'vips';
        if (path.startsWith('/admin/categories')) return 'categories';
        if (path.startsWith('/admin/posts')) return 'posts';
        if (path.startsWith('/admin/payments')) return 'payments';
        return ''; // Mặc định
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={200}
            collapsedWidth={80}
            style={{ backgroundColor: '#fff' }}
            theme="light"
            trigger={
                <div style={{ backgroundColor: '#fff', textAlign: 'center' }}>
                    {collapsed ? (
                        <RightOutlined />
                    ) : (
                        <LeftOutlined />
                    )}
                </div>
            }
        >
            <Menu
                mode="inline"
                theme="light"
                items={menuItems}
                defaultSelectedKeys={['dashboard']}
                selectedKeys={[getSelectedKey(location.pathname)]}
            />
        </Sider>
    );
};

export default AdminSidebar;