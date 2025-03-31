/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Form } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import apiServices from "../services/apiServices";

// Thêm CSS tùy chỉnh để đảm bảo màu nền
const pageStyles = `
  body {
    background-color: rgb(240, 248, 255); /* Màu nền xanh nhạt cho toàn bộ trang */
  }
`;

// Hàm chuyển đổi số thành chữ
const numberToWords = (num) => {
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];

  if (num === 0) return "không đồng";
  if (num < 1000) return "Số quá nhỏ để hiển thị";
  if (num > 999999999999) return "Số quá lớn";

  const convert = (n) => {
    if (n < 10) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
    return units[Math.floor(n / 100)] + " trăm " + convert(n % 100);
  };

  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  let words = "";
  if (billion) words += convert(billion) + " tỷ ";
  if (million) words += convert(million) + " triệu ";
  if (thousand) words += convert(thousand) + " nghìn ";
  if (remainder) words += convert(remainder);

  return words.trim() + " đồng";
};

const PostAd = () => {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState("SALE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [vipPackage, setVipPackage] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(10);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [vips, setVips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceInWords, setPriceInWords] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Lấy danh sách tỉnh/thành phố khi component được mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await apiServices.get("/api/address/provinces");
        if (response.data.statusCode === 200) {
          setProvinces(response.data.data);
        } else {
          throw new Error(response.data.message || "Không thể lấy danh sách tỉnh/thành phố.");
        }
      } catch (err) {
        setError(err.message || "Không thể lấy danh sách tỉnh/thành phố. Vui lòng thử lại sau.");
      }
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách gói VIP khi component được mount
  useEffect(() => {
    const fetchVips = async () => {
      try {
        const response = await apiServices.get("/api/vips");
        if (response.data.statusCode === 200) {
          setVips(response.data.data);
        } else {
          throw new Error(response.data.message || "Không thể lấy danh sách gói VIP.");
        }
      } catch (err) {
        setError(err.message || "Không thể lấy danh sách gói VIP. Vui lòng thử lại sau.");
      }
    };
    fetchVips();
  }, []);

  // Lấy danh sách danh mục khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiServices.get("/api/categories?page=0&size=30&sort=id,asc");
        if (response.data.statusCode === 200) {
          setCategories(response.data.data.content);
        } else {
          throw new Error(response.data.message || "Không thể lấy danh sách danh mục.");
        }
      } catch (err) {
        setError(err.message || "Không thể lấy danh sách danh mục. Vui lòng thử lại sau.");
      }
    };
    fetchCategories();
  }, []);

  // Lọc danh mục theo listingType
  useEffect(() => {
    const filtered = categories.filter((cat) => cat.type === listingType);
    setFilteredCategories(filtered);
    setCategory("");
  }, [listingType, categories]);

  // Lấy danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await apiServices.get(`/api/address/districts/${selectedProvince}`);
          if (response.data.statusCode === 200) {
            setDistricts(response.data.data);
            setSelectedDistrict("");
            setWards([]);
            setSelectedWard("");
          } else {
            throw new Error(response.data.message || "Không thể lấy danh sách quận/huyện.");
          }
        } catch (err) {
          setError(err.message || "Không thể lấy danh sách quận/huyện. Vui lòng thử lại sau.");
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
    }
  }, [selectedProvince]);

  // Lấy danh sách phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await apiServices.get(`/api/address/wards/${selectedDistrict}`);
          if (response.data.statusCode === 200) {
            setWards(response.data.data);
            setSelectedWard("");
          } else {
            throw new Error(response.data.message || "Không thể lấy danh sách phường/xã.");
          }
        } catch (err) {
          setError(err.message || "Không thể lấy danh sách phường/xã. Vui lòng thử lại sau.");
        }
      };
      fetchWards();
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  // Xử lý khi người dùng chọn file hình ảnh
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxImages = 5; // Giới hạn tối đa 5 hình ảnh
    const validFiles = [];
    const previews = [];

    if (selectedFiles.length > maxImages) {
      setError(`Bạn chỉ có thể chọn tối đa ${maxImages} hình ảnh.`);
      return;
    }

    for (let file of selectedFiles) {
      // Kiểm tra định dạng file
      if (!file.type.startsWith("image/")) {
        setError(`File ${file.name} không phải là hình ảnh. Vui lòng chọn file hình ảnh (jpg, png, v.v.).`);
        continue;
      }

      // Kiểm tra kích thước file
      if (file.size > maxSize) {
        setError(`File ${file.name} vượt quá kích thước cho phép (5MB). Vui lòng chọn file nhỏ hơn.`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setImages(validFiles);
    setImagePreviews(previews);
  };

  // Xử lý upload hình ảnh
  const handleImageUpload = async (files) => {
    if (files.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một hình ảnh để upload.");
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); // Thay "files" bằng key mà API yêu cầu nếu cần (ví dụ: "images")
    });

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập để đăng tin.");
      }

      const response = await apiServices.post("/api/upload/img", formData);

      if (response.data.statusCode === 201) {
        setSuccessMessage("Upload hình ảnh thành công!");
        const uploadedUrls = response.data.data.uploaded.map((url) => ({ url }));
        return uploadedUrls;
      } else {
        throw new Error(response.data.message || "Không thể upload hình ảnh. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi khi upload hình ảnh:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || "Lỗi khi upload hình ảnh. Vui lòng kiểm tra file hoặc thử lại.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập để đăng tin.");
      }

      // Upload hình ảnh
      const uploadedImageUrls = await handleImageUpload(images);
      if (uploadedImageUrls.length === 0) {
        throw new Error("Không có hình ảnh nào được upload thành công. Vui lòng kiểm tra file hình ảnh.");
      }

      // Kiểm tra các trường bắt buộc trước khi gửi
      if (!title) {
        throw new Error("Vui lòng nhập tiêu đề!");
      }
      if (!description) {
        throw new Error("Vui lòng nhập mô tả!");
      }
      if (!price) {
        throw new Error("Vui lòng nhập giá!");
      }
      if (!area) {
        throw new Error("Vui lòng nhập diện tích!");
      }
      if (!category) {
        throw new Error("Vui lòng chọn danh mục!");
      }
      if (!vipPackage) {
        throw new Error("Vui lòng chọn gói VIP!");
      }
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        throw new Error("Vui lòng chọn đầy đủ địa chỉ (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã)!");
      }
      if (!street || !houseNumber) {
        throw new Error("Vui lòng nhập số nhà và đường/phố!");
      }

      const selectedCategory = filteredCategories.find((cat) => cat.id === parseInt(category));
      const selectedVipId = parseInt(vipPackage);
      const selectedProvinceCode = parseInt(selectedProvince);
      const selectedDistrictCode = parseInt(selectedDistrict);
      const selectedWardCode = parseInt(selectedWard);

      // Kiểm tra giá trị NaN
      if (isNaN(selectedVipId)) {
        throw new Error("Gói VIP không hợp lệ!");
      }
      if (isNaN(selectedProvinceCode) || isNaN(selectedDistrictCode) || isNaN(selectedWardCode)) {
        throw new Error("Địa chỉ không hợp lệ!");
      }
      if (isNaN(parseInt(price.replace(/\D/g, ""), 10))) {
        throw new Error("Giá không hợp lệ!");
      }
      if (isNaN(parseFloat(area))) {
        throw new Error("Diện tích không hợp lệ!");
      }

      const selectedWardName = wards.find((w) => w.code === selectedWardCode)?.name || "";
      const detailAddress = `${houseNumber} ${street}, ${selectedWardName}`;

      const payload = {
        post: {
          title,
          description,
          type: listingType,
          price: parseInt(price.replace(/\D/g, ""), 10),
          area: parseFloat(area),
          category: { id: selectedCategory.id },
          vip: { id: selectedVipId },
          images: uploadedImageUrls,
          province: { code: selectedProvinceCode },
          district: { code: selectedDistrictCode },
          ward: { code: selectedWardCode },
          detailAddress,
        },
        numberOfDays: parseInt(numberOfDays),
      };

      // Log payload để kiểm tra
      console.log("Payload gửi lên API /api/posts:", payload);

      const response = await apiServices.post("/api/posts", payload);
      if (response.data.statusCode === 201) {
        alert("Tin đã được đăng thành công và đang chờ duyệt!");
        navigate(listingType === "SALE" ? "/sell" : "/rent");
      } else {
        throw new Error(response.data.message || "Lỗi khi đăng tin.");
      }
    } catch (err) {
      console.error("Lỗi khi đăng tin:", err.response?.data || err.message);
      setError(err.message || "Không thể đăng tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = new Intl.NumberFormat("vi-VN").format(value);
    setPrice(formattedValue);
    setPriceInWords(value ? numberToWords(parseInt(value, 10)) : "");
  };

  const getVipBackgroundColor = (vipLevel) => {
    switch (vipLevel) {
      case 0:
        return "#e9ecef";
      case 1:
        return "#d4edda";
      case 2:
        return "#fff3cd";
      case 3:
        return "#ffe5d9";
      case 4:
        return "#f8d7da";
      default:
        return "#e9ecef";
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: "rgb(240, 248, 255)", minHeight: "100vh" }}>
      <style>{pageStyles}</style>

      <div className="container">
        <h2 className="text-center mb-4 fw-bold text-primary">Đăng Tin Bất Động Sản</h2>
        <div
          className="card p-4 shadow"
          style={{
            border: "none",
            borderRadius: "15px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang xử lý...</span>
              </div>
              <p className="mt-2 text-muted">Đang xử lý đăng tin...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && <div className="alert alert-success">{successMessage}</div>}

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Loại tin đăng:</label>
                  <select
                    className="form-select"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    required
                  >
                    <option value="SALE">Bán</option>
                    <option value="RENT">Cho thuê</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Tiêu đề:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tiêu đề"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4 mt-4">
                <label className="form-label fw-bold">Mô tả:</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập mô tả chi tiết"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Giá (VNĐ):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập giá"
                    value={price}
                    onChange={handlePriceChange}
                    required
                  />
                  {priceInWords && <p className="mt-1 text-primary">{priceInWords}</p>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Diện tích (m²):</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Nhập diện tích"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-4 mt-2">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Danh mục:</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Gói VIP:</label>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      id="dropdown-vip"
                      className="w-100 text-start"
                      style={{ backgroundColor: "#f8f9fa", borderColor: "#ced4da" }}
                    >
                      {vipPackage
                        ? vips.find((vip) => vip.id === parseInt(vipPackage))?.name || "-- Chọn gói VIP --"
                        : "-- Chọn gói VIP --"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      {vips.map((vip) => (
                        <Dropdown.Item
                          key={vip.id}
                          onClick={() => setVipPackage(vip.id.toString())}
                          style={{
                            backgroundColor: getVipBackgroundColor(vip.vipLevel),
                            borderBottom: "1px solid #dee2e6",
                            padding: "10px 15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            {vip.name} (Giá: {vip.pricePerDay.toLocaleString("vi-VN")} VNĐ/ngày)
                          </span>
                          {vipPackage === vip.id.toString() && (
                            <span
                              className="badge bg-success text-white rounded-pill px-2 py-1"
                              style={{ fontSize: "0.8rem" }}
                            >
                              <FaCheck className="me-1" /> Active
                            </span>
                          )}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label fw-bold">Số ngày hiển thị:</label>
                <input
                  type="number"
                  className="form-control"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <h5 className="mt-4 fw-bold text-primary">Địa chỉ</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Tỉnh/Thành phố:</label>
                  <select
                    className="form-select"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Quận/Huyện:</label>
                  <select
                    className="form-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">-- Chọn --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-4 mt-2">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Phường/Xã:</label>
                  <select
                    className="form-select"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">-- Chọn --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Đường/Phố:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập Đường/Phố"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label fw-bold">Số nhà:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập số nhà"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="form-label fw-bold">Hình ảnh (tối đa 5 hình):</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  required
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          border: "1px solid #dee2e6",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center mt-5">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ borderRadius: "25px", padding: "10px 25px", fontWeight: "bold" }}
                >
                  Đăng Tin
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostAd;