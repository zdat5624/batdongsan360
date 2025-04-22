package vn.thanhdattanphuoc.batdongsan360.util.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MapPostDTO {
    private Double latitude;
    private Double longitude;
    private Long postId;
    private Long vipId;
    private Long price;
}