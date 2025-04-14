package vn.thanhdattanphuoc.batdongsan360.repository.address;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.thanhdattanphuoc.batdongsan360.domain.Province;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
}
