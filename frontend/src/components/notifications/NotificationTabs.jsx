import React from 'react';
import { Tabs, Badge } from 'antd';

const NotificationTabs = ({ activeTab, onTabChange, unreadCounts }) => {
    const totalUnread = unreadCounts.TRANSACTION + unreadCounts.SYSTEM_ALERT + unreadCounts.POST;

    const tabItems = [
        {
            key: 'ALL',
            label: (
                <span className="flex items-center text-sm ">
                    Tất cả{' '}
                    {totalUnread > 0 && (
                        <Badge
                            count={totalUnread}
                            className="ml-2"
                            style={{
                                fontSize: '10px',
                                width: '20px',
                                height: '20px',
                                lineHeight: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        />
                    )}
                </span>
            ),
        },
        {
            key: 'POST',
            label: (
                <span className="flex items-center text-sm">
                    Tin đăng{' '}
                    {unreadCounts.POST > 0 && (
                        <Badge
                            count={unreadCounts.POST}
                            className="ml-2"
                            style={{
                                fontSize: '10px',
                                width: '20px',
                                height: '20px',
                                lineHeight: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        />
                    )}
                </span>
            ),
        },
        {
            key: 'TRANSACTION',
            label: (
                <span className="flex items-center text-sm ">
                    Giao dịch{' '}
                    {unreadCounts.TRANSACTION > 0 && (
                        <Badge
                            count={unreadCounts.TRANSACTION}
                            className="ml-2"
                            style={{
                                fontSize: '10px',
                                width: '20px',
                                height: '20px',
                                lineHeight: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        />
                    )}
                </span>
            ),
            className: 'bg-white',
        },
        {
            key: 'SYSTEM_ALERT',
            label: (
                <span className="flex items-center text-sm">
                    Hệ thống{' '}
                    {unreadCounts.SYSTEM_ALERT > 0 && (
                        <Badge
                            count={unreadCounts.SYSTEM_ALERT}
                            className="ml-2"
                            style={{
                                fontSize: '10px',
                                width: '20px',
                                height: '20px',
                                lineHeight: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        />
                    )}
                </span>
            ),
        },
    ];

    return (
        <Tabs
            activeKey={activeTab}
            onChange={onTabChange}
            className="flex-1 "
            size="small"
            items={tabItems}
            type="card"
        />
    );
};

export default NotificationTabs;