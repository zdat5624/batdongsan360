package vn.thanhdattanphuoc.batdongsan360.util.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MapPostDTO {
    private String type; // "unique" hoặc "grouped"
    private Double latitude;
    private Double longitude;
    private Integer count; // Số lượng bài đăng
    private Long postId; // ID bài đăng (cho unique)
    private Long vipId; // ID của Vip (cho unique)

    // Constructor cho grouped
    public MapPostDTO(Double latitude, Double longitude, Integer count) {
        this.type = "grouped";
        this.latitude = latitude;
        this.longitude = longitude;
        this.count = count;
    }

    // Constructor cho unique
    public MapPostDTO(Double latitude, Double longitude, Long postId, Long vipId) {
        this.type = "unique";
        this.latitude = latitude;
        this.longitude = longitude;
        this.count = 1;
        this.postId = postId;
        this.vipId = vipId;
    }
}