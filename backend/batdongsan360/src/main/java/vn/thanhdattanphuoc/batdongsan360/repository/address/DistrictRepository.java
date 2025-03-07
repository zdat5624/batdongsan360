package vn.thanhdattanphuoc.batdongsan360.repository.address;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.thanhdattanphuoc.batdongsan360.domain.address.District;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByProvinceCode(Long provinceCode);
}
