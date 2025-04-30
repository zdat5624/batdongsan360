import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Popup } from 'react-map-gl';
import axios from 'axios';
import { formatPrice } from './utils';

const PostPopup = ({ post, onClose }) => {
    const [postDetails, setPostDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Gọi API để lấy chi tiết bài đăng dựa trên postId
    useEffect(() => {
        if (!post || !post.postId) {
            setPostDetails(null);
            return;
        }

        const fetchPostDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:8080/api/posts/${post.postId}`);
                setPostDetails(response.data.data); // Lưu dữ liệu bài đăng vào state
            } catch (err) {
                console.error('Error fetching post details:', err);
                setError('Không thể tải chi tiết bài đăng');
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetails();
    }, [post?.postId]); // Gọi lại API khi postId thay đổi

    if (!post) return null;

    // Xử lý giao diện khi đang tải
    if (loading) {
        return (
            <Popup
                longitude={post.longitude}
                latitude={post.latitude}
                onClose={onClose}
                closeOnClick={true}
                anchor="bottom"
            >
                <div style={{ padding: '10px' }}>
                    <p>Đang tải...</p>
                </div>
            </Popup>
        );
    }

    // Xử lý giao diện khi có lỗi hoặc không có dữ liệu
    if (error || !postDetails) {
        return (
            <Popup
                longitude={post.longitude}
                latitude={post.latitude}
                onClose={onClose}
                closeOnClick={true}
                anchor="bottom"
            >
                <div style={{ padding: '10px' }}>
                    <p>{error || 'Không có dữ liệu'}</p>
                </div>
            </Popup>
        );
    }

    // Xác định màu của nhãn "VIP" dựa trên vipId
    const vipColor = postDetails.vip?.id === 2 ? '#FFC107' : '#FF4500'; // Màu vàng nếu vipId là 2, còn lại là cam đỏ

    // Hiển thị popup với dữ liệu bài đăng
    return (
        <Popup
            longitude={post.longitude}
            latitude={post.latitude}
            onClose={onClose}
            closeOnClick={false} // Đặt thành false để không đóng popup khi nhấp vào nội dung
            anchor="bottom"
        >
            <NavLink to={`/post/${postDetails.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '2px', maxWidth: '300px' }}>
                    {/* Container cho hình ảnh và nhãn VIP */}
                    <div style={{ position: 'relative', marginBottom: '5px' }}>
                        {/* Hình ảnh bài đăng */}
                        {postDetails.images && postDetails.images.length > 0 && (
                            <img
                                src={`http://localhost:8080/uploads/${postDetails.images[0].url}`} // Hiển thị hình ảnh đầu tiên
                                alt="Hình ảnh bài đăng"
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '5px',
                                }}
                            />
                        )}

                        {/* Hiển thị nhãn VIP ở góc trên bên trái */}
                        {postDetails.vip?.id !== 1 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    left: '5px',
                                    backgroundColor: vipColor, // Áp dụng màu dựa trên vipId
                                    color: '#FFF', // Chữ màu trắng
                                    padding: '2px 5px',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'inline-block',
                                }}
                            >
                                VIP
                            </span>
                        )}
                    </div>

                    {/* Tiêu đề bài đăng */}
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                        {postDetails.title}
                    </h4>

                    {/* Giá (thêm /tháng nếu type là RENT) */}
                    <p style={{ margin: '0 0 5px 0', color: '#FF4500', fontWeight: 'bold', fontSize: '15px' }}>
                        {formatPrice(postDetails.price)}
                        {postDetails.type === 'RENT' ? '/tháng' : ''}
                    </p>

                    {/* Diện tích */}
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                        <strong>Diện tích:</strong> {postDetails.area} m²
                    </p>
                </div>
            </NavLink>
        </Popup>
    );
};

export default PostPopup;