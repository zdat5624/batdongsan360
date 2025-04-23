package vn.thanhdattanphuoc.batdongsan360.util.response;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;

@Setter
@Getter
public class ResCreateUserDTO {
    private long id;
    private String name;
    private String email;
    private RoleEnum role;
    private GenderEnum gender;
    private String phone;
    private String address;
    private Instant createdAt;
    private String createdBy;

    public ResCreateUserDTO() {
    }

    public ResCreateUserDTO(User user) {
        this.setId(user.getId());
        this.setName(user.getName());
        this.setEmail(user.getEmail());
        this.setRole(user.getRole());
        this.setPhone(user.getPhone());
        this.setGender(user.getGender());
        this.setAddress(user.getAddress());
        this.setCreatedAt(user.getCreatedAt());
        this.setCreatedBy(user.getCreatedBy());
    }

}
