package vn.thanhdattanphuoc.batdongsan360.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RestController;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.domain.request.PostRequestDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.request.UpdatePostStatusDTO;
import vn.thanhdattanphuoc.batdongsan360.service.PostService;

import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@RestController
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/api/posts")
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostRequestDTO requestDTO) throws IdInvalidException {
        Post createdPost = postService.createPost(requestDTO.getPost(), requestDTO.getNumberOfDays());
        return ResponseEntity.ok(createdPost);
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

    @PutMapping("/api/posts/status")
    public ResponseEntity<Post> updatePostStatus(
            @Valid @RequestBody UpdatePostStatusDTO dto) throws IdInvalidException {
        Post updatedPost = postService.updatePostStatus(dto.getPostId(), dto.getStatus(), dto.getMessage());
        return ResponseEntity.ok(updatedPost);
    }
}