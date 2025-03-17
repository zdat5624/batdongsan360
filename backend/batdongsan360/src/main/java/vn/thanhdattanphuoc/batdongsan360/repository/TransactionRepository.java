package vn.thanhdattanphuoc.batdongsan360.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

}
