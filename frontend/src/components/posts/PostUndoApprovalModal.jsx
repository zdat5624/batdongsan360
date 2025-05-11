import React, { useState, useEffect } from 'react';
import { Modal, Switch, Button, message, Typography, Tag } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const { Text } = Typography;

const PostUndoApprovalModal = ({ visible, onCancel, post, onSuccess }) => {
    const [sendNotification, setSendNotification] = useState(false);
    const [customMessageEnabled, setCustomMessageEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [customMessage, setCustomMessage] = useState('');

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return { text: 'Chờ duyệt', color: 'gold' };
            case 'REVIEW_LATER':
                return { text: 'Duyệt lại sau', color: 'orange' };
            case 'APPROVED':
                return { text: 'Đang hiển thị', color: 'green' };
            case 'REJECTED':
                return { text: 'Từ chối', color: 'red' };
            case 'EXPIRED':
                return { text: 'Hết hạn', color: 'geekblue' };
            default:
                return { text: 'Không xác định', color: 'blue' };
        }
    };

    const getDefaultMessage = (action) => {
        const postId = post?.id || '?';
        if (action === 'PENDING') {
            return `Tin đăng mã '${postId}' của bạn đã được quản trị viên thu hồi phê duyệt để xem xét lại, trạng thái hiện tại là Chờ duyệt`;
        } else if (action === 'REVIEW_LATER') {
            return `Tin đăng mã '${postId}' của bạn đã được quản trị viên thu hồi phê duyệt để xem xét lại, trạng thái hiện tại là duyệt lại sau`;
        }
        return '';
    };

    const getFinalMessage = () => {
        if (!selectedAction) return 'Không có hành động được chọn';
        const defaultMessage = getDefaultMessage(selectedAction);
        return customMessageEnabled && customMessage.trim()
            ? `${defaultMessage}. ${customMessage.trim()}`
            : defaultMessage;
    };

    useEffect(() => {
        if (visible) {
            // Set selectedAction based on vip.vipLevel
            const defaultAction = post?.vip?.vipLevel === 1 ? 'PENDING' : 'REVIEW_LATER';
            setSelectedAction(defaultAction);
            setSendNotification(false);
            setCustomMessageEnabled(false);
            setCustomMessage('');
        }
    }, [visible, post]);

    const handleCancel = () => {
        setSendNotification(false);
        setCustomMessageEnabled(false);
        setSelectedAction(null);
        setCustomMessage('');
        onCancel();
    };

    const handleSubmit = async () => {
        if (!selectedAction) {
            message.error('Hành động không được xác định!');
            return;
        }

        if (customMessageEnabled && sendNotification && !customMessage.trim()) {
            message.error('Vui lòng nhập nội dung tùy chỉnh nếu gửi thông báo');
            return;
        }

        try {
            setLoading(true);
            const status = selectedAction;
            const defaultMessage = getDefaultMessage(selectedAction);
            const finalMessage = customMessageEnabled && customMessage.trim()
                ? `${defaultMessage}. ${customMessage.trim()}`
                : defaultMessage;

            if (sendNotification && !finalMessage) {
                throw new Error('Tin nhắn không được để trống khi gửi thông báo');
            }

            const payload = {
                postId: post?.id,
                status,
                message: finalMessage,
                sendNotification,
            };

            const response = await axiosInstance.put('/api/admin/posts/status', payload);
            if (response.data.statusCode === 200) {
                message.success('Hoàn tác trạng thái tin đăng thành công!');
                onSuccess(post?.id, status);
                handleCancel();
            } else {
                message.error('Hoàn tác trạng thái thất bại!');
            }
        } catch (error) {
            console.error('Error undoing post status:', error);
            message.error(error.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const isUndoDisabled = !['APPROVED', 'REJECTED'].includes(post?.status);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Hoàn tác duyệt tin đăng mã {post?.id || '?'}</span>
                    <Switch
                        checked={sendNotification}
                        onChange={(checked) => {
                            setSendNotification(checked);
                            if (!checked) {
                                setCustomMessageEnabled(false);
                                setCustomMessage('');
                            }
                        }}
                        checkedChildren="Gửi thông báo"
                        unCheckedChildren="Không gửi"
                        style={{ marginRight: '32px' }}
                    />
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={!selectedAction || isUndoDisabled}
                >
                    Xác nhận
                </Button>,
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Hoàn tác thành</label>
                    <Tag color={getStatusText(selectedAction).color} style={{ fontWeight: 'semibold' }}>
                        {getStatusText(selectedAction).text}
                    </Tag>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Trạng thái hiện tại</label>
                    <Tag color={getStatusText(post?.status).color} style={{ fontWeight: 'semibold' }}>
                        {getStatusText(post?.status).text}
                    </Tag>
                </div>
                {selectedAction && sendNotification && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Tin nhắn gửi đến người dùng</label>
                        <div
                            style={{
                                padding: '12px',
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Text>{getFinalMessage()}</Text>
                        </div>
                    </div>
                )}
                {selectedAction && sendNotification && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Tin nhắn tùy chỉnh</label>
                        <Switch
                            checked={customMessageEnabled}
                            onChange={setCustomMessageEnabled}
                            disabled={!sendNotification}
                        />
                    </div>
                )}
                {selectedAction && sendNotification && customMessageEnabled && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Nội dung tin nhắn tùy chỉnh</label>
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập nội dung tùy chỉnh (sẽ được nối với tin nhắn mặc định)"
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PostUndoApprovalModal;