package vn.thanhdattanphuoc.batdongsan360.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    @Autowired
    private PermissionInterceptor permissionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(permissionInterceptor)
                .addPathPatterns("/api/admin/**"); // Áp dụng Interceptor cho tất cả API admin
        // .excludePathPatterns("/api/auth/**", "/api/public/**", "/",
        // "/uploads/**",
        // "/api/auth/**",
        // "/api/address/**"); // Loại trừ các API công khai
    }
}
