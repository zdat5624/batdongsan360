import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../contexts/AuthContext';
import { Badge, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotificationBadge = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState(null);
    const [shouldShake, setShouldShake] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const prevUnreadCountRef = useRef(0); // Lưu giá trị unreadCount trước đó

    const token = localStorage.getItem('accessToken');

    // Lấy số lượng thông báo chưa đọc ban đầu
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8080/api/notifications/unread-count',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const unreadCount = response.data.data;
                if (typeof unreadCount !== 'number') throw new Error('Invalid unread count format');
                setUnreadCount(unreadCount);
                prevUnreadCountRef.current = unreadCount; // Khởi tạo giá trị ban đầu
            } catch (error) {
                // console.error('Error fetching notifications:', error);
                setError('Không thể tải thông báo');
            }
        };

        fetchNotifications();
    }, [isAuthenticated, user?.id, token]);

    // Theo dõi thay đổi unreadCount để kích hoạt hiệu ứng lắc khi tăng
    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current) {
            setShouldShake(true);
            // Reset hiệu ứng sau khi animation hoàn tất (0.5s)
            setTimeout(() => setShouldShake(false), 500);
        }
        prevUnreadCountRef.current = unreadCount; // Cập nhật giá trị trước đó
    }, [unreadCount]);

    // Kết nối WebSocket
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: { 'X-User-Id': user.id },
            reconnectDelay: 5000,
            onConnect: () => {
                // console.log('WebSocket connected for userId:', user.id);
                client.subscribe(`/user/${user.id}/topic/notifications`, (message) => {
                    try {
                        const newUnreadCount = parseInt(message.body);
                        // console.log('Received WebSocket message:', newUnreadCount);
                        setUnreadCount(newUnreadCount);
                    } catch (err) {
                        // console.error('Error parsing WebSocket message:', err);
                        setError('Không thể cập nhật thông báo');
                    }
                });
            },
            onStompError: (error) => {
                // console.error('WebSocket connection error:', error);
                setError('Không thể kết nối thông báo');
            },
            onWebSocketError: (error) => {
                // console.error('WebSocket error:', error);
                setError('Lỗi kết nối WebSocket');
            },
            debug: (str) => console.log('STOMP: ' + str),
        });

        client.activate();

        return () => {
            client.deactivate().then(() => console.log('WebSocket disconnected'));
        };
    }, [isAuthenticated, user?.id]);

    // Định nghĩa hiệu ứng rung lắc
    const shakeVariants = {
        shake: {
            rotate: [0, 15, -15, 15, -15, 0],
            transition: { duration: 0.5, ease: 'easeInOut' },
        },
        idle: {
            rotate: 0,
        },
    };

    if (!isAuthenticated) return null;

    return (
        <div>
            {error ? (
                <span style={{ color: 'red', fontSize: '14px' }}>{error}</span>
            ) : (
                <Link to="/notifications">
                    <Space>
                        <Badge
                            count={unreadCount}
                            offset={[1, 4]}
                            className='mr-1'
                            style={{
                                backgroundColor: '#f5222d',
                                fontSize: '10px',
                                width: '20px',
                                height: '20px',
                                lineHeight: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <motion.div
                                variants={shakeVariants}
                                initial="idle"
                                animate={shouldShake ? 'shake' : 'idle'}
                            >
                                <BellOutlined className="text-[26px] hover:text-blue-500" />
                            </motion.div>
                        </Badge>
                    </Space>
                </Link>
            )}
        </div>
    );
};

export default NotificationBadge;