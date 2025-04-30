import React, { useState, useEffect } from "react";
import { Dropdown, Form, Button, Container, Row, Col, Modal, InputGroup } from "react-bootstrap";
import { FaSearch, FaFilter } from "react-icons/fa";
import apiServices from "../services/apiServices";
import "../assets/styles/SearchForm.css";

// CSS tùy chỉnh
const customStyles = `
  .custom-check-row {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .custom-check-row:hover {
    background-color: rgba(207, 220, 255, 0.93);
  }
  .custom-check-row input[type="radio"] {
    margin-right: 8px;
    cursor: pointer;
  }
  .custom-check-row label {
    flex: 1;
    margin-bottom: 0;
    cursor: pointer;
  }
  .filter-modal .modal-dialog {
    max-width: 450px; /* Thu nhỏ chiều ngang modal */
  }
  .filter-modal .modal-content {
    border-radius: 8px;
  }
  .filter-modal .modal-header {
    border-bottom: 1px solid #e0e0e0;
  }
  .filter-modal .modal-footer {
    border-top: 1px solid #e0e0e0;
  }
`;

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
    // Check if any filters are applied
    const hasCategory = categoryLabel !== "Loại nhà đất";
    const hasPrice = priceLabel !== "Mức giá" && priceLabel !== "Tất cả mức giá";
    const hasArea = areaLabel !== "Diện tích" && areaLabel !== "Tất cả diện tích";
    const hasLocation = locationLabel !== "Vị trí";

    // Collect applied filter labels, converting to lowercase
    const filters = [];
    if (hasPrice) filters.push(priceLabel.toLowerCase());
    if (hasArea) filters.push(areaLabel.replace("Diện tích: ", "").toLowerCase()); // Remove "Diện tích: " prefix
    if (hasLocation) filters.push(locationLabel.toLowerCase());

    // Determine base text based on page type and filters
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
        baseText = `Tìm tin ${transactionType}: ${categoryLabel.toLowerCase()}`;
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

  const handlePriceOptionChange = (option) => {
    setPriceRange([option.min, option.max]);
    setPriceLabel(option.label);
  };

  const handleAreaOptionChange = (option) => {
    setAreaRange([option.min, option.max]);
    setAreaLabel(`Diện tích: ${option.label}`);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
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

  const handleSearch = (e) => {
    if (e) e.preventDefault();
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
      <style>{customStyles}</style>
      <InputGroup className="search-form-group">
        <Button variant="outline-primary" className="search-button" onClick={handleSearch}>
          <FaSearch />
        </Button>
        <Form.Control
          type="text"
          value={searchText}
          readOnly
          className="search-input"
          onClick={() => setShowModal(true)}
        />
        <Button variant="outline-primary" className="filter-button" onClick={() => setShowModal(true)}>
          <FaFilter /> Lọc
        </Button>
      </InputGroup>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          handleSearch();
        }}
        className="filter-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Bộ lọc tìm kiếm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Loại nhà đất</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                      {categoryLabel}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="custom-dropdown">
                      <div className="custom-check-row" onClick={() => handleCategoryChange(null)}>
                        <Form.Check
                          type="radio"
                          label="Tất cả loại nhà đất"
                          name="categoryId"
                          value=""
                          checked={selectedCategoryId === null}
                          onChange={() => handleCategoryChange(null)}
                        />
                      </div>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <div
                            key={category.id}
                            className="custom-check-row"
                            onClick={() => handleCategoryChange(category.id.toString())}
                          >
                            <Form.Check
                              type="radio"
                              label={category.name}
                              name="categoryId"
                              value={category.id.toString()}
                              checked={selectedCategoryId === category.id}
                              onChange={() => handleCategoryChange(category.id.toString())}
                            />
                          </div>
                        ))
                      ) : (
                        <Dropdown.Item>Không có loại nhà đất nào phù hợp.</Dropdown.Item>
                      )}
                      <div className="d-flex justify-content-end p-2 button-container">
                        <Button variant="outline-secondary" onClick={resetCategory} size="sm" className="me-2">
                          Đặt lại
                        </Button>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Mức giá</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                      {priceLabel}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="custom-dropdown">
                      {priceOptions.map((option, index) => (
                        <div
                          key={index}
                          className="custom-check-row"
                          onClick={() => handlePriceOptionChange(option)}
                        >
                          <Form.Check
                            type="radio"
                            label={option.label}
                            name="priceOption"
                            onChange={() => handlePriceOptionChange(option)}
                            checked={priceRange[0] === option.min && priceRange[1] === option.max}
                          />
                        </div>
                      ))}
                      <div className="d-flex justify-content-end p-2 button-container">
                        <Button variant="outline-secondary" onClick={resetPrice} size="sm" className="me-2">
                          Đặt lại
                        </Button>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Diện tích</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                      {areaLabel}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="custom-dropdown">
                      {areaOptions.map((option, index) => (
                        <div
                          key={index}
                          className="custom-check-row"
                          onClick={() => handleAreaOptionChange(option)}
                        >
                          <Form.Check
                            type="radio"
                            label={option.label}
                            name="areaOption"
                            onChange={() => handleAreaOptionChange(option)}
                            checked={areaRange[0] === option.min && areaRange[1] === option.max}
                          />
                        </div>
                      ))}
                      <div className="d-flex justify-content-end p-2 button-container">
                        <Button variant="outline-secondary" onClick={resetArea} size="sm" className="me-2">
                          Đặt lại
                        </Button>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Vị trí</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100 custom-dropdown-toggle">
                      {locationLabel}
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
                        <Button variant="outline-secondary" onClick={resetLocation} size="sm" className="me-2">
                          Đặt lại
                        </Button>
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleReset}>
            Đặt lại tất cả
          </Button>
          <Button variant="primary" onClick={handleSearch}>
            Áp dụng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SearchForm;