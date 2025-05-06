import { Layout, Dropdown, Avatar, Drawer, Button, Menu, Modal } from 'antd';
import { UserOutlined, MenuOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;

const AdminHeader = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [modalVisible, setModalVisible] = useState(false);

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
        logout(); // Gọi logout từ AuthContext
        setModalVisible(false);
        navigate('/');
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const adminMenuItems = [
        {
            key: '1',
            label: <Link to="/">Đến trang chủ</Link>,
        },
        {
            key: '2',
            label: <span onClick={showLogoutModal}>Đăng xuất</span>,
        },
    ];

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/admin" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        Dashboard
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center' }}>

                        {isMobile ? (
                            <>
                                <Button
                                    type="link"
                                    icon={<MenuOutlined />}
                                    onClick={showDrawer}
                                    style={{ marginRight: 8 }}
                                />
                                <Drawer
                                    title="Menu"
                                    placement="right"
                                    onClose={onClose}
                                    open={drawerVisible}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <Menu mode="inline" theme="light" items={adminMenuItems} />
                                </Drawer>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{user?.name || 'Admin'}</span>
                                <Dropdown menu={{ items: adminMenuItems }} trigger={['click']}>
                                    <Avatar
                                        src={avatarUrl}
                                        icon={!avatarUrl && <UserOutlined />}
                                        className="cursor-pointer"
                                    />
                                </Dropdown>
                            </div>
                        )}
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
        </>
    );
};

export default AdminHeader;