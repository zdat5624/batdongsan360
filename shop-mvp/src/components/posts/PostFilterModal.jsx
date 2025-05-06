import React, { useState, useEffect } from 'react';
import { Modal, Select, InputNumber, Input, Button } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const { Option } = Select;

const PostFilterModal = ({
    visible,
    onClose,
    typeFilter,
    setTypeFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minArea,
    setMinArea,
    maxArea,
    setMaxArea,
    categoryId,
    setCategoryId,
    vipId,
    setVipId,
    email,
    setEmail,
    setPagination,
}) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        typeFilter,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        categoryId,
        vipId,
        email,
    });

    // Fetch categories from API
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await axiosInstance.get('/api/categories', {
                params: {
                    page: 0,
                    size: 50,
                    sort: 'id,asc',
                },
            });
            const { content } = response.data.data;
            setCategories(content);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchCategories();
            setTempFilters({
                typeFilter,
                minPrice,
                maxPrice,
                minArea,
                maxArea,
                categoryId,
                vipId,
                email,
            });
        }
    }, [visible, typeFilter, minPrice, maxPrice, minArea, maxArea, categoryId, vipId, email]);

    // Filter categories based on typeFilter
    const filteredCategories = tempFilters.typeFilter
        ? categories.filter((category) => category.type === tempFilters.typeFilter)
        : categories;

    // Handle type change
    const handleTypeChange = (value) => {
        setTempFilters((prev) => ({ ...prev, typeFilter: value || null, categoryId: null }));
    };

    // Handle apply filters
    const handleApplyFilters = () => {
        setTypeFilter(tempFilters.typeFilter);
        setMinPrice(tempFilters.minPrice);
        setMaxPrice(tempFilters.maxPrice);
        setMinArea(tempFilters.minArea);
        setMaxArea(tempFilters.maxArea);
        setCategoryId(tempFilters.categoryId);
        setVipId(tempFilters.vipId);
        setEmail(tempFilters.email);
        setPagination((prev) => ({ ...prev, current: 1 }));
        onClose();
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setTempFilters({
            typeFilter: null,
            minPrice: null,
            maxPrice: null,
            minArea: null,
            maxArea: null,
            categoryId: null,
            vipId: null,
            email: null,
        });
    };

    // Handle cancel
    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal
            title="Lọc tin đăng"
            visible={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="reset" onClick={handleResetFilters} className="bg-red-500 hover:bg-red-600 border-none text-white">
                    Xóa bộ lọc
                </Button>,
                <Button key="cancel" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button key="apply" type="primary" onClick={handleApplyFilters}>
                    Áp dụng
                </Button>,
            ]}
            width={800}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Loại tin</label>
                        <Select
                            allowClear
                            placeholder="Lọc theo loại tin"
                            onChange={handleTypeChange}
                            value={tempFilters.typeFilter}
                            className="w-full"
                        >
                            <Option value={null}>Tất cả</Option>
                            <Option value="SALE">Tin bán</Option>
                            <Option value="RENT">Tin cho thuê</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giá tối thiểu</label>
                        <InputNumber
                            min={0}
                            placeholder="Giá tối thiểu"
                            className="w-full"
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, minPrice: value }))}
                            value={tempFilters.minPrice}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giá tối đa</label>
                        <InputNumber
                            min={0}
                            placeholder="Giá tối đa"
                            className="w-full"
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, maxPrice: value }))}
                            value={tempFilters.maxPrice}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diện tích tối thiểu</label>
                        <InputNumber
                            min={0}
                            placeholder="Diện tích tối thiểu"
                            className="w-full"
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, minArea: value }))}
                            value={tempFilters.minArea}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diện tích tối đa</label>
                        <InputNumber
                            min={0}
                            placeholder="Diện tích tối đa"
                            className="w-full"
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, maxArea: value }))}
                            value={tempFilters.maxArea}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                        <Select
                            allowClear
                            placeholder="Chọn danh mục"
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, categoryId: value || null }))}
                            value={tempFilters.categoryId}
                            className="w-full"
                            loading={loadingCategories}
                        >
                            {filteredCategories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">VIP ID</label>
                        <InputNumber
                            min={0}
                            placeholder="ID VIP"
                            className="w-full"
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, vipId: value }))}
                            value={tempFilters.vipId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email người dùng</label>
                        <Input
                            placeholder="Email người dùng"
                            className="w-full"
                            onChange={(e) => setTempFilters((prev) => ({ ...prev, email: e.target.value || null }))}
                            value={tempFilters.email}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PostFilterModal;