// VipMarker.jsx
import React, { useState } from 'react';

const VipMarker = ({ price, formatPrice, vipId }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Xác định màu của ô "VIP" dựa trên vipId
    const vipColor = vipId === 2 ? '#FFD700' : vipId === 3 ? '#FF4500' : vipId === 4 ? '#FF4500' : '#FF4500'; // Mặc định là vàng nếu vipId > 4

    return (
        <div
            style={{
                position: 'relative',
                background: '#000000', // Màu đen cho nền
                color: 'white', // Chữ màu trắng
                padding: '1px 2px', // Kích thước Marker giữ nguyên
                borderRadius: '4px', // Bo tròn nhẹ
                cursor: 'pointer',
                fontWeight: 'bold',
                border: '1px solid white', // Viền trắng
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                fontSize: '12px', // Tăng kích thước chữ cho giá
                whiteSpace: 'nowrap',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)', // Hiệu ứng phóng to khi hover
                transition: 'transform 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                zIndex: 2,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span>{formatPrice(price)}</span>
            <span
                style={{
                    background: vipColor, // Màu của ô "VIP"
                    color: 'white',
                    padding: '3px 4px', // Điều chỉnh padding: tăng top/bottom lên 3px để cân đối
                    borderRadius: '3px',
                    fontSize: '10px', // Tăng kích thước chữ của "VIP"
                    lineHeight: '1', // Giữ nguyên lineHeight
                    textShadow: '0 0 1px rgba(0, 0, 0, 1)', // Thêm viền mờ màu đen để tăng độ tương phản
                }}
            >
                VIP
            </span>
            {/* Mũi nhọn phía dưới */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #000000', // Màu mũi nhọn khớp với nền (đen)
                    zIndex: 2,
                }}
            />
            {/* Viền trắng cho mũi nhọn */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-7px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid white', // Viền trắng
                    zIndex: 0,
                }}
            />
        </div>
    );
};

export default VipMarker;