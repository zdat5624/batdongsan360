package vn.thanhdattanphuoc.batdongsan360.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapboxConfig {
    @Value("${mapbox.api.key}")
    private String mapboxApiKey;

    public String getMapboxApiKey() {
        return mapboxApiKey;
    }
}
