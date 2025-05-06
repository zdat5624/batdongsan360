import React, { useEffect, useState } from 'react';
import { Result, Descriptions, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        // Lấy tham số từ URL
        const params = new URLSearchParams(location.search);
        const data = {
            status: params.get('status'),
            orderInfo: decodeURIComponent(params.get('orderInfo') || ''),
            paymentTime: params.get('paymentTime'),
            transactionId: params.get('transactionId'),
            totalPrice: params.get('totalPrice'),
            transactionStatus: params.get('transactionStatus'),
        };

        // Format dữ liệu
        if (data.paymentTime) {
            data.paymentTime = moment(data.paymentTime, 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm:ss');
        }
        if (data.totalPrice) {
            data.totalPrice = (parseInt(data.totalPrice) / 100).toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
            });
        }

        setPaymentData(data);
    }, [location.search]);

    if (!paymentData) {
        return <Spin tip="Đang tải kết quả thanh toán..." />;
    }

    const isSuccess = paymentData.status === '1';
    const isCancelled = paymentData.transactionStatus === '02';

    // Xác định trạng thái, icon, tiêu đề và mô tả
    let resultStatus, resultIcon, resultTitle, resultSubTitle, transactionStatusText;
    if (isSuccess) {
        resultStatus = 'success';
        resultIcon = <CheckCircleOutlined />;
        resultTitle = 'Thanh toán thành công!';
        resultSubTitle = 'Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ.';
        transactionStatusText = 'Thành công';
    } else if (isCancelled) {
        resultStatus = 'warning';
        resultIcon = <WarningOutlined />;
        resultTitle = 'Giao dịch đã hủy!';
        resultSubTitle = 'Giao dịch của bạn đã được hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần.';
        transactionStatusText = 'Thất bại';
    } else {
        resultStatus = 'error';
        resultIcon = <CloseCircleOutlined />;
        resultTitle = 'Thanh toán thất bại!';
        resultSubTitle = 'Giao dịch của bạn không thể hoàn tất. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.';
        transactionStatusText = 'Thất bại';
    }

    return (
        <div className="max-w-3xl mx-auto min-h-screen bg-white p-4 shadow-md rounded-lg">
            <Result
                className="m-0 p-0"
                status={resultStatus}
                icon={resultIcon}
                title={resultTitle}
                subTitle={resultSubTitle}
                extra={[
                    <Button
                        key="back"
                        type="primary"
                        onClick={() => navigate('/payments')}
                    >
                        Về trang thanh toán
                    </Button>,
                    <Button
                        key="home"
                        onClick={() => navigate('/')}
                    >
                        Về trang chủ
                    </Button>,
                ]}
            />
            <Descriptions
                title="Chi tiết giao dịch"
                bordered
                column={1}
                className="mt-6"
            >
                <Descriptions.Item label="Trạng thái">
                    {transactionStatusText}
                </Descriptions.Item>
                <Descriptions.Item label="Thông tin giao dịch">
                    {paymentData.orderInfo || 'Không có thông tin'}
                </Descriptions.Item>
                <Descriptions.Item label="Mã giao dịch VNPAY">
                    {paymentData.transactionId || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                    {paymentData.totalPrice || '0 VNĐ'}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian thanh toán">
                    {paymentData.paymentTime || 'Không có'}
                </Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default PaymentResult;