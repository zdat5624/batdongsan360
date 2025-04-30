// MapComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import DotMarker from './DotMarker';
import PriceMarker from './PriceMarker';
import VipMarker from './VipMarker';
import PostPopup from './PostPopup';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { formatPrice } from './utils';

const MapComponent = ({ filters }) => {
    const [posts, setPosts] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const mapRef = useRef(null);

    const fetchPostsForMap = async () => {
        try {
            const params = {
                minPrice: filters.minPrice || 0,
                maxPrice: filters.maxPrice || 50000000000000000,
                minArea: filters.minArea || 0,
                maxArea: filters.maxArea || 1000000000,
                categoryId: filters.categoryId || null,
                type: filters.type || 'SALE',
                provinceCode: filters.provinceCode || null,
                districtCode: filters.districtCode || null,
                wardCode: filters.wardCode || null,
            };

            const response = await axios.get('http://localhost:8080/api/posts/map', { params });
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error.response?.data || error.message);
            setPosts([]);
        }
    };

    useEffect(() => {
        fetchPostsForMap();
    }, [filters]);

    const handleMapLoad = (event) => {
        const map = event.target;
        const language = new MapboxLanguage({
            defaultLanguage: 'vi',
        });
        map.addControl(language);
        map.setStyle(language.setLanguage(map.getStyle(), 'vi'));
    };

    return (
        <Map
            ref={mapRef}
            initialViewState={{
                longitude: 106.71431894973796,
                latitude: 15.986268771732355,
                zoom: 3,
            }}
            minZoom={3}
            maxZoom={15}
            maxBounds={[
                [98, 5.5],
                [116, 25.5],
            ]}
            style={{ flex: 1 }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            onLoad={handleMapLoad}
        >
            {Array.isArray(posts) &&
                posts.map((post, index) => (
                    <Marker
                        key={index}
                        longitude={post.longitude}
                        latitude={post.latitude}
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setSelectedMarker(post);
                        }}
                    >
                        {post.vipId === 1 ? (
                            <DotMarker />
                        ) : post.vipId === 2 ? (
                            <PriceMarker price={post.price} formatPrice={formatPrice} />
                        ) : (
                            <VipMarker price={post.price} formatPrice={formatPrice} vipId={post.vipId} />
                        )}
                    </Marker>
                ))}

            <PostPopup post={selectedMarker} onClose={() => setSelectedMarker(null)} />
        </Map>
    );
};

export default MapComponent;