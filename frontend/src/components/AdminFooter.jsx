import React from 'react';

const AdminFooter = () => {
  return (
    <>
      <style>
        {`
          .admin-footer {
            background-color: #343a40; /* Giữ màu nền giống bg-dark */
            color: #fff; /* Màu chữ trắng */
            padding: 10px 0;
            text-align: center;
            width: 100%;
            position: relative; /* Đảm bảo z-index hoạt động */
            z-index: 101; /* Cao hơn z-index của sidebar (100) */
            border-top: 1px solid #4b5563; /* Tương ứng với border-gray-200 */
          }
          .admin-footer .container {
            max-width: 1280px; /* Tương ứng với max-w-7xl */
            margin: 0 auto;
            padding: 0 12px; /* Tương ứng với px-3 */
          }
          @media (min-width: 640px) {
            .admin-footer .container {
              padding: 0 24px; /* Tương ứng với sm:px-6 */
            }
          }
          @media (min-width: 1024px) {
            .admin-footer .container {
              padding: 0 32px; /* Tương ứng với lg:px-8 */
            }
          }
          .admin-footer p {
            font-size: 0.875rem; /* Tương ứng với text-sm */
            color: #9ca3af; /* Tương ứng với text-gray-600 */
            margin: 0;
          }
        `}
      </style>
      <footer className="admin-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} PropTech Admin. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default AdminFooter;