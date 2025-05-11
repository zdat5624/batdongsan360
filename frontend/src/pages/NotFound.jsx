import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="404"
            title="404"
            subTitle="Xin lỗi, tài nguyên bạn yêu cầu không tồn tại."
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    Quay lại Trang chủ
                </Button>
            }
        />
    );
};

export default NotFound;