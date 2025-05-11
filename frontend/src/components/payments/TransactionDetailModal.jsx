import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import moment from 'moment';
import 'moment/locale/vi';

const TransactionDetailModal = ({ visible, onCancel, transaction }) => {
    if (!transaction) return null;

    return (
        <Modal
            title="Chi tiết giao dịch"
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            className="rounded-lg"
        >
            <Descriptions bordered column={1} labelStyle={{ width: '30%' }} contentStyle={{ width: '70%' }}>
                <Descriptions.Item label="Mã Giao dịch">{transaction.id}</Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    }).format(transaction.amount)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag
                        color={
                            transaction.status === 'SUCCESS'
                                ? 'green'
                                : transaction.status === 'FAILED'
                                    ? 'red'
                                    : 'yellow'
                        }
                    >
                        {transaction.status === 'SUCCESS'
                            ? 'Thành công'
                            : transaction.status === 'FAILED'
                                ? 'Thất bại'
                                : 'Đang xử lý'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">{transaction.description}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {moment(transaction.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                {transaction.txnId && (
                    <Descriptions.Item label="Mã giao dịch VNPAY">{transaction.txnId}</Descriptions.Item>
                )}


            </Descriptions>
        </Modal>
    );
};

export default TransactionDetailModal;