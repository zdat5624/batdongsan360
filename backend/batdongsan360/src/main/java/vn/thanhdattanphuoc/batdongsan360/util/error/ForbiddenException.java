package vn.thanhdattanphuoc.batdongsan360.util.error;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}