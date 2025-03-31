/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Dropdown, Form, Button, Container, Row, Col } from "react-bootstrap";
import apiServices from "../services/apiServices";
import "../assets/styles/SearchForm.css";

const SearchForm = ({ onSearch, hideTransactionType }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypes, setPropertyTypes] = useState({});
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([null, null]);
  const [areaRange, setAreaRange] = useState([null, null]);

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
        const initialPropertyTypes = {};
        categoriesData.forEach((category) => {
          initialPropertyTypes[category.id] = false;
        });
        setPropertyTypes(initialPropertyTypes);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách categories:", err);
      }
    };

    fetchCategories();
  }, [isSellPage, isRentPage, isHomePage]);

  const handlePropertyTypeChange = (e) => {
    const { name, checked } = e.target;
    setPropertyTypes((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const selectedCategoryIds = Object.keys(propertyTypes)
      .filter((key) => propertyTypes[key])
      .map((key) => parseInt(key, 10));

    const searchData = {
      searchQuery: searchQuery.trim(),
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : [],
      price: { min: priceRange[0], max: priceRange[1] },
      area: { min: areaRange[0], max: areaRange[1] },
    };

    console.log("SearchForm - searchData:", searchData); // Log để kiểm tra
    onSearch(searchData);
  };

  const handleReset = () => {
    setSearchQuery("");
    setPriceRange([null, null]);
    setAreaRange([null, null]);
    const resetPropertyTypes = { ...propertyTypes };
    Object.keys(resetPropertyTypes).forEach((key) => {
      resetPropertyTypes[key] = false;
    });
    setPropertyTypes(resetPropertyTypes);
    onSearch({});
  };

  const priceOptions = isSellPage
    ? [
        { label: "Tất cả mức giá", min: null, max: null },
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
        { label: "Trên 60 tỷ", min: 60000000000, max: null },
      ]
    : [
        { label: "Tất cả mức giá", min: null, max: null },
        { label: "Dưới 1 triệu", min: 0, max: 1000000 },
        { label: "1 - 3 triệu", min: 1000000, max: 3000000 },
        { label: "3 - 5 triệu", min: 3000000, max: 5000000 },
        { label: "5 - 10 triệu", min: 5000000, max: 10000000 },
        { label: "10 - 40 triệu", min: 10000000, max: 40000000 },
        { label: "40 - 70 triệu", min: 40000000, max: 70000000 },
        { label: "70 - 100 triệu", min: 70000000, max: 100000000 },
        { label: "Trên 100 triệu", min: 100000000, max: null },
      ];

  const areaOptions = [
    { label: "Tất cả diện tích", min: null, max: null },
    { label: "Dưới 30 m²", min: 0, max: 30 },
    { label: "30 - 50 m²", min: 30, max: 50 },
    { label: "50 - 80 m²", min: 50, max: 80 },
    { label: "80 - 100 m²", min: 80, max: 100 },
    { label: "100 - 150 m²", min: 100, max: 150 },
    { label: "150 - 200 m²", min: 150, max: 200 },
    { label: "200 - 250 m²", min: 200, max: 250 },
    { label: "250 - 300 m²", min: 250, max: 300 },
    { label: "300 - 500 m²", min: 300, max: 500 },
    { label: "Trên 500 m²", min: 500, max: null },
  ];

  return (
    <Container className="py-4 search-form-container">
      <Form onSubmit={handleSearch}>
        <Row className="g-3 align-items-center">
          <Col xs={12} md={6} lg={3}>
            <Form.Group controlId="searchQuery">
              <Form.Control
                type="text"
                placeholder="Trên toàn quốc"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg={3}>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-property" className="w-100 custom-dropdown-toggle">
                Loại nhà đất
              </Dropdown.Toggle>
              <Dropdown.Menu className="custom-dropdown custom-scrollbar" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Form.Check
                      key={category.id}
                      type="checkbox"
                      label={category.name}
                      name={category.id.toString()}
                      checked={propertyTypes[category.id] || false}
                      onChange={handlePropertyTypeChange}
                      className="px-3 py-2 option-spacing"
                    />
                  ))
                ) : (
                  <Dropdown.Item>Không có loại nhà đất nào phù hợp.</Dropdown.Item>
                )}
                <div className="d-flex justify-content-between p-2" style={{ gap: "10px" }}>
                  <Button variant="outline-secondary" onClick={handleReset} className="reset-button">Đặt lại</Button>
                  <Button variant="primary" onClick={handleSearch} className="apply-button">Áp dụng</Button>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          <Col xs={12} md={6} lg={3}>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-price" className="w-100 custom-dropdown-toggle">
                Mức giá
              </Dropdown.Toggle>
              <Dropdown.Menu className="custom-dropdown custom-scrollbar" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <div className="p-3">
                  {priceOptions.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      label={option.label}
                      name="priceOption"
                      onChange={() => setPriceRange([option.min, option.max])}
                      checked={priceRange[0] === option.min && priceRange[1] === option.max}
                      className="mb-3 option-spacing"
                    />
                  ))}
                  <div className="d-flex justify-content-between mt-3" style={{ gap: "10px" }}>
                    <Button variant="outline-secondary" onClick={handleReset} className="reset-button">Đặt lại</Button>
                    <Button variant="primary" onClick={handleSearch} className="apply-button">Áp dụng</Button>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          <Col xs={12} md={6} lg={3}>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-area" className="w-100 custom-dropdown-toggle">
                Diện tích
              </Dropdown.Toggle>
              <Dropdown.Menu className="custom-dropdown custom-scrollbar" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <div className="p-3">
                  {areaOptions.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      label={option.label}
                      name="areaOption"
                      onChange={() => setAreaRange([option.min, option.max])}
                      checked={areaRange[0] === option.min && areaRange[1] === option.max}
                      className="mb-3 option-spacing"
                    />
                  ))}
                  <div className="d-flex justify-content-between mt-3" style={{ gap: "10px" }}>
                    <Button variant="outline-secondary" onClick={handleReset} className="reset-button">Đặt lại</Button>
                    <Button variant="primary" onClick={handleSearch} className="apply-button">Áp dụng</Button>
                  </div>
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        <div className="d-flex justify-content-start mt-4">
          <Button variant="primary" type="submit" className="custom-search-button">Áp dụng bộ lọc</Button>
        </div>
      </Form>
    </Container>
  );
};

export default SearchForm;