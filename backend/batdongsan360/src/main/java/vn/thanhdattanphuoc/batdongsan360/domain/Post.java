package vn.thanhdattanphuoc.batdongsan360.domain;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;

@Getter
@Setter
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được quá 255 ký tự")
    private String title;

    @Column(columnDefinition = "MEDIUMTEXT")
    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    private boolean notifyOnView;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Loại bài đăng không được để trống")
    private PostTypeEnum type;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private Long price;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.1", message = "Diện tích phải lớn hơn 0")
    private Double area;

    @Min(value = 0, message = "Lượt xem phải không âm")
    private long view = 0;

    @Enumerated(EnumType.STRING)
    private PostStatusEnum status;

    private Instant expireDate;
    private boolean deletedByUser;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    @ManyToOne
    @JoinColumn(name = "province_code")
    @NotNull(message = "Tỉnh/Thành phố không được để trống")
    private Province province;

    @ManyToOne
    @JoinColumn(name = "district_code")
    @NotNull(message = "Quận/Huyện không được để trống")
    private District district;

    @ManyToOne
    @JoinColumn(name = "ward_code")
    private Ward ward;

    @Size(max = 255, message = "Địa chỉ chi tiết không được quá 255 ký tự")
    @NotNull
    private String detailAddress;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @NotNull(message = "Danh mục không được để trống")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "vip_id")
    private Vip vip;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Image> images;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @PrePersist
    public void handleBeforeCreate() {
        if (this.createdBy == null) {
            this.createdBy = SecurityUtil.getCurrentUserLogin().orElse("");
        }

        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }

}
