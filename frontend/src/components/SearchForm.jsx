  import React, { useState, useEffect } from "react";
  import { Dropdown, Form, Button, Container, Row, Col } from "react-bootstrap";
  import apiServices from "../services/apiServices";
  import "../assets/styles/SearchForm.css";

  const SearchForm = ({ onSearch, hideTransactionType, projects = [] }) => {
    const [propertyTypes, setPropertyTypes] = useState({});
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
            console.log(`Categories fetched for type ${type}:`, response.data);
            if (response.data.statusCode === 200) {
              categoriesData.push(...response.data.data.content);
            } else {
              console.error(`Lỗi khi lấy danh sách categories cho type ${type}:`, response.data.message);
            }
          }
          if (categoriesData.length === 0) {
            console.warn("Không có categories nào được tải. Kiểm tra API hoặc dữ liệu backend.");
            alert("Không thể tải danh sách loại nhà đất. Vui lòng thử lại sau.");
            return;
          }
          console.log("All categories loaded in SearchForm:", categoriesData);
          setCategories(categoriesData);
          const initialPropertyTypes = {};
          categoriesData.forEach((category) => {
            initialPropertyTypes[category.id] = false;
          });
          console.log("Initial propertyTypes:", initialPropertyTypes);
          setPropertyTypes(initialPropertyTypes);
        } catch (err) {
          console.error("Lỗi khi lấy danh sách categories:", err.response?.data || err.message);
          alert("Có lỗi xảy ra khi tải danh sách loại nhà đất. Vui lòng thử lại sau.");
        }
      };
      fetchCategories();
    }, [isSellPage, isRentPage, isHomePage]);

    useEffect(() => {
      const fetchProvinces = async () => {
        try {
          const response = await apiServices.get(`/api/address/provinces`);
          console.log("Provinces fetched:", response.data);
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
            console.log("Districts fetched:", response.data);
            if (response.data.statusCode === 200) {
              setDistricts(response.data.data);
              setLocation((prev) => ({ ...prev, districtCode: null, wardCode: null }));
              setWards([]);
            }
          } catch (err) {
            console.error("Lỗi khi lấy danh sách quận/huyện:", err);
          }
        } else {
          setDistricts([]);
          setWards([]);
          setLocation((prev) => ({ ...prev, districtCode: null, wardCode: null }));
        }
      };
      fetchDistricts();
    }, [location.provinceCode]);

    useEffect(() => {
      const fetchWards = async () => {
        if (location.districtCode) {
          try {
            const response = await apiServices.get(`/api/address/wards/${location.districtCode}`);
            console.log("Wards fetched:", response.data);
            if (response.data.statusCode === 200) {
              setWards(response.data.data);
              setLocation((prev) => ({ ...prev, wardCode: null }));
            }
          } catch (err) {
            console.error("Lỗi khi lấy danh sách phường/xã:", err);
          }
        } else {
          setWards([]);
          setLocation((prev) => ({ ...prev, wardCode: null }));
        }
      };
      fetchWards();
    }, [location.districtCode]);

    const handlePropertyTypeChange = (e) => {
      const { name, checked } = e.target;
      setPropertyTypes((prev) => {
        const newState = { ...prev, [name]: checked };
        console.log("Updated propertyTypes after change:", newState);
        return newState;
      });
    };

    const handleLocationChange = (e) => {
      const { name, value } = e.target;
      setLocation((prev) => ({ ...prev, [name]: value ? parseInt(value) : null }));
    };

    const handleSearch = (e) => {
      e.preventDefault();
      console.log("=== Starting handleSearch in SearchForm ===");
      console.log("Current propertyTypes before search:", propertyTypes);
      const selectedCategoryIds = Object.keys(propertyTypes)
        .filter((key) => propertyTypes[key])
        .map((key) => parseInt(key, 10));
      console.log("Selected categoryIds:", selectedCategoryIds);

      if (selectedCategoryIds.length === 0) {
        console.warn("No categoryIds selected. Aborting search.");
        alert("Vui lòng chọn ít nhất một loại nhà đất!");
        return;
      }

      const searchData = {
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minArea: areaRange[0],
        maxArea: areaRange[1],
        provinceCode: location.provinceCode || null,
        districtCode: location.districtCode || null,
        wardCode: location.wardCode || null,
        categoryIds: selectedCategoryIds,
        type: isSellPage ? "SALE" : isRentPage ? "RENT" : "SALE",
      };

      console.log("Search data prepared to send from SearchForm:", searchData);
      onSearch(searchData);
      console.log("=== Finished handleSearch in SearchForm ===");
    };

    const handleReset = () => {
      setPriceRange([0, 50000000000000000]);
      setAreaRange([0, 1000000000]);
      setLocation({ provinceCode: null, districtCode: null, wardCode: null });
      setDistricts([]);
      setWards([]);
      const resetPropertyTypes = { ...propertyTypes };
      Object.keys(resetPropertyTypes).forEach((key) => {
        resetPropertyTypes[key] = false;
      });
      setPropertyTypes(resetPropertyTypes);
      onSearch({
        minPrice: 0,
        maxPrice: 50000000000000000,
        minArea: 0,
        maxArea: 1000000000,
        provinceCode: null,
        districtCode: null,
        wardCode: null,
        categoryIds: [],
        type: isSellPage ? "SALE" : isRentPage ? "RENT" : "SALE",
      });
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
        { label: "5 - 10 triệu", min: 5000000, max: 10000000 },
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
      <Container className="search-form-container">
        <Form onSubmit={handleSearch}>
          <Row className="g-2 align-items-center">
            <Col xs={12} md={3}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                  Loại nhà đất
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <Form.Check
                        key={category.id}
                        type="checkbox"
                        label={category.name}
                        name={category.id.toString()}
                        checked={propertyTypes[category.id] || false}
                        onChange={handlePropertyTypeChange}
                        className="px-2 py-1"
                      />
                    ))
                  ) : (
                    <Dropdown.Item>Không có loại nhà đất nào phù hợp.</Dropdown.Item>
                  )}
                  <div className="d-flex justify-content-end p-2 button-container">
                    <Button variant="outline-secondary" onClick={handleReset} size="sm" className="me-2">
                      Đặt lại
                    </Button>
                    <Button variant="primary" onClick={handleSearch} size="sm">
                      Áp dụng
                    </Button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col xs={12} md={3}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                  Mức giá
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown">
                  {priceOptions.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      label={option.label}
                      name="priceOption"
                      onChange={() => setPriceRange([option.min, option.max])}
                      checked={priceRange[0] === option.min && priceRange[1] === option.max}
                      className="px-2 py-1"
                    />
                  ))}
                  <div className="d-flex justify-content-end p-2 button-container">
                    <Button variant="outline-secondary" onClick={handleReset} size="sm" className="me-2">
                      Đặt lại
                    </Button>
                    <Button variant="primary" onClick={handleSearch} size="sm">
                      Áp dụng
                    </Button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col xs={12} md={3}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                  Diện tích
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown">
                  {areaOptions.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      label={option.label}
                      name="areaOption"
                      onChange={() => setAreaRange([option.min, option.max])}
                      checked={areaRange[0] === option.min && areaRange[1] === option.max}
                      className="px-2 py-1"
                    />
                  ))}
                  <div className="d-flex justify-content-end p-2 button-container">
                    <Button variant="outline-secondary" onClick={handleReset} size="sm" className="me-2">
                      Đặt lại
                    </Button>
                    <Button variant="primary" onClick={handleSearch} size="sm">
                      Áp dụng
                    </Button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col xs={12} md={3}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                  Vị trí
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown">
                  <Form.Group className="px-2 py-1">
                    <Form.Label>Tỉnh/Thành phố</Form.Label>
                    <Form.Select
                      name="provinceCode"
                      value={location.provinceCode || ""}
                      onChange={handleLocationChange}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="px-2 py-1">
                    <Form.Label>Quận/Huyện</Form.Label>
                    <Form.Select
                      name="districtCode"
                      value={location.districtCode || ""}
                      onChange={handleLocationChange}
                      disabled={!location.provinceCode}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="px-2 py-1">
                    <Form.Label>Phường/Xã</Form.Label>
                    <Form.Select
                      name="wardCode"
                      value={location.wardCode || ""}
                      onChange={handleLocationChange}
                      disabled={!location.districtCode}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <div className="d-flex justify-content-end p-2 button-container">
                    <Button variant="outline-secondary" onClick={handleReset} size="sm" className="me-2">
                      Đặt lại
                    </Button>
                    <Button variant="primary" onClick={handleSearch} size="sm">
                      Áp dụng
                    </Button>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
          <div className="d-flex justify-content-start mt-2">
            <Button variant="primary" type="submit" size="sm" className="custom-search-button">
              Tìm kiếm
            </Button>
          </div>
        </Form>
      </Container>
    );
  };

  export default SearchForm;