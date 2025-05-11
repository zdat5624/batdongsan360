import React, { useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

// Nhận tọa độ của bất động sản qua props
const PropertyMap = ({ latitude, longitude }) => {
    const [viewport, setViewport] = useState({
        latitude: latitude, // Khởi tạo khung nhìn tại vị trí bất động sản
        longitude: longitude,
        zoom: 14,
    });

    const handleViewGoogleMap = () => {
        const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(googleMapsUrl, "_blank");
    };

    const handleMapLoad = (event) => {
        const map = event.target;
        const language = new MapboxLanguage({
            defaultLanguage: 'vi',
        });
        map.addControl(language);
        map.setStyle(language.setLanguage(map.getStyle(), 'vi'));
    };

    return (
        <div>
            <div style={{ height: "350px", width: "100%", position: "relative" }}>
                <Map
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    initialViewState={viewport}
                    // onMove={(evt) => setViewport(evt.viewState)} // Cập nhật khung nhìn khi kéo thả
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    onLoad={handleMapLoad}
                >
                    {/* Marker cố định tại vị trí bất động sản */}
                    <Marker
                        latitude={latitude}
                        longitude={longitude}
                        anchor="bottom"
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="red"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                                fill="red"
                            />
                        </svg>
                    </Marker>
                    <NavigationControl position="bottom-right" />
                </Map>
                <button
                    onClick={handleViewGoogleMap}
                    title="Bấm vào để mở Google Map ứng với vị trí trên bản đồ"
                    style={{
                        position: "absolute",
                        bottom: "1rem",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "0.5rem 1rem", // Giảm padding trên mobile
                        backgroundColor: "#66b0ff",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "0.875rem", // Giảm font size trên mobile
                        transition: "all 0.3s ease",
                        zIndex: 10,
                        whiteSpace: "nowrap", // Ngăn text xuống dòng
                        // Responsive styles thông qua JS
                        ...(window.innerWidth <= 768 && {
                            padding: "0.5rem 1rem",
                            fontSize: "0.75rem",
                        }),
                        ...(window.innerWidth <= 480 && {
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.7rem",
                        }),
                    }}
                >
                    <img
                        src="/Google_Maps_icon_(2020).svg.png"
                        alt="Google Maps"
                        style={{
                            width: "1rem", // Giảm kích thước icon trên mobile
                            height: "1rem",
                            ...(window.innerWidth <= 768 && {
                                width: "0.875rem",
                                height: "0.875rem",
                            }),
                            ...(window.innerWidth <= 480 && {
                                width: "0.75rem",
                                height: "0.75rem",
                            }),
                        }}
                    />
                    Xem Google Map
                </button>
            </div>
        </div>
    );
};

export default PropertyMap;