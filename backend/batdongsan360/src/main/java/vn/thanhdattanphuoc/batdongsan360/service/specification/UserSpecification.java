package vn.thanhdattanphuoc.batdongsan360.service.specification;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> filterUsers(RoleEnum role, GenderEnum gender, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Lọc theo vai trò
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            // Lọc theo giới tính
            if (gender != null) {
                predicates.add(cb.equal(root.get("gender"), gender));
            }

            // Tìm kiếm theo email, phone, hoặc id
            if (search != null && !search.trim().isEmpty()) {
                String searchValue =  search.trim().toLowerCase() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchValue);
                Predicate phonePredicate = cb.like(cb.lower(root.get("phone")), searchValue);
                Predicate idPredicate = cb.equal(root.get("id"), parseLongOrNull(search));
                predicates.add(cb.or(emailPredicate, phonePredicate, idPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static Long parseLongOrNull(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}