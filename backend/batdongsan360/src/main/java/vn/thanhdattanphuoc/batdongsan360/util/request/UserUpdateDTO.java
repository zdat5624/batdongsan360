package vn.thanhdattanphuoc.batdongsan360.util.request;

import lombok.Getter;
import lombok.Setter;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;

@Getter
@Setter
public class UserUpdateDTO {

    private long id;
    private String name;
    private RoleEnum role;
    private GenderEnum gender;
    private String avatar;
    private String phone;
    private String address;

    public UserUpdateDTO() {
    }

    public UserUpdateDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.role = user.getRole();
        this.gender = user.getGender();
        this.avatar = user.getAvatar();
        this.phone = user.getPhone();
        this.address = user.getAddress();
    }

}
