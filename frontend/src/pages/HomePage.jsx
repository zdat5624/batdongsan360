/* HomePage.jsx */
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const HomePage = ({ setLoading }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Container fluid className="main-container" style={{ backgroundColor: "#f8fafc", paddingBottom: "80px" }}>
        {/* Các lựa chọn Thuê nhà và Bán nhà */}
        <Row className="py-10 px-6 justify-content-center mt-5">
          <Col md={4} className="mx-3 mb-6">
            <div
              className="bg-white rounded-2xl shadow-md p-12 text-center flex flex-col justify-between items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ height: "450px", border: "1px solid #e5e7eb" }}
            >
              <div className="flex flex-col justify-between items-center w-full h-full">
                <div className="flex flex-col items-center mt-5">
                  <img
                    src="https://www.zillowstatic.com/s3/homepage/static/Sell_a_home.png"
                    alt="Sell a home"
                    className="mx-auto mb-6"
                    style={{ maxWidth: "180px" }}
                  />
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bán nhà</h2>
                  <p className="text-gray-600 leading-relaxed text-base px-4 flex-1 px-5">
                    Dù bạn chọn con đường nào để bán nhà, chúng tôi sẽ giúp bạn điều hướng để có một giao dịch thành công. Từ việc định giá chính xác, quảng bá bất động sản đến hỗ trợ pháp lý, chúng tôi luôn đồng hành cùng bạn trong từng bước.
                  </p>
                </div>
                <Link to="/sell">
                  <Button
                    variant="outline-primary"
                    className="mt-4 rounded-full px-6 py-2 font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-300"
                  >
                    Tìm tin bán
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
          <Col md={4} className="mx-3 mb-6">
            <div
              className="bg-white rounded-2xl shadow-md p-12 text-center flex flex-col justify-between items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ height: "450px", border: "1px solid #e5e7eb" }}
            >
              <div className="flex flex-col justify-between items-center w-full h-full">
                <div className="flex flex-col items-center mt-5">
                  <img
                    src="https://www.zillowstatic.com/s3/homepage/static/Buy_a_home.png"
                    alt="Rent a home"
                    className="mx-auto mb-6"
                    style={{ maxWidth: "180px" }}
                  />
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thuê nhà</h2>
                  <p className="text-gray-600 leading-relaxed text-base px-4 flex-1 px-5">
                    Chúng tôi mang đến trải nghiệm trực tuyến mượt mà – từ tìm kiếm trên mạng lưới cho thuê lớn nhất, đến nộp hồ sơ và thanh toán tiền thuê. Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn tìm được ngôi nhà ưng ý với chi phí hợp lý và điều kiện thuê tốt nhất.
                  </p>
                </div>
                <Link to="/rent">
                  <Button
                    variant="outline-primary"
                    className="mt-4 rounded-full px-6 py-2 font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-300"
                  >
                    Tìm tin thuê
                  </Button>
                </Link>
              </div>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default HomePage;