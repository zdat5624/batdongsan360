package vn.thanhdattanphuoc.batdongsan360.config;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.repository.PostRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.TransactionRepository;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;

@Component
public class ConfigScheduler {

    private final PostRepository postRepository;
    private final TransactionRepository transactionRepository;

    public ConfigScheduler(PostRepository postRepository, TransactionRepository transactionRepository) {
        this.postRepository = postRepository;
        this.transactionRepository = transactionRepository;
    }

    @Scheduled(cron = "0 0 */6 * * *") // Chạy mỗi 6 giờ
    @Transactional
    public void updateExpiredPosts() {
        int updatedCount = postRepository.updateExpiredPosts(PostStatusEnum.EXPIRED, Instant.now());
        System.out.println("Updated " + updatedCount + " expired posts.");
    }

    @Scheduled(cron = "0 */10 * * * *")
    public void updateExpiredTransactions() {
        Instant expiryTime = Instant.now().minusSeconds(15 * 60);
        int updatedCount = transactionRepository.updateExpiredTransactions(expiryTime);
        System.out.println(" Updated  " + updatedCount + " expired transaction.");
    }
}
