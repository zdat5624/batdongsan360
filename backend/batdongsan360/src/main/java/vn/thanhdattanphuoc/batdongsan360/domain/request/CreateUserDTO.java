package vn.thanhdattanphuoc.batdongsan360.domain.request;

import jakarta.validation.constraints.NotBlank;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;

public class CreateUserDTO {
    @NotBlank(message = "usename không được để trống")
    private String name;

    @NotBlank(message = "email không được để trống")
    private String email;

    @NotBlank(message = "password không được để trống")
    private String password;

    @NotBlank(message = "phone không được để trống")
    private String phone;

    private RoleEnum role;

    public RoleEnum getRole() {
        return role;
    }

    public void setRole(RoleEnum role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
