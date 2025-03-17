package vn.thanhdattanphuoc.batdongsan360.domain;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.thanhdattanphuoc.batdongsan360.domain.address.District;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Ward;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @Lob
    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    private boolean notifyOnView;

    @Enumerated(EnumType.STRING)
    private PostTypeEnum type;

    @NotNull(message = "Giá không được để trống")
    private long price;

    @NotNull(message = "Diện tích không được để trống")
    private double area;

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
    private Province province;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    @ManyToOne
    @JoinColumn(name = "ward_code")
    private Ward ward;

    private String detailAddress;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "vip_id")
    private Vip vip;

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<Image> images;

    public Province getProvince() {
        return province;
    }

    public void setProvince(Province province) {
        this.province = province;
    }

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }

    public Ward getWard() {
        return ward;
    }

    public void setWard(Ward ward) {
        this.ward = ward;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isNotifyOnView() {
        return notifyOnView;
    }

    public void setNotifyOnView(boolean notifyOnView) {
        this.notifyOnView = notifyOnView;
    }

    public PostTypeEnum getType() {
        return type;
    }

    public void setType(PostTypeEnum type) {
        this.type = type;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public double getArea() {
        return area;
    }

    public void setArea(double area) {
        this.area = area;
    }

    public long getView() {
        return view;
    }

    public void setView(long view) {
        this.view = view;
    }

    public PostStatusEnum getStatus() {
        return status;
    }

    public void setStatus(PostStatusEnum status) {
        this.status = status;
    }

    public Instant getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(Instant expireDate) {
        this.expireDate = expireDate;
    }

    public boolean isDeletedByUser() {
        return deletedByUser;
    }

    public void setDeletedByUser(boolean deletedByUser) {
        this.deletedByUser = deletedByUser;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().orElse("");
        this.updatedAt = Instant.now();
    }

    public Vip getVip() {
        return vip;
    }

    public void setVip(Vip vip) {
        this.vip = vip;
    }

}
