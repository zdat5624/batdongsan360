package vn.thanhdattanphuoc.batdongsan360.repository.address;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.thanhdattanphuoc.batdongsan360.domain.Ward;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {
    List<Ward> findByDistrictCode(Long districtCode);
}
