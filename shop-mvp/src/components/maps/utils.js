export const formatPrice = (price) => {
    if (!price) return 'N/A';
    const priceInMillions = price / 1000000; // Chuyển sang triệu

    if (priceInMillions >= 1000) {
        // Nếu giá >= 1 tỷ (1000 triệu)
        const priceInBillions = priceInMillions / 1000;
        return `${priceInBillions.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tỷ`;
    } else if (priceInMillions < 50) {
        // Nếu giá < 50 triệu, hiển thị 1 chữ số thập phân
        return `${priceInMillions.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} triệu`;
    } else {
        // Nếu giá từ 50 triệu đến dưới 1 tỷ, không hiển thị thập phân
        return `${priceInMillions.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} triệu`;
    }
};
