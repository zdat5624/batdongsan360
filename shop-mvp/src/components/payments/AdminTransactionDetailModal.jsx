import { Button, Modal, Descriptions, Tag } from 'antd';
import moment from 'moment';

const AdminTransactionDetailModal = ({ visible, transaction, onClose, formatAmount, formatStatus, formatType }) => {
    return (
        <Modal
            title="Chi tiết giao dịch"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
            style={{ top: '30px', }}

            width={1000}

        >
            {transaction && (
                <>
                    <Descriptions bordered style={{ marginBottom: '20px' }} column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                        <Descriptions.Item label="Mã giao dịch">{transaction.id}</Descriptions.Item>
                        <Descriptions.Item label="Số tiền">{formatAmount(transaction.amount)}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả">{transaction.description}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">{formatStatus(transaction.status)}</Descriptions.Item>
                        <Descriptions.Item label="Loại">{formatType(transaction.amount)}</Descriptions.Item>
                        <Descriptions.Item label="Mã VNPAY">{transaction.txnId || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {moment(transaction.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">
                            {transaction.updatedAt
                                ? moment(transaction.updatedAt).format('DD/MM/YYYY HH:mm:ss')
                                : '-'}
                        </Descriptions.Item>

                    </Descriptions>

                    <Descriptions title="Thông tin người dùng" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>

                        <Descriptions.Item label="ID">{transaction.user.id}</Descriptions.Item>
                        <Descriptions.Item label="Tên">{transaction.user.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{transaction.user.email}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{transaction.user.role}</Descriptions.Item>
                        <Descriptions.Item label="Giới tính">{transaction.user.gender}</Descriptions.Item>
                        <Descriptions.Item label="Số dư">{formatAmount(transaction.user.balance)}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{transaction.user.phone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{transaction.user.address}</Descriptions.Item>
                    </Descriptions>
                </>


            )}
        </Modal>
    );
};

export default AdminTransactionDetailModal;