package vn.thanhdattanphuoc.batdongsan360.domain.response;

import java.time.Instant;

import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;

public class ResUpdateUserDTO {

    private long id;
    private String name;
    private String email;
    private RoleEnum role;
    private GenderEnum gender;
    private String phone;
    private String address;
    private String avatar;
    private Instant createdAt;
    private String createdBy;
    private String updatedBy;
    private Instant updatedAt;

    public ResUpdateUserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.avatar = user.getAvatar();
        this.gender = user.getGender();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.createdAt = user.getCreatedAt();
        this.createdBy = user.getCreatedBy();
        this.updatedAt = user.getUpdatedAt();
        this.updatedBy = user.getUpdatedBy();
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public RoleEnum getRole() {
        return role;
    }

    public void setRole(RoleEnum role) {
        this.role = role;
    }

    public GenderEnum getGender() {
        return gender;
    }

    public void setGender(GenderEnum gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

}
