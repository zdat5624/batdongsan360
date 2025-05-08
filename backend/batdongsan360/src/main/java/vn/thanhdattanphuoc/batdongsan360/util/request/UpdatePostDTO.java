package vn.thanhdattanphuoc.batdongsan360.util.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import vn.thanhdattanphuoc.batdongsan360.domain.Category;
import vn.thanhdattanphuoc.batdongsan360.domain.District;
import vn.thanhdattanphuoc.batdongsan360.domain.Image;
import vn.thanhdattanphuoc.batdongsan360.domain.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.Ward;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;

import java.util.List;

@Getter
@Setter
public class UpdatePostDTO {

    @NotNull(message = "ID bài đăng không được để trống")
    private Long id;

    @Size(max = 255, message = "Tiêu đề không được quá 255 ký tự")
    private String title;

    @Size(max = 16777215, message = "Mô tả quá dài")
    private String description;

    private PostTypeEnum type;

    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private Long price;

    @DecimalMin(value = "0.1", message = "Diện tích phải lớn hơn 0")
    private Double area;

    private Province province;

    private District district;

    private Ward ward;

    @Size(max = 255, message = "Địa chỉ chi tiết không được quá 255 ký tự")
    private String detailAddress;

    private Category category;

    private List<Image> images;

    private Double latitude;

    private Double longitude;
}