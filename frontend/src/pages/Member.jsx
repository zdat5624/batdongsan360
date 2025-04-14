// // eslint-disable-next-line no-unused-vars
// import React from "react";
// import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";

// // CSS tùy chỉnh
// const customStyles = `
//   .membership-section {
//     background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
//     min-height: 100vh;
//   }

//   .membership-header {
//     background: linear-gradient(135deg, #007bff, #00b4d8);
//     color: white;
//     padding: 2rem;
//     border-radius: 20px;
//     box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
//   }

//   .plan-card {
//     transition: all 0.3s ease;
//     border-radius: 20px;
//     border: none;
//     background: #fff;
//     overflow: hidden;
//     position: relative;
//   }

//   .plan-card:hover {
//     transform: translateY(-10px);
//     box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
//   }

//   .price-text {
//     font-size: 1.75rem;
//     font-weight: 700;
//     color: #dc3545;
//   }

//   .savings-text {
//     color: #28a745;
//     font-weight: 600;
//     font-style: italic;
//   }

//   .feature-list {
//     list-style: none;
//     padding-left: 0;
//     margin-bottom: 1rem;
//   }

//   .feature-list li {
//     position: relative;
//     padding-left: 1.75rem;
//     margin-bottom: 0.75rem;
//     color: #495057;
//   }

//   .feature-list li:before {
//     content: "✓";
//     position: absolute;
//     left: 0;
//     color: #28a745;
//     font-weight: bold;
//     font-size: 1.1rem;
//   }

//   .btn-buy {
//     background: linear-gradient(45deg, #007bff, #00b4d8);
//     border: none;
//     padding: 0.75rem 2rem;
//     border-radius: 50px;
//     font-weight: 600;
//     transition: all 0.3s ease;
//   }

//   .btn-buy:hover {
//     transform: scale(1.05);
//     background: linear-gradient(45deg, #0056b3, #0096c7);
//     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
//   }

//   .popular-badge {
//     transform: translateX(-50%);
//     top: -15px;
//     padding: 0.5rem 1rem;
//     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
//   }
// `;

// const Member = () => {
//   return (
//     <>
//       <style>{customStyles}</style>
//       <Container fluid className="membership-section py-5">
//         <Container>
//           <div className="membership-header text-center mb-5">
//             <h2 className="fw-bold mb-4 display-5">Gói Hội viên</h2>
//             <Badge bg="light" text="dark" className="mb-3 p-3 fs-5 rounded-pill shadow">
//               🔥 Giảm Giá Đặc Biệt 🔥
//             </Badge>
//             <p className="fs-5 fw-light mb-2">
//               Tiết kiệm đến <span className="fw-bold text-warning">39%</span> so với đăng tin lẻ
//             </p>
//             <p className="fs-5 fw-light mb-2">
//               Quản lý ngân sách dễ dàng và hiệu quả hơn
//             </p>
//             <small className="fst-italic opacity-75">
//               Giá các gói chưa bao gồm 10% VAT
//             </small>
//           </div>

//           <Row className="g-4">
//             {[
//               {
//                 title: "Hội viên Cơ bản",
//                 price: "từ 517.000 đ/tháng",
//                 discount: "-32%",
//                 savings: "Tiết kiệm 243.000 đ/tháng",
//                 vipGold: "1 Tin VIP Vàng (7 ngày)",
//                 vipSilver: "1 Tin VIP Bạc (7 ngày)",
//                 regularPosts: "15 Tin Thường (10 ngày)",
//                 pushes: "15 lượt đẩy",
//                 popular: false,
//               },
//               {
//                 title: "Hội viên Tiêu chuẩn",
//                 price: "từ 1.383.000 đ/tháng",
//                 discount: "-34%",
//                 savings: "Tiết kiệm 729.000 đ/tháng",
//                 vipGold: "1 Tin VIP Vàng (7 ngày)",
//                 vipSilver: "1 Tin VIP Bạc (7 ngày)",
//                 regularPosts: "30 Tin Thường (10 ngày)",
//                 pushes: "30 lượt đẩy",
//                 popular: true,
//               },
//               {
//                 title: "Hội viên Cao cấp",
//                 price: "từ 2.833.000 đ/tháng",
//                 discount: "-39%",
//                 savings: "Tiết kiệm 1.812.000 đ/tháng",
//                 vipGold: "1 Tin VIP Vàng (7 ngày)",
//                 vipSilver: "2 Tin VIP Bạc (7 ngày)",
//                 regularPosts: "50 Tin Thường (10 ngày)",
//                 pushes: "50 lượt đẩy",
//                 popular: false,
//               },
//             ].map((plan, index) => (
//               <Col md={4} key={index}>
//                 <Card className={`plan-card h-100 shadow-lg ${plan.popular ? 'border border-primary' : ''}`}>
//                   {plan.popular && (
//                     <Badge
//                       bg="warning"
//                       text="dark"
//                       className="position-absolute top-0 start-50 popular-badge fs-6"
//                     >
//                       ⭐ Bán chạy nhất
//                     </Badge>
//                   )}
//                   <Card.Body className="text-center p-4">
//                     <Card.Title className="fw-bold fs-3 text-primary mb-3">{plan.title}</Card.Title>
//                     <Card.Text className="price-text">
//                       {plan.price} <span className="fs-5 fw-bold">{plan.discount}</span>
//                     </Card.Text>
//                     <small className="savings-text d-block mb-3">{plan.savings}</small>
//                     <Button variant="primary" className="btn-buy w-100 mb-4">
//                       Mua ngay
//                     </Button>
//                     <hr className="my-4" />
//                     <Card.Text className="text-start">
//                       <strong className="d-block mb-2">📌 Gói tin hàng tháng:</strong>
//                       <ul className="feature-list">
//                         <li>{plan.vipGold}</li>
//                         <li>{plan.vipSilver}</li>
//                         <li>{plan.regularPosts}</li>
//                         <li>{plan.pushes}</li>
//                       </ul>
//                       <strong className="d-block mb-2">⚡ Tiện ích đặc biệt:</strong>
//                       <ul className="feature-list">
//                         <li>🚀 Xuất bản nhanh</li>
//                         <li>📷 Bản quyền ảnh</li>
//                         <li>⏳ Hẹn giờ đăng tin</li>
//                         <li>📊 Báo cáo hiệu suất</li>
//                         <li>🛠️ Thao tác hàng loạt</li>
//                       </ul>
//                     </Card.Text>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             ))}
//           </Row>
//         </Container>
//       </Container>
//     </>
//   );
// };

// export default Member;