// DotMarker.jsx (giữ nguyên)
import React, { useState } from 'react';

const DotMarker = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{
                width: isHovered ? '16px' : '12px',
                height: isHovered ? '16px' : '12px',
                backgroundColor: 'black',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 0,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    );
};

export default DotMarker;