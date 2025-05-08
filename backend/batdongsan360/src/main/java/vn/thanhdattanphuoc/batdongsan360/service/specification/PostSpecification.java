package vn.thanhdattanphuoc.batdongsan360.service.specification;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import vn.thanhdattanphuoc.batdongsan360.domain.District;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.domain.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.Vip;
import vn.thanhdattanphuoc.batdongsan360.domain.Ward;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;

public class PostSpecification {
 
	public static Specification<Post> filterBy(
            Long minPrice, Long maxPrice, Double minArea, Double maxArea,
            PostStatusEnum status, Long categoryId, PostTypeEnum type, 
            Long vipId,  String email, Boolean deletedByUser) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (minPrice != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (minArea != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("area"), minArea));
            }
            if (maxArea != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("area"), maxArea));
            }
            if (status != null) {
                predicate = criteriaBuilder.and(predicate, 
                        criteriaBuilder.equal(root.get("status"), status));
            }
            if (categoryId != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }
            if (type != null) {
                predicate = criteriaBuilder.and(predicate, 
                        criteriaBuilder.equal(root.get("type"), type));
            }
            if (vipId != null) {
                Join<Post, Vip> vipJoin = root.join("vip");
                predicate = criteriaBuilder.and(predicate, 
                        criteriaBuilder.equal(vipJoin.get("id"), vipId));
            }
            if (deletedByUser != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("deletedByUser"), deletedByUser));
            }
            if (email != null && !email.trim().isEmpty()) {
                Join<Post, User> userJoin = root.join("user");
                predicate = criteriaBuilder.and(predicate, 
                        criteriaBuilder.equal(userJoin.get("email"), email));
            }
            return predicate;
        };
    }
	
    public static Specification<Post> filterBy(
            Long minPrice, Long maxPrice, Double minArea, Double maxArea,
            Long provinceCode, Long districtCode, Long wardCode,
            Long categoryId, PostTypeEnum type) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (minPrice != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (minArea != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("area"), minArea));
            }
            if (maxArea != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("area"), maxArea));
            }
            if (provinceCode != null) {
                Join<Post, Province> provinceJoin = root.join("province");
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(provinceJoin.get("code"), provinceCode));
            }
            if (districtCode != null) {
                Join<Post, District> districtJoin = root.join("district");
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(districtJoin.get("code"), districtCode));
            }
            if (wardCode != null) {
                Join<Post, Ward> wardJoin = root.join("ward");
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(wardJoin.get("code"), wardCode));
            }
            if (categoryId != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }
            if (type != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("type"), type));
            }

            predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("deletedByUser"), false));

            return predicate;
        };
    }

}
