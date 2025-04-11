package vn.thanhdattanphuoc.batdongsan360.util.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;

public class UpdatePostStatusDTO {

    @NotNull(message = "ID bài đăng không được để trống")
    private long postId;

    @NotNull(message = "Trạng thái mới không được để trống")
    private PostStatusEnum status;

    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;

    public long getPostId() {
        return postId;
    }

    public void setPostId(long postId) {
        this.postId = postId;
    }

    public PostStatusEnum getStatus() {
        return status;
    }

    public void setStatus(PostStatusEnum status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

}