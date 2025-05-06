import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../../contexts/AuthContext';

const NotificationText = ({ onRefresh }) => {
    const [lastNotificationTime, setLastNotificationTime] = useState(null);
    const [notificationText, setNotificationText] = useState('');
    const [error, setError] = useState(null);
    const [isUpdated, setIsUpdated] = useState(false);
    const [prevUnreadCount, setPrevUnreadCount] = useState(0);
    const { user, isAuthenticated } = useAuth();

    // Hàm tính thời gian tương đối
    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const diffMs = now - timestamp;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);

        if (diffSeconds < 10) return 'vài giây trước';
        if (diffMinutes < 1) return `${diffSeconds} giây trước`;
        if (diffMinutes < 5) return `${diffMinutes} phút trước`;
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 3) return `${diffHours} giờ trước`;
        return `${diffHours} giờ trước`;
    };

    // Kết nối WebSocket để nhận thông báo mới
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: { 'X-User-Id': user.id },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WebSocket connected for userId:', user.id);
                client.subscribe(`/user/${user.id}/user/notifications`, (message) => {
                    try {
                        const newUnreadCount = parseInt(message.body);
                        console.log('Received WebSocket message:', newUnreadCount);

                        // Chỉ cập nhật nếu newUnreadCount tăng so với prevUnreadCount
                        if (newUnreadCount > prevUnreadCount) {
                            const now = new Date();
                            setLastNotificationTime(now);
                            setNotificationText(`Bạn có thông báo mới vài giây trước`);
                            setIsUpdated(true);
                            setTimeout(() => setIsUpdated(false), 300);
                            setPrevUnreadCount(newUnreadCount); // Cập nhật prevUnreadCount
                            onRefresh && onRefresh(); // Gọi hàm onRefresh nếu có
                        } else if (newUnreadCount === 0) {
                            setNotificationText('');
                            setLastNotificationTime(null);
                            setPrevUnreadCount(0); // Reset prevUnreadCount
                        }
                    } catch (err) {
                        console.error('Error parsing WebSocket message:', err);
                        setError('Không thể cập nhật thông báo');
                    }
                });
            },
            onStompError: (error) => {
                console.error('WebSocket connection error:', error);
                setError('Không thể kết nối thông báo');
            },
            onWebSocketError: (error) => {
                console.error('WebSocket error:', error);
                setError('Lỗi kết nối WebSocket');
            },
            debug: (str) => console.log('STOMP: ' + str),
        });

        client.activate();

        return () => {
            client.deactivate().then(() => console.log('WebSocket disconnected'));
        };
    }, [isAuthenticated, user?.id]);

    // Cập nhật thời gian tương đối định kỳ
    useEffect(() => {
        if (!lastNotificationTime) return;

        const interval = setInterval(() => {
            setNotificationText(`Bạn có thông báo mới ${getRelativeTime(lastNotificationTime)}`);
        }, 5000);

        return () => clearInterval(interval);
    }, [lastNotificationTime]);

    return (
        <div className="relative inline-flex items-center justify-center p-2">
            {error ? (
                <span className="text-red-500 text-xs px-3 py-1.5">{error}</span>
            ) : notificationText ? (
                <span
                    className={`text-sm text-gray-700 italic rounded px-1 py-1.5 transition-all duration-300 ${isUpdated ? 'animate-pulse bg-red-500 text-white scale-105' : ''
                        }`}
                >
                    {notificationText}
                </span>
            ) : null}
        </div>
    );
};

export default NotificationText;