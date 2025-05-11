package vn.thanhdattanphuoc.batdongsan360.util.request;

import lombok.Data;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;

@Data
public class CreateNotificationRequest {
    public Long userId;
    public String message;
    public NotificationType type;
}
