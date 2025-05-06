import React, { useState, useEffect } from "react";
import { Form, Input, Button, Modal, Select, Space } from "antd";
import { SearchOutlined, FilterOutlined, RedoOutlined } from "@ant-design/icons";
import apiServices from "../services/apiServices";

const SearchForm = ({ onSearch, hideTransactionType, projects = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000000000000000]);
  const [areaRange, setAreaRange] = useState([0, 1000000000]);
  const [location, setLocation] = useState({
    provinceCode: null,
    districtCode: null,
    wardCode: null,
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [categoryLabel, setCategoryLabel] = useState("Loại nhà đất");
  const [priceLabel, setPriceLabel] = useState("Mức giá");
  const [areaLabel, setAreaLabel] = useState("Diện tích");
  const [locationLabel, setLocationLabel] = useState("Vị trí");
  const [searchText, setSearchText] = useState("");

  const isSellPage = window.location.pathname.includes("/sell");
  const isRentPage = window.location.pathname.includes("/rent");
  const isHomePage = !isSellPage && !isRentPage;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const types = isHomePage ? ["SALE", "RENT"] : [isSellPage ? "SALE" : "RENT"];
        const categoriesData = [];
        for (const type of types) {
          const response = await apiServices.get(`/api/categories?page=0&size=30&sort=id,asc&type=${type}`);
          if (response.data.statusCode === 200) {
            categoriesData.push(...response.data.data.content);
          }
        }
        setCategories(categoriesData);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách categories:", err);
        alert("Có lỗi xảy ra khi tải danh sách loại nhà đất. Vui lòng thử lại sau.");
      }
    };
    fetchCategories();
  }, [isSellPage, isRentPage, isHomePage]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await apiServices.get(`/api/address/provinces`);
        if (response.data.statusCode === 200) {
          setProvinces(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách tỉnh:", err);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (location.provinceCode) {
        try {
          const response = await apiServices.get(`/api/address/districts/${location.provinceCode}`);
          if (response.data.statusCode === 200) {
            setDistricts(response.data.data);
            setLocation((prev) => ({ ...prev, districtCode: null, wardCode: null }));
            setWards([]);
            const selectedProvince = provinces.find((p) => p.code === location.provinceCode);
            setLocationLabel(selectedProvince ? selectedProvince.name : "Vị trí");
          }
        } catch (err) {
          console.error("Lỗi khi lấy danh sách quận/huyện:", err);
        }
      } else {
        setDistricts([]);
        setWards([]);
        setLocation((prev) => ({ ...prev, districtCode: null, wardCode: null }));
        setLocationLabel("Vị trí");
      }
    };
    fetchDistricts();
  }, [location.provinceCode, provinces]);

  useEffect(() => {
    const fetchWards = async () => {
      if (location.districtCode) {
        try {
          const response = await apiServices.get(`/api/address/wards/${location.districtCode}`);
          if (response.data.statusCode === 200) {
            setWards(response.data.data);
            setLocation((prev) => ({ ...prev, wardCode: null }));
            const selectedDistrict = districts.find((d) => d.code === location.districtCode);
            setLocationLabel(selectedDistrict ? selectedDistrict.name : "Vị trí");
          }
        } catch (err) {
          console.error("Lỗi khi lấy danh sách phường/xã:", err);
        }
      } else {
        setWards([]);
        setLocation((prev) => ({ ...prev, wardCode: null }));
        const selectedProvince = provinces.find((p) => p.code === location.provinceCode);
        setLocationLabel(selectedProvince ? selectedProvince.name : "Vị trí");
      }
    };
    fetchWards();
  }, [location.districtCode, districts]);

  useEffect(() => {
    const hasCategory = categoryLabel !== "Loại nhà đất";
    const hasPrice = priceLabel !== "Mức giá" && priceLabel !== "Tất cả mức giá";
    const hasArea = areaLabel !== "Diện tích" && areaLabel !== "Tất cả diện tích";
    const hasLocation = locationLabel !== "Vị trí";

    const filters = [];
    if (hasPrice) filters.push(priceLabel.toLowerCase());
    if (hasArea) filters.push(areaLabel.replace("Diện tích: ", "").toLowerCase());
    if (hasLocation) {
      const formatted = locationLabel.charAt(0).toLowerCase() + locationLabel.slice(1);
      filters.push(formatted);
    }


    let baseText = "";
    if (!hasCategory && !hasPrice && !hasArea && !hasLocation) {
      if (isSellPage) {
        baseText = "Tìm tất cả tin bán bất động sản";
      } else if (isRentPage) {
        baseText = "Tìm tất cả tin cho thuê bất động sản";
      }
    } else {
      const transactionType = isSellPage ? "bán" : "cho thuê";
      if (hasCategory) {
        baseText = `Tìm tin: ${categoryLabel.toLowerCase()}`;
        if (filters.length > 0) {
          baseText += `, ${filters.join(", ")}`;
        }
      } else {
        baseText = `Tìm tin ${transactionType}: ${filters.join(", ")}`;
      }
    }

    setSearchText(baseText || "Tìm kiếm bất động sản");
  }, [categoryLabel, priceLabel, areaLabel, locationLabel, isSellPage, isRentPage]);

  const handleCategoryChange = (categoryId) => {
    const id = categoryId ? parseInt(categoryId) : null;
    setSelectedCategoryId(id);
    const selectedCategory = categories.find((c) => c.id === id);
    setCategoryLabel(selectedCategory ? selectedCategory.name : "Loại nhà đất");
  };

  const handlePriceOptionChange = (index) => {
    const option = priceOptions[index];
    setPriceRange([option.min, option.max]);
    setPriceLabel(option.label);
  };

  const handleAreaOptionChange = (index) => {
    const option = areaOptions[index];
    setAreaRange([option.min, option.max]);
    setAreaLabel(`Diện tích: ${option.label}`);
  };

  const handleLocationChange = (name, value) => {
    const newLocation = { ...location, [name]: value ? parseInt(value) : null };
    setLocation(newLocation);

    if (name === "wardCode" && value) {
      const selectedWard = wards.find((w) => w.code === parseInt(value));
      setLocationLabel(selectedWard ? selectedWard.name : "Vị trí");
    } else if (name === "districtCode" && value) {
      const selectedDistrict = districts.find((d) => d.code === parseInt(value));
      setLocationLabel(selectedDistrict ? selectedDistrict.name : "Vị trí");
    } else if (name === "provinceCode" && value) {
      const selectedProvince = provinces.find((p) => p.code === parseInt(value));
      setLocationLabel(selectedProvince ? selectedProvince.name : "Vị trí");
    } else {
      setLocationLabel("Vị trí");
    }
  };

  const handleSearch = () => {
    const searchData = {
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minArea: areaRange[0],
      maxArea: areaRange[1],
      provinceCode: location.provinceCode || null,
      districtCode: location.districtCode || null,
      wardCode: location.wardCode || null,
      categoryId: selectedCategoryId,
      type: isSellPage ? "SALE" : isRentPage ? "RENT" : "SALE",
    };
    onSearch(searchData);
  };

  const handleReset = () => {
    setPriceRange([0, 50000000000000000]);
    setAreaRange([0, 1000000000]);
    setLocation({ provinceCode: null, districtCode: null, wardCode: null });
    setDistricts([]);
    setWards([]);
    setSelectedCategoryId(null);
    setCategoryLabel("Loại nhà đất");
    setPriceLabel("Mức giá");
    setAreaLabel("Diện tích");
    setLocationLabel("Vị trí");
    onSearch({
      minPrice: 0,
      maxPrice: 50000000000000000,
      minArea: 0,
      maxArea: 1000000000,
      provinceCode: null,
      districtCode: null,
      wardCode: null,
      categoryId: null,
      type: isSellPage ? "SALE" : isRentPage ? "RENT" : "SALE",
    });
    setShowModal(false);
  };

  const resetCategory = () => {
    setSelectedCategoryId(null);
    setCategoryLabel("Loại nhà đất");
  };

  const resetPrice = () => {
    setPriceRange([0, 50000000000000000]);
    setPriceLabel("Mức giá");
  };

  const resetArea = () => {
    setAreaRange([0, 1000000000]);
    setAreaLabel("Diện tích");
  };

  const resetLocation = () => {
    setLocation({ provinceCode: null, districtCode: null, wardCode: null });
    setDistricts([]);
    setWards([]);
    setLocationLabel("Vị trí");
  };

  const allPriceOptions = {
    sell: [
      { label: "Tất cả mức giá", min: 0, max: 50000000000000000 },
      { label: "Dưới 500 triệu", min: 0, max: 500000000 },
      { label: "500 - 800 triệu", min: 500000000, max: 800000000 },
      { label: "800 triệu - 1 tỷ", min: 800000000, max: 1000000000 },
      { label: "1 - 2 tỷ", min: 1000000000, max: 2000000000 },
      { label: "2 - 3 tỷ", min: 2000000000, max: 3000000000 },
      { label: "3 - 5 tỷ", min: 3000000000, max: 5000000000 },
      { label: "5 - 7 tỷ", min: 5000000000, max: 7000000000 },
      { label: "7 - 10 tỷ", min: 7000000000, max: 10000000000 },
      { label: "10 - 20 tỷ", min: 10000000000, max: 20000000000 },
      { label: "20 - 30 tỷ", min: 20000000000, max: 30000000000 },
      { label: "30 - 40 tỷ", min: 30000000000, max: 40000000000 },
      { label: "40 - 60 tỷ", min: 40000000000, max: 60000000000 },
      { label: "Trên 60 tỷ", min: 60000000000, max: 50000000000000000 },
    ],
    rent: [
      { label: "Tất cả mức giá", min: 0, max: 50000000000000000 },
      { label: "Dưới 1 triệu", min: 0, max: 1000000 },
      { label: "1 - 3 triệu", min: 1000000, max: 3000000 },
      { label: "3 - 5 triệu", min: 3000000, max: 5000000 },
      { label: "5 - 10 triệu", min: 5000000000, max: 10000000 },
      { label: "10 - 40 triệu", min: 10000000, max: 40000000 },
      { label: "40 - 70 triệu", min: 40000000, max: 70000000 },
      { label: "70 - 100 triệu", min: 70000000, max: 100000000 },
      { label: "Trên 100 triệu", min: 100000000, max: 50000000000000000 },
    ],
  };

  const priceOptions = isSellPage
    ? allPriceOptions.sell
    : isRentPage
      ? allPriceOptions.rent
      : [...allPriceOptions.sell, ...allPriceOptions.rent];

  const areaOptions = [
    { label: "Tất cả diện tích", min: 0, max: 1000000000 },
    { label: "Dưới 30 m²", min: 0, max: 30 },
    { label: "30 - 50 m²", min: 30, max: 50 },
    { label: "50 - 80 m²", min: 50, max: 80 },
    { label: "80 - 100 m²", min: 80, max: 100 },
    { label: "100 - 150 m²", min: 100, max: 150 },
    { label: "150 - 200 m²", min: 150, max: 200 },
    { label: "200 - 250 m²", min: 200, max: 250 },
    { label: "250 - 300 m²", min: 250, max: 300 },
    { label: "300 - 500 m²", min: 300, max: 500 },
    { label: "Trên 500 m²", min: 500, max: 1000000000 },
  ];

  const filteredCategories = categories.filter((category) => {
    if (isSellPage) return category.type === "SALE";
    if (isRentPage) return category.type === "RENT";
    return true;
  });

  return (
    <div className="p-3 bg-blue-50">
      <Input.Group className="flex items-center bg-white border border-blue-500 rounded shadow-sm overflow-hidden">
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          className="flex items-center justify-center w-15 h-10 bg-blue-500 border-none rounded-none text-white hover:bg-blue-600 transition-colors"
          style={{ width: "40px" }}
        />
        <Input
          value={searchText}
          readOnly
          onClick={() => setShowModal(true)}
          className="flex-1 h-10 border-none bg-transparent cursor-pointer px-3 text-base text-gray-700 focus:outline-none focus:shadow-none"
        />
        <Button
          icon={<FilterOutlined />}
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center h-10 px-4 bg-transparent border-none border-l border-blue-500 text-blue-500 font-medium hover:bg-gray-100 transition-colors"
        >
          LỌC
        </Button>
      </Input.Group>

      <Modal
        title="Bộ lọc tìm kiếm"
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          handleSearch();
        }}
        footer={[
          <Button key="reset" onClick={handleReset}>
            Đặt lại tất cả
          </Button>,
          <Button key="apply" type="primary" onClick={handleSearch}>
            Áp dụng
          </Button>,
        ]}
        width={450}
        style={{ top: "5%" }}
        className="max-w-[450px] rounded-lg"
        styles={{
          header: { borderBottom: "1px solid #e0e0e0" },
          content: { borderRadius: "8px" },
          footer: { borderTop: "1px solid #e0e0e0", padding: "10px 16px" },
        }}
      >
        <Form layout="vertical" className="space-y-4">
          <div className="relative">
            <Form.Item label="Loại nhà đất">
              <Select
                placeholder="Chọn loại nhà đất"
                value={selectedCategoryId || undefined}
                onChange={(value) => handleCategoryChange(value)}
                options={[
                  { value: null, label: "Tất cả loại nhà đất" },
                  ...filteredCategories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
                allowClear
                className="w-full [&_.ant-select-selector]:rounded [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
              />
            </Form.Item>
            <RedoOutlined
              className="absolute top-2 right-0 text-gray-500 hover:text-blue-500 cursor-pointer"
              onClick={resetCategory}
            />
          </div>

          <div className="relative">
            <Form.Item label="Mức giá">
              <Select
                placeholder="Chọn mức giá"
                value={priceOptions.findIndex(
                  (opt) => opt.min === priceRange[0] && opt.max === priceRange[1]
                )}
                onChange={(value) => handlePriceOptionChange(value)}
                options={priceOptions.map((option, index) => ({
                  value: index,
                  label: option.label,
                }))}
                allowClear
                className="w-full [&_.ant-select-selector]:rounded [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
              />
            </Form.Item>
            <RedoOutlined
              className="absolute top-2 right-0 text-gray-500 hover:text-blue-500 cursor-pointer"
              onClick={resetPrice}
            />
          </div>

          <div className="relative">
            <Form.Item label="Diện tích">
              <Select
                placeholder="Chọn diện tích"
                value={areaOptions.findIndex(
                  (opt) => opt.min === areaRange[0] && opt.max === areaRange[1]
                )}
                onChange={(value) => handleAreaOptionChange(value)}
                options={areaOptions.map((option, index) => ({
                  value: index,
                  label: option.label,
                }))}
                allowClear
                className="w-full [&_.ant-select-selector]:rounded [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
              />
            </Form.Item>
            <RedoOutlined
              className="absolute top-2 right-0 text-gray-500 hover:text-blue-500 cursor-pointer"
              onClick={resetArea}
            />
          </div>

          <div className="relative">
            <Form.Item label="Vị trí">
              <Space direction="vertical" className="w-full">
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  value={location.provinceCode || undefined}
                  onChange={(value) => handleLocationChange("provinceCode", value)}
                  options={provinces.map((province) => ({
                    value: province.code,
                    label: province.name,
                  }))}
                  allowClear
                  className="w-full [&_.ant-select-selector]:rounded [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
                />
                <Select
                  placeholder="Chọn quận/huyện"
                  value={location.districtCode || undefined}
                  onChange={(value) => handleLocationChange("districtCode", value)}
                  options={districts.map((district) => ({
                    value: district.code,
                    label: district.name,
                  }))}
                  disabled={!location.provinceCode}
                  allowClear
                  className="w-full [&_.ant-select-selector]:rounded [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
                />
                <Select
                  placeholder="Chọn phường/xã"
                  value={location.wardCode || undefined}
                  onChange={(value) => handleLocationChange("wardCode", value)}
                  options={wards.map((ward) => ({
                    value: ward.code,
                    label: ward.name,
                  }))}
                  disabled={!location.districtCode}
                  allowClear
                  className="w-full [&_.ant-select-selector]:rounded [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center"
                />
              </Space>
            </Form.Item>
            <RedoOutlined
              className="absolute top-2 right-0 text-gray-500 hover:text-blue-500 cursor-pointer"
              onClick={resetLocation}
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SearchForm;