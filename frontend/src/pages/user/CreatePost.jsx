import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Modal, Spin, Row, Col, Card, Upload, Image } from 'antd';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils';
import MapSelector from '../../components/maps/MapSelector';

const { Option } = Select;
const { TextArea } = Input;

const CreatePost = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vips, setVips] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [totalCost, setTotalCost] = useState(0);
    const [fullAddress, setFullAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ latitude: 10.775844, longitude: 106.701756 });
    const [isUserModified, setIsUserModified] = useState(false);

    const province = Form.useWatch('province', form);
    const district = Form.useWatch('district', form);
    const ward = Form.useWatch('ward', form);
    const detailAddress = Form.useWatch('detailAddress', form);
    const vipPackage = Form.useWatch('vipPackage', form);
    const numberOfDays = Form.useWatch('numberOfDays', form);
    const price = Form.useWatch('price', form);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const provinceRes = await axiosInstance.get('/api/address/provinces');
                setProvinces(provinceRes.data.data);

                const categoryRes = await axiosInstance.get('/api/categories?page=0&size=50&sort=id,asc');
                setCategories(categoryRes.data.data.content);

                const vipRes = await axiosInstance.get('/api/vips');
                setVips(vipRes.data.data);
            } catch (error) {
                message.error('Không thể tải dữ liệu ban đầu');
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const listingType = form.getFieldValue('listingType') || 'SALE';
        const filtered = categories.filter((cat) => cat.type === listingType);
        setFilteredCategories(filtered);
        form.setFieldsValue({ category: undefined });
    }, [categories, form]);

    useEffect(() => {
        if (vipPackage && numberOfDays) {
            const selectedVip = vips.find((vip) => vip.id === parseInt(vipPackage));
            if (selectedVip) {
                const cost = selectedVip.pricePerDay * parseInt(numberOfDays);
                setTotalCost(cost);
            } else {
                setTotalCost(0);
            }
        } else {
            setTotalCost(0);
        }
    }, [vips, vipPackage, numberOfDays]);

    useEffect(() => {
        const provinceName = provinces.find((p) => p.code === parseInt(province))?.name || '';
        const districtName = districts.find((d) => d.code === parseInt(district))?.name || '';
        const wardName = wards.find((w) => w.code === parseInt(ward))?.name || '';
        const address = [wardName, districtName, provinceName].filter(Boolean).join(', ');
        // setFullAddress([detailAddress || '', address].filter(Boolean).join(', '));

        if (wardName && districtName && provinceName) {
            fetchCoordinates(address);
        }
    }, [provinces, districts, wards, province, district, ward]);

    useEffect(() => {
        const provinceName = provinces.find((p) => p.code === parseInt(province))?.name || '';
        const districtName = districts.find((d) => d.code === parseInt(district))?.name || '';
        const wardName = wards.find((w) => w.code === parseInt(ward))?.name || '';
        const address = [wardName, districtName, provinceName].filter(Boolean).join(', ');
        setFullAddress([detailAddress || '', address].filter(Boolean).join(', '));


    }, [provinces, districts, wards, province, district, ward, detailAddress]);

    const fetchCoordinates = async (address) => {
        try {
            const response = await axiosInstance.get(`/api/address/geocode?address=${encodeURIComponent(address)}`);
            if (response.data.statusCode === 200 && response.data.data) {
                const { latitude, longitude } = response.data.data;
                setCoordinates({ latitude, longitude });
                setIsUserModified(false);
            } else {
                message.error(response.data.message || 'Không tìm thấy tọa độ cho địa chỉ này');
                setCoordinates({ latitude: 10.775844, longitude: 106.701756 });
                setIsUserModified(false);
            }
        } catch (error) {
            message.error('Lỗi khi lấy tọa độ từ địa chỉ');
            setCoordinates({ latitude: 10.775844, longitude: 106.701756 });
            setIsUserModified(false);
        }
    };

    const handleListingTypeChange = () => {
        const listingType = form.getFieldValue('listingType');
        setFilteredCategories(categories.filter((cat) => cat.type === listingType));
        form.setFieldsValue({ category: undefined });
    };

    const handleProvinceChange = async (value) => {
        try {
            const response = await axiosInstance.get(`/api/address/districts/${value}`);
            setDistricts(response.data.data);
            setWards([]);
            form.setFieldsValue({ district: undefined, ward: undefined });
        } catch (error) {
            message.error('Không thể tải danh sách quận/huyện');
        }
    };

    const handleDistrictChange = async (value) => {
        try {
            const response = await axiosInstance.get(`/api/address/wards/${value}`);
            setWards(response.data.data);
            form.setFieldsValue({ ward: undefined });
        } catch (error) {
            message.error('Không thể tải danh sách phường/xã');
        }
    };

    const handleMapChange = ({ latitude, longitude }) => {
        setCoordinates({ latitude, longitude });
        setIsUserModified(true);
    };

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await axiosInstance.post('/api/upload/img', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.statusCode === 201 && response.data.data.uploaded.length > 0) {
                const uploadedFileName = response.data.data.uploaded[0];
                setImageUrls((prev) => {
                    const newImageUrls = [...prev, uploadedFileName];
                    form.setFieldsValue({ images: newImageUrls });
                    form.validateFields(['images']);
                    return newImageUrls;
                });
                return { url: uploadedFileName, orderIndex: imageUrls.length };
            } else {
                message.error('Tải hình ảnh lên thất bại.');
                return false;
            }
        } catch (err) {
            console.error('Lỗi khi tải hình ảnh:', err);
            message.error('Đã xảy ra lỗi khi tải hình ảnh lên.');
            return false;
        }
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Vui lòng chọn file ảnh!');
            return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return false;
        }
        if (imageUrls.length >= 16) {
            message.error('Tối đa 16 hình ảnh!');
            return false;
        }
        return true;
    };

    const handleRemoveImage = (index) => {
        setImageUrls((prev) => {
            const newImageUrls = prev.filter((_, i) => i !== index);
            form.setFieldsValue({ images: newImageUrls });
            form.validateFields(['images']);
            return newImageUrls;
        });
    };

    const moveImageUp = (index) => {
        if (index === 0) return;
        setImageUrls((prev) => {
            const newUrls = [...prev];
            [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
            form.setFieldsValue({ images: newUrls });
            form.validateFields(['images']);
            return newUrls;
        });
    };

    const moveImageDown = (index) => {
        if (index === imageUrls.length - 1) return;
        setImageUrls((prev) => {
            const newUrls = [...prev];
            [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
            form.setFieldsValue({ images: newUrls });
            form.validateFields(['images']);
            return newUrls;
        });
    };

    const onFinish = (values) => {
        Modal.confirm({
            title: 'Xác nhận đăng tin',
            content: `Bạn có chắc chắn đăng tin? Tài khoản của bạn sẽ bị trừ ${totalCost.toLocaleString('vi-VN')} VNĐ!`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                setLoading(true);
                try {
                    if (imageUrls.length < 4) {
                        message.error('Vui lòng chọn ít nhất 4 hình ảnh');
                        setLoading(false);
                        return;
                    }
                    if (imageUrls.length > 16) {
                        message.error('Tối đa 16 hình ảnh');
                        setLoading(false);
                        return;
                    }

                    if (!coordinates.latitude || !coordinates.longitude) {
                        message.error('Vui lòng chọn vị trí trên bản đồ');
                        setLoading(false);
                        return;
                    }

                    const uploadedImageUrls = imageUrls.map((fileName, index) => ({
                        url: fileName,
                        orderIndex: index,
                    }));
                    const selectedCategory = filteredCategories.find((cat) => cat.id === values.category);
                    if (selectedCategory.type !== values.listingType) {
                        throw new Error('Danh mục không khớp với loại tin đăng');
                    }

                    const payload = {
                        post: {
                            title: values.title,
                            description: values.description,
                            notifyOnView: true,
                            type: values.listingType,
                            price: parseInt(values.price.replace(/\D/g, '')),
                            area: parseFloat(values.area),
                            category: { id: selectedCategory.id },
                            vip: { id: parseInt(values.vipPackage) },
                            images: uploadedImageUrls,
                            province: { code: parseInt(values.province) },
                            district: { code: parseInt(values.district) },
                            ward: { code: parseInt(values.ward) },
                            detailAddress: values.detailAddress,
                            status: 'PENDING',
                            deletedByUser: false,
                            latitude: coordinates.latitude,
                            longitude: coordinates.longitude,
                        },
                        numberOfDays: parseInt(values.numberOfDays),
                    };

                    const response = await axiosInstance.post('/api/posts', payload);
                    if (response.data.statusCode === 201) {
                        message.success('Đăng tin thành công!');
                        setIsSuccessModalVisible(true);
                        form.resetFields(); // Reset form sau khi đăng tin thành công
                        setImageUrls([]); // Xóa danh sách ảnh
                        setFileList([]); // Xóa danh sách file upload
                    } else {
                        message.error(response.data.message || 'Lỗi khi đăng tin');
                    }
                } catch (error) {
                    if (error.response && error.response.data.statusCode === 400 && error.response.data.message === 'Số dư không đủ để thực hiện giao dịch') {
                        message.error('Số dư không đủ để thực hiện giao dịch. Vui lòng nạp thêm tiền vào tài khoản.');
                    } else {
                        message.error(error.response?.data?.message || error.message || 'Không thể đăng tin');
                    }
                } finally {
                    setLoading(false);
                }
            },
            onCancel: () => {
                message.info('Hủy đăng tin');
            },
        });
    };

    const handleModalOk = () => {
        setIsSuccessModalVisible(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-100 py-4 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <Card
                    title={<h2 className="text-2xl font-bold text-center text-blue-600">ĐĂNG TIN</h2>}
                    className="shadow-xl rounded-xl"
                >
                    <Spin spinning={loading}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{ listingType: 'SALE', numberOfDays: 10 }}
                        >
                            <Form.Item
                                label="Tiêu đề"
                                name="title"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                                <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Giá (VNĐ)"
                                        name="price"
                                        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                                        Rai>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Input
                                                placeholder="Nhập giá"
                                                style={{ flex: 1 }}
                                                addonAfter={formatPrice(price ? parseInt(price.replace(/\D/g, '')) : 0)}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    form.setFieldsValue({
                                                        price: new Intl.NumberFormat('vi-VN').format(value),
                                                    });
                                                }}
                                            />
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Diện tích (m²)"
                                        name="area"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập diện tích' },
                                            {
                                                validator: (_, value) =>
                                                    value > 0 ? Promise.resolve() : Promise.reject('Diện tích phải lớn hơn 0'),
                                            },
                                        ]}
                                    >
                                        <Input type="number" step="0.1" placeholder="Nhập diện tích" min="0.1" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Loại tin đăng"
                                        name="listingType"
                                        rules={[{ required: true, message: 'Vui lòng chọn loại tin đăng' }]}
                                    >
                                        <Select onChange={handleListingTypeChange}>
                                            <Option value="SALE">Bán</Option>
                                            <Option value="RENT">Cho thuê</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Danh mục"
                                        name="category"
                                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                                    >
                                        <Select placeholder="-- Chọn danh mục --">
                                            {filteredCategories.map((cat) => (
                                                <Option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Gói VIP"
                                        name="vipPackage"
                                        rules={[{ required: true, message: 'Vui lòng chọn gói VIP' }]}
                                    >
                                        <Select placeholder="-- Chọn gói VIP --">
                                            {vips.map((vip) => (
                                                <Option key={vip.id} value={vip.id}>
                                                    {vip.name} ({vip.pricePerDay.toLocaleString('vi-VN')} VNĐ/ngày)
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Số ngày hiển thị"
                                        name="numberOfDays"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số ngày' },
                                            {
                                                validator: (_, value) =>
                                                    value > 0 ? Promise.resolve() : Promise.reject('Số ngày phải lớn hơn 0'),
                                            },
                                        ]}
                                    >
                                        <Input type="number" min="1" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Tổng chi phí (VNĐ)">
                                <Input value={totalCost.toLocaleString('vi-VN')} readOnly />
                            </Form.Item>

                            <Form.Item
                                label="Mô tả"
                                name="description"
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                            >
                                <TextArea rows={10} placeholder="Nhập mô tả chi tiết" />
                            </Form.Item>

                            <h3 className="text-lg font-semibold text-blue-600 mb-4">Địa chỉ</h3>
                            <Row gutter={16}>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Tỉnh/Thành phố"
                                        name="province"
                                        rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                                    >
                                        <Select placeholder="-- Chọn --" onChange={handleProvinceChange}>
                                            {provinces.map((p) => (
                                                <Option key={p.code} value={p.code}>
                                                    {p.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Quận/Huyện"
                                        name="district"
                                        rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                                    >
                                        <Select
                                            placeholder="-- Chọn --"
                                            onChange={handleDistrictChange}
                                            disabled={!districts.length}
                                        >
                                            {districts.map((d) => (
                                                <Option key={d.code} value={d.code}>
                                                    {d.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        label="Phường/Xã"
                                        name="ward"
                                        rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                                    >
                                        <Select placeholder="-- Chọn --" disabled={!wards.length}>
                                            {wards.map((w) => (
                                                <Option key={w.code} value={w.code}>
                                                    {w.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Địa chỉ chi tiết (Số nhà, Đường/Phố)"
                                name="detailAddress"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
                            >
                                <Input placeholder="Nhập số nhà, đường/phố" />
                            </Form.Item>

                            <Form.Item label="Địa chỉ đầy đủ sẽ hiển thị như sau:">
                                <Input value={fullAddress} readOnly />
                            </Form.Item>

                            <Form.Item
                                label={`Vị trí trên bản đồ tọa độ (${coordinates.latitude != null ? coordinates.latitude.toFixed(6) : 'N/A'
                                    }, ${coordinates.longitude != null ? coordinates.longitude.toFixed(6) : 'N/A'
                                    })`}
                                name="coordinates"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!coordinates.latitude || !coordinates.longitude) {
                                                return Promise.reject('Vui lòng chọn vị trí hợp lệ trên bản đồ');
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <MapSelector
                                    latitude={coordinates.latitude}
                                    longitude={coordinates.longitude}
                                    onChange={handleMapChange}
                                    isUserModified={isUserModified}
                                    setIsUserModified={setIsUserModified}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Hình ảnh (từ 4 đến 16 hình)"
                                name="images"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn ảnh',
                                    },
                                    {
                                        validator: () => {
                                            if (imageUrls.length < 4) {
                                                return Promise.reject('Vui lòng chọn ít nhất 4 hình ảnh');
                                            }
                                            if (imageUrls.length > 16) {
                                                return Promise.reject('Tối đa 16 hình ảnh');
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, minHeight: 120 }}>
                                    {imageUrls.length > 0 ? (
                                        imageUrls.map((fileName, index) => (
                                            <div
                                                key={fileName}
                                                style={{
                                                    position: 'relative',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 4,
                                                    padding: 4,
                                                    backgroundColor: 'transparent',
                                                }}
                                            >
                                                <Image
                                                    src={`${import.meta.env.VITE_UPLOADS_URL}/${fileName}`}
                                                    alt={`Hình ảnh ${index}`}
                                                    width={100}
                                                    height={100}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column' }}>
                                                    <Button
                                                        type="link"
                                                        icon={<ArrowUpOutlined />}
                                                        onClick={() => moveImageUp(index)}
                                                        disabled={index === 0}
                                                    />
                                                    <Button
                                                        type="link"
                                                        icon={<ArrowDownOutlined />}
                                                        onClick={() => moveImageDown(index)}
                                                        disabled={index === imageUrls.length - 1}
                                                    />
                                                </div>
                                                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                                                    <Button
                                                        type="link"
                                                        danger
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ color: '#888', padding: '16px' }}>
                                            Chưa có hình ảnh nào được tải lên.
                                        </div>
                                    )}
                                </div>
                                <Upload
                                    fileList={fileList}
                                    customRequest={async ({ file, onSuccess, onError }) => {
                                        const uploadedImage = await handleUpload(file);
                                        if (uploadedImage) {
                                            onSuccess('ok');
                                        } else {
                                            onError('error');
                                        }
                                    }}
                                    onChange={handleChange}
                                    beforeUpload={beforeUpload}
                                    accept="image/*"
                                    multiple
                                    showUploadList={false}
                                >
                                    <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                                </Upload>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    size="large"
                                >
                                    Đăng Tin
                                </Button>
                            </Form.Item>
                        </Form>
                    </Spin>
                </Card>
            </div>

            <Modal
                title="Đăng Tin Thành Công"
                open={isSuccessModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalOk}
                okText="OK"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <p>Tin của bạn đã được đăng thành công!</p>
            </Modal>
        </motion.div>
    );
};

export default CreatePost;