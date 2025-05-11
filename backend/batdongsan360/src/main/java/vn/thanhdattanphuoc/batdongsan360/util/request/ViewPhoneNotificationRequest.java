package vn.thanhdattanphuoc.batdongsan360.util.request;

import lombok.Data;

@Data
public  class ViewPhoneNotificationRequest {
    public Long postId; // ID bài đăng
    public Long recipientId; // ID người nhận thông báo (chủ bài đăng)
}
