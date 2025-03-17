package vn.thanhdattanphuoc.batdongsan360.domain.request;

import vn.thanhdattanphuoc.batdongsan360.domain.Post;

public class PostRequestDTO {
    private Post post;
    private int numberOfDays;

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public int getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(int numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

}
