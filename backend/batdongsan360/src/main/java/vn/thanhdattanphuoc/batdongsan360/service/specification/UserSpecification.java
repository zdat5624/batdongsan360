package vn.thanhdattanphuoc.batdongsan360.service.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.util.request.UserFilterRequest;

public class UserSpecification {

    public static Specification<User> filterUsers(UserFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Lọc theo tên
            if (filter.getName() != null && !filter.getName().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + filter.getName().toLowerCase() + "%"));
            }

            // Lọc theo email
            if (filter.getEmail() != null && !filter.getEmail().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + filter.getEmail().toLowerCase() + "%"));
            }

            // Lọc theo số điện thoại
            if (filter.getPhone() != null && !filter.getPhone().isEmpty()) {
                predicates.add(cb.like(root.get("phone"), "%" + filter.getPhone() + "%"));
            }

            // Lọc theo vai trò
            if (filter.getRole() != null) {
                predicates.add(cb.equal(root.get("role"), filter.getRole()));
            }

            // Lọc theo giới tính
            if (filter.getGender() != null) {
                predicates.add(cb.equal(root.get("gender"), filter.getGender()));
            }

            // Lọc theo số dư (minBalance và maxBalance)
            if (filter.getMinBalance() != null) {
                predicates.add(cb.ge(root.get("balance"), filter.getMinBalance()));
            }
            if (filter.getMaxBalance() != null) {
                predicates.add(cb.le(root.get("balance"), filter.getMaxBalance()));
            }

            // Lọc theo địa chỉ (tìm gần đúng)
            if (filter.getAddress() != null && !filter.getAddress().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("address")), "%" + filter.getAddress().toLowerCase() + "%"));
            }

            // Lọc theo khoảng thời gian tạo
            if (filter.getCreatedFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getCreatedFrom()));
            }
            if (filter.getCreatedTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getCreatedTo()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}