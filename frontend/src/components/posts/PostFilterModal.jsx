import React, { useState, useEffect } from 'react';
import { Modal, Select, InputNumber, Input, Button, Switch } from 'antd';
import axiosInstance from '../../api/axiosConfig';
import { FilterOutlined } from '@ant-design/icons';

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
    search,
    setSearch,
    isDeleteByUser,
    setIsDeleteByUser,
    setPagination,
}) => {
    const [categories, setCategories] = useState([]);
    const [vips, setVips] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingVips, setLoadingVips] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        typeFilter,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        categoryId,
        vipId,
        search,
        isDeleteByUser,
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

    // Fetch vips from API
    const fetchVips = async () => {
        setLoadingVips(true);
        try {
            const response = await axiosInstance.get('/api/vips');
            const vipsData = response.data.data;
            setVips(vipsData);
        } catch (error) {
            console.error('Error fetching vips:', error);
        } finally {
            setLoadingVips(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchCategories();
            fetchVips();
            setTempFilters({
                typeFilter,
                minPrice,
                maxPrice,
                minArea,
                maxArea,
                categoryId,
                vipId,
                search,
                isDeleteByUser,
            });
        }
    }, [visible, typeFilter, minPrice, maxPrice, minArea, maxArea, categoryId, vipId, search, isDeleteByUser]);

    // Filter categories based on typeFilter
    const filteredCategories = tempFilters.typeFilter
        ? categories.filter((category) => category.type === tempFilters.typeFilter)
        : categories;

    // Handle type change
    const handleTypeChange = (value) => {
        setTempFilters((prev) => ({ ...prev, typeFilter: value || null, categoryId: null }));
    };

    // Handle category change and update typeFilter
    const handleCategoryChange = (value) => {
        const selectedCategory = categories.find((category) => category.id === value);
        const newTypeFilter = selectedCategory ? selectedCategory.type : tempFilters.typeFilter;
        setTempFilters((prev) => ({
            ...prev,
            categoryId: value || null,
            typeFilter: newTypeFilter,
        }));
    };

    // Handle vip change
    const handleVipChange = (value) => {
        setTempFilters((prev) => ({ ...prev, vipId: value || null }));
    };

    // Handle isDeleteByUser toggle
    const handleIsDeleteByUserChange = (checked) => {
        setTempFilters((prev) => ({ ...prev, isDeleteByUser: checked ? null : false }));
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
        setSearch(tempFilters.search);
        setIsDeleteByUser(tempFilters.isDeleteByUser);
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
            search: null,
            isDeleteByUser: false,
        });
    };

    // Handle cancel
    const handleCancel = () => {
        onClose();
    };

    // Formatter và parser cho dấu chấm hàng nghìn
    const numberFormatter = (value) => {
        if (!value && value !== 0) return '';
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const numberParser = (value) => {
        if (!value) return null;
        return Number(value.replace(/\./g, ''));
    };

    return (
        <Modal
            title={
                <span style={{ color: '##003eb3' }} className="flex items-center">
                    <FilterOutlined style={{ marginRight: 8 }} />
                    Lọc tin đăng
                </span>
            }

            visible={visible}

            onCancel={handleCancel}
            footer={[
                <Button
                    key="reset"
                    onClick={handleResetFilters}
                    className="bg-red-500 hover:bg-red-600 border-none text-white"
                >
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại tin:</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá tối thiểu:</label>
                        <InputNumber
                            min={0}
                            placeholder="Giá tối thiểu"
                            className="w-full"
                            formatter={numberFormatter}
                            parser={numberParser}
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, minPrice: value }))}
                            value={tempFilters.minPrice}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá tối đa:</label>
                        <InputNumber
                            min={0}
                            placeholder="Giá tối đa"
                            className="w-full"
                            formatter={numberFormatter}
                            parser={numberParser}
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, maxPrice: value }))}
                            value={tempFilters.maxPrice}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục:</label>
                        <Select
                            allowClear
                            placeholder="Chọn danh mục"
                            onChange={handleCategoryChange}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích tối thiểu:</label>
                        <InputNumber
                            min={0}
                            placeholder="Diện tích tối thiểu"
                            className="w-full"
                            formatter={numberFormatter}
                            parser={numberParser}
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, minArea: value }))}
                            value={tempFilters.minArea}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích tối đa:</label>
                        <InputNumber
                            min={0}
                            placeholder="Diện tích tối đa"
                            className="w-full"
                            formatter={numberFormatter}
                            parser={numberParser}
                            onChange={(value) => setTempFilters((prev) => ({ ...prev, maxArea: value }))}
                            value={tempFilters.maxArea}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gói VIP:</label>
                        <Select
                            allowClear
                            placeholder="Chọn gói VIP"
                            onChange={handleVipChange}
                            value={tempFilters.vipId}
                            className="w-full"
                            loading={loadingVips}
                        >
                            {vips.map((vip) => (
                                <Option key={vip.id} value={vip.id}>
                                    {vip.name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã tin hoặc Email:</label>
                        <Input
                            placeholder="Nhập mã tin hoặc email"
                            className="w-full"
                            allowClear
                            onChange={(e) => setTempFilters((prev) => ({ ...prev, search: e.target.value || null }))}
                            value={tempFilters.search}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hiển thị tin đã xóa:</label>
                        <Switch
                            checked={tempFilters.isDeleteByUser === null}
                            onChange={handleIsDeleteByUserChange}
                            checkedChildren="Bật"
                            unCheckedChildren="Tắt"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PostFilterModal;