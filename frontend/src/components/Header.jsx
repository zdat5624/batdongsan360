import { Layout, Menu, Dropdown, Avatar, Button, Drawer, Modal } from 'antd';
import {
    UserOutlined,
    MenuOutlined,
    ExclamationCircleOutlined,
    HomeOutlined,
    KeyOutlined,
    PlusCircleOutlined,
    FileTextOutlined,
    BellOutlined,
    CreditCardOutlined,
    LockOutlined,
    SettingOutlined,
    LogoutOutlined,
    CrownOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBadge from './notifications/NotificationBadge';
import LoginModal from './LoginModal';

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;

const { Header } = Layout;

const HeaderComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [modalVisible, setModalVisible] = useState(false);
    const [loginModalVisible, setLoginModalVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onClose = () => {
        setDrawerVisible(false);
    };

    const showLogoutModal = () => {
        setModalVisible(true);
    };

    const handleLogout = () => {
        logout();
        setModalVisible(false);
        navigate('/');
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const showLoginModal = () => {
        setLoginModalVisible(true);
    };

    const handleLoginCancel = () => {
        setLoginModalVisible(false);
    };

    const handleLoginSuccess = () => {
        setLoginModalVisible(false);
    };

    const getSelectedKey = (path) => {
        if (path === '/') return 'home';
        if (path.startsWith('/sell')) return 'sell';
        if (path.startsWith('/rent')) return 'rent';
        if (path.startsWith('/create-post')) return 'create-post';
        if (path.startsWith('/posts')) return 'posts';
        if (path.startsWith('/notifications')) return 'notifications';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/change-password')) return 'change-password';
        if (path.startsWith('/payments')) return 'payments';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/vips')) return 'vips';
        return '';
    };

    const navItems = [
        {
            key: 'sell',
            label: <Link to="/sell">Bán</Link>,
            style: { minWidth: '95px', textAlign: 'center' },
        },
        {
            key: 'rent',
            label: <Link to="/rent">Thuê</Link>,
            style: { minWidth: '95px', textAlign: 'center' },
        },
    ];

    const baseUserMenuItems = [
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
            label: <Link to="/profile">Hồ sơ cá nhân</Link>,
        },
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: <Link to="/change-password">Đổi mật khẩu</Link>,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={showLogoutModal}>Đăng xuất</span>,
        },
    ];

    const userMenuItems = user?.role === 'ADMIN'
        ? [
            ...baseUserMenuItems.slice(0, 0),
            {
                key: 'admin',
                icon: <SettingOutlined />,
                label: <Link to="/admin">Quản trị</Link>,
            },
            ...baseUserMenuItems.slice(0),
        ]
        : baseUserMenuItems;

    const handleMenuClick = () => {
        onClose();
    };

    const avatarUrl = user?.avatar ? `${UPLOADS_URL}/${user.avatar}` : null;

    return (
        <>
            <Header
                style={{
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03),0 1px 6px -1px rgba(0, 0, 0, 0.02),0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                    padding: '0 24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                BĐS360
                            </Link>
                            {!isMobile && (
                                <Menu
                                    selectedKeys={[getSelectedKey(location.pathname)]}
                                    mode="horizontal"
                                    theme="light"
                                    items={navItems}
                                    style={{ marginLeft: 0, borderBottom: 'none' }}
                                />
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {isMobile ? (
                                <>
                                    <NotificationBadge />
                                    <Button
                                        type="link"
                                        icon={<MenuOutlined />}
                                        onClick={showDrawer}
                                        style={{ marginRight: 0 }}
                                    />
                                    <Drawer
                                        title="Menu"
                                        placement="right"
                                        onClose={onClose}
                                        open={drawerVisible}
                                    >
                                        <Menu
                                            selectedKeys={[getSelectedKey(location.pathname)]}
                                            mode="inline"
                                            theme="light"
                                            items={navItems}
                                            onClick={handleMenuClick}
                                        />
                                        <Menu
                                            selectedKeys={[getSelectedKey(location.pathname)]}
                                            mode="inline"
                                            theme="light"
                                            items={
                                                isAuthenticated
                                                    ? userMenuItems
                                                    : [
                                                        {
                                                            key: 'login',
                                                            label: <span onClick={showLoginModal}>Đăng nhập</span>,
                                                        },
                                                        {
                                                            key: 'register',
                                                            label: <Link to="/register">Đăng ký</Link>,
                                                        },
                                                    ]
                                            }
                                            onClick={handleMenuClick}
                                        />
                                    </Drawer>
                                </>
                            ) : isAuthenticated ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <NotificationBadge />
                                    <span>{user?.name || 'User'}</span>
                                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                                        <Avatar
                                            src={avatarUrl}
                                            icon={!avatarUrl && <UserOutlined />}
                                            className="cursor-pointer"
                                        />
                                    </Dropdown>
                                </div>
                            ) : (
                                <>
                                    <Button type="primary" onClick={showLoginModal} style={{ marginRight: 16 }}>
                                        Đăng nhập
                                    </Button>
                                    <Link to="/register">
                                        <Button>Đăng ký</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Header>

            <Modal
                title={
                    <div>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        Xác nhận đăng xuất
                    </div>
                }
                open={modalVisible}
                onOk={handleLogout}
                onCancel={handleCancel}
                okText="Đăng xuất"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc chắn muốn đăng xuất không?</p>
            </Modal>

            <LoginModal
                visible={loginModalVisible}
                onCancel={handleLoginCancel}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
};

export default HeaderComponent;