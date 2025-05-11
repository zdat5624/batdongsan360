import React, { useState, useEffect } from 'react';
import { Modal, Input, Switch, Button, message, Typography, Radio } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const { Text } = Typography;

const PostApprovalModal = ({ visible, onCancel, post, onSuccess }) => {
    const [sendNotification, setSendNotification] = useState(true);
    const [customMessageEnabled, setCustomMessageEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [customMessage, setCustomMessage] = useState('');

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ duyệt';
            case 'REVIEW_LATER':
                return 'Duyệt lại sau';
            case 'APPROVED':
                return 'Đang hiển thị';
            case 'REJECTED':
                return 'Từ chối';
            case 'EXPIRED':
                return 'Hết hạn';
            default:
                return 'Không xác định';
        }
    };

    const getDefaultMessage = (status, action) => {
        const postId = post?.id || '?';
        if (action === 'APPROVE') {
            switch (status) {
                case 'PENDING':
                    return `Tin đăng mã '${postId}' của bạn đã được quản trị viên duyệt và hiện đã được hiển thị`;
                case 'REVIEW_LATER':
                    return `Tin đăng mã '${postId}' của bạn đã được quản trị viên xác thực lại và hiện đang tiếp tục hiển thị`;
                case 'REJECTED':
                    return `Tin đăng mã '${postId}' của bạn đã được quản trị viên duyệt lại và hiện đang được hiển thị`;
                default:
                    return '';
            }
        } else if (action === 'REJECT') {
            return `Tin đăng mã '${postId}' của bạn đã bị quản trị viên từ chối hiển thị, vui lòng kiểm tra lại`;
        }
        return '';
    };

    const getFinalMessage = () => {
        if (!selectedAction) return 'Vui lòng chọn hành động để xem tin nhắn';
        const defaultMessage = getDefaultMessage(post?.status, selectedAction);
        return customMessageEnabled && customMessage.trim()
            ? `${defaultMessage}. ${customMessage.trim()}`
            : defaultMessage;
    };

    useEffect(() => {
        if (visible) {
            // Reset all states when modal opens
            setSendNotification(true);
            setCustomMessageEnabled(false);
            setSelectedAction(null);
            setCustomMessage('');
        }
    }, [visible]);

    const handleCancel = () => {
        // Reset all states when modal closes
        setSendNotification(true);
        setCustomMessageEnabled(false);
        setSelectedAction(null);
        setCustomMessage('');
        onCancel();
    };

    const handleSubmit = async () => {
        if (!selectedAction) {
            message.error('Vui lòng chọn hành động Chấp nhận hoặc Từ chối!');
            return;
        }

        if (customMessageEnabled && sendNotification && !customMessage.trim()) {
            message.error('Bạn đang bật thông báo tùy chỉnh. Vui lòng nhập nội dung tùy chỉnh nếu gửi thông báo');
            return;
        }

        try {
            setLoading(true);
            const status = selectedAction === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            const defaultMessage = getDefaultMessage(post?.status, selectedAction);
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
                message.success('Cập nhật trạng thái tin đăng thành công!');
                onSuccess(post?.id, status);
                handleCancel();
            } else {
                message.error('Cập nhật trạng thái thất bại!');
            }
        } catch (error) {
            console.error('Error updating post status:', error);
            message.error(error.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const isApproveDisabled = !['PENDING', 'REVIEW_LATER', 'REJECTED'].includes(post?.status);
    const isRejectDisabled = !['PENDING', 'REVIEW_LATER', 'APPROVED'].includes(post?.status);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Duyệt tin đăng mã {post?.id || '?'}</span>
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
                    disabled={!selectedAction}
                >
                    Duyệt
                </Button>,
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Hành động</label>
                    <Radio.Group
                        onChange={(e) => setSelectedAction(e.target.value)}
                        value={selectedAction}
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <Radio.Button
                            value="APPROVE"
                            disabled={isApproveDisabled}
                            style={{
                                width: '100px',
                                textAlign: 'center',
                                backgroundColor: selectedAction === 'APPROVE' ? '#52c41a' : 'transparent',
                                color: selectedAction === 'APPROVE' ? '#fff' : '#52c41a',
                            }}
                        >
                            Chấp nhận
                        </Radio.Button>
                        <Radio.Button
                            value="REJECT"
                            disabled={isRejectDisabled}
                            style={{
                                width: '100px',
                                textAlign: 'center',
                                backgroundColor: selectedAction === 'REJECT' ? '#ff4d4f' : 'transparent',
                                color: selectedAction === 'REJECT' ? '#fff' : '#ff4d4f',
                            }}
                        >
                            Từ chối
                        </Radio.Button>
                    </Radio.Group>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Trạng thái hiện tại</label>
                    <Input value={getStatusText(post?.status)} disabled />
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

export default PostApprovalModal;