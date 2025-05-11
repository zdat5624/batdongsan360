import React, { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import _ from "lodash";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

const MapSelector = ({ latitude, longitude, onChange, isUserModified, setIsUserModified }) => {
    const defaultZoom = 15;

    const [viewport, setViewport] = useState({
        latitude: latitude || 10.775844,
        longitude: longitude || 106.701756,
        zoom: defaultZoom,
    });
    const mapRef = useRef(null);

    useEffect(() => {
        if (latitude && longitude && !isUserModified && !isNaN(latitude) && !isNaN(longitude)) {
            setViewport((prev) => ({
                ...prev,
                latitude,
                longitude,
                zoom: defaultZoom,
            }));
            if (mapRef.current) {
                mapRef.current.flyTo({
                    center: [longitude, latitude],
                    zoom: defaultZoom,
                    duration: 100,
                });

            }
            console.log(">>> 14 useEffect / Map updated with new coordinates:", { latitude, longitude });

        }
    }, [latitude, longitude, isUserModified]);

    // const debouncedOnChange = useCallback(
    //     _.debounce((coordinates) => {
    //         onChange(coordinates);
    //         console.log(">>> 39 onChange(newCoordinates);", coordinates);
    //     }, 500), // Chờ 300ms
    //     [onChange]
    // );

    // const handleViewportChange = (evt) => {
    //     const newViewport = evt.viewState;
    //     setViewport(newViewport);
    //     const newCoordinates = {
    //         latitude: newViewport.latitude,
    //         longitude: newViewport.longitude,
    //     };
    //     onChange(newCoordinates);
    //     console.log(">>> 39 onChange(newCoordinates);", newCoordinates);
    //     // setIsUserModified(true);
    // };

    const handleViewportChange = (evt) => {
        // const newViewport = evt.viewState;
        // setViewport(newViewport);
        // const newCoordinates = {
        //     latitude: newViewport.latitude,
        //     longitude: newViewport.longitude,
        // };
        // debouncedOnChange(newCoordinates); // Gọi phiên bản debounced
        // setIsUserModified(true);
    };


    const handleDragEnd = useCallback(() => {
        if (mapRef.current) {
            const center = mapRef.current.getCenter();
            const newCoordinates = {
                latitude: center.lat,
                longitude: center.lng,
            };
            setViewport((prev) => ({
                ...prev,
                latitude: newCoordinates.latitude,
                longitude: newCoordinates.longitude,
            }));
            onChange(newCoordinates);
            setIsUserModified(true);
            console.log(">>> DragEnd coordinates:", newCoordinates);
        }
    }, [onChange, setIsUserModified]);


    const handleConfirm = () => {
        const googleMapsUrl = `https://www.google.com/maps?q=${viewport.latitude},${viewport.longitude}`;
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
            <div style={{ height: "500px", width: "100%", position: "relative" }}>
                <Map
                    ref={mapRef}
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    initialViewState={viewport}
                    // viewState={viewport}
                    onMove={handleDragEnd}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    cooperativeGestures
                    // onDragEnd={handleDragEnd}
                    onLoad={handleMapLoad}

                    minZoom={3}
                    maxZoom={20}
                >
                    <Marker latitude={viewport.latitude} longitude={viewport.longitude} anchor="bottom">
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
                    onClick={handleConfirm}
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

export default MapSelector;