package vn.thanhdattanphuoc.batdongsan360.controller;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.service.PostService;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;
import vn.thanhdattanphuoc.batdongsan360.util.request.PostRequestDTO;
import vn.thanhdattanphuoc.batdongsan360.util.request.UpdatePostStatusDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.MapPostDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.ResAddressDTO;

@RestController
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/api/posts")
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostRequestDTO requestDTO) throws IdInvalidException {
        Post createdPost = postService.createPost(requestDTO.getPost(), requestDTO.getNumberOfDays());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @PutMapping("/api/posts")
    public ResponseEntity<Post> updatePost(@Valid @RequestBody Post updatedPost) throws IdInvalidException {

        Post post = postService.updatePost(updatedPost);
        return ResponseEntity.status(HttpStatus.OK).body(post);

    }

    @DeleteMapping("/api/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) throws IdInvalidException {
        postService.deletePost(id);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PutMapping("/api/admin/posts/status")
    public ResponseEntity<Post> updatePostStatus(
            @Valid @RequestBody UpdatePostStatusDTO dto) throws IdInvalidException {
        Post updatedPost = postService.updatePostStatus(dto.getPostId(), dto.getStatus(), dto.getMessage());
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/api/admin/posts/delete/{id}")
    public ResponseEntity<Void> deletePostAdmin(@PathVariable Long id) throws IdInvalidException {
        postService.deletePostAdmin(id);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/api/posts/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) throws IdInvalidException {
        Post post = postService.getPostById(id);
        return ResponseEntity.status(HttpStatus.OK).body(post);
    }

    @GetMapping("/api/admin/posts")
    public Page<Post> getPosts(
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Double minArea,
            @RequestParam(required = false) Double maxArea,
            @RequestParam(required = false) PostStatusEnum status,
            @RequestParam(required = false) Long provinceCode,
            @RequestParam(required = false) Long districtCode,
            @RequestParam(required = false) Long wardCode,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PostTypeEnum type,
            @RequestParam(required = false) Long vipId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Boolean isDeleteByUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return postService.getFilteredPosts(minPrice, maxPrice, minArea, maxArea, status, provinceCode,
                districtCode, wardCode, categoryId, type, vipId, userId, isDeleteByUser, page, size);
    }

    @GetMapping("/api/posts")
    public Page<Post> getReviewOrApprovedPosts(
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Double minArea,
            @RequestParam(required = false) Double maxArea,
            @RequestParam(required = false) Long provinceCode,
            @RequestParam(required = false) Long districtCode,
            @RequestParam(required = false) Long wardCode,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = true) PostTypeEnum type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return postService.getFilteredReviewOrApprovedPosts(
                minPrice, maxPrice, minArea, maxArea, provinceCode, districtCode, wardCode, categoryId,
                type, page, size);
    }

    @GetMapping("/api/posts/my-posts")
    public ResponseEntity<Page<Post>> getMyPosts(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) PostStatusEnum status,
            @RequestParam(required = false) PostTypeEnum type,
            @RequestParam(required = false) Long provinceCode) throws IdInvalidException {

        Page<Post> posts = postService.getMyPosts(pageable, status, type, provinceCode);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/api/posts/{postId}/address")
    public ResponseEntity<ResAddressDTO> getFullAddress(@PathVariable Long postId) {
        String fullAddress = postService.getFullAddressByPostId(postId);
        ResAddressDTO addressDTO = new ResAddressDTO();
        addressDTO.setFullAddress(fullAddress);
        return ResponseEntity.ok(addressDTO);
    }

    @GetMapping("/api/posts/map")
    public List<MapPostDTO> getPostsForMap(
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Double minArea,
            @RequestParam(required = false) Double maxArea,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long provinceCode,
            @RequestParam(required = false) Long districtCode,
            @RequestParam(required = false) Long wardCode) {
        return postService.getPostsForMap(minPrice, maxPrice, minArea, maxArea,
                categoryId, provinceCode, districtCode, wardCode);
    }

}