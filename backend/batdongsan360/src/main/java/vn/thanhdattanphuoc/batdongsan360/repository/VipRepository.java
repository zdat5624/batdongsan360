package vn.thanhdattanphuoc.batdongsan360.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.thanhdattanphuoc.batdongsan360.domain.Vip;

@Repository
public interface VipRepository extends JpaRepository<Vip, Long> {

}
