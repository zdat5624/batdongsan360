// PriceMarker.jsx
import React, { useState } from 'react';

const PriceMarker = ({ price, formatPrice }) => {
    const [isHovered, setIsHovered] = useState(false);

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
                zIndex: 1,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {formatPrice(price)}
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
                    zIndex: 1,
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

export default PriceMarker;