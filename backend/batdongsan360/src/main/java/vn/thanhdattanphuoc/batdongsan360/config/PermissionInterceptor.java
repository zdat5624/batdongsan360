package vn.thanhdattanphuoc.batdongsan360.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;
import vn.thanhdattanphuoc.batdongsan360.util.error.PermissionException;

@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Autowired
    UserService userService;

    @Override
    @Transactional
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String path = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String httpMethod = request.getMethod();

        System.out.println(">>> RUN preHandle");
        System.out.println(">>> path= " + path);
        System.out.println(">>> httpMethod= " + httpMethod);

        // Lấy email từ SecurityUtil
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        if (email.isEmpty()) {
            throw new PermissionException("Bạn chưa đăng nhập.");
        }

        // Lấy thông tin User
        User user = userService.handleGetUserByUserName(email);
        if (user == null || user.getRole() == null) {
            throw new PermissionException("Bạn không có quyền truy cập.");
        }

        RoleEnum role = user.getRole();

        // Nếu truy cập "/api/admin/**" mà không phải ADMIN => Cấm truy cập
        if (path.startsWith("/api/admin") && role != RoleEnum.ADMIN) {
            throw new PermissionException("Bạn không có quyền truy cập endpoint này.");
        }

        return true;
    }

}
