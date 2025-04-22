package vn.thanhdattanphuoc.batdongsan360.domain;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;

@Getter
@Setter
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long amount;

    @Enumerated(EnumType.STRING)
    private TransStatusEnum status;

    @Column(columnDefinition = "TEXT")
    private String paymentLink;

    @Column(unique = true)
    private String txnId;

    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
