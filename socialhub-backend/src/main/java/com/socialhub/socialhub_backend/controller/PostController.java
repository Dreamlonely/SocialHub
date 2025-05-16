package com.socialhub.socialhub_backend.controller;

import com.socialhub.socialhub_backend.dto.PostDto;
import com.socialhub.socialhub_backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/posts")
public class PostController {

    private static final String UPLOAD_DIR = "uploads/images/";

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts() {
        List<PostDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostDto> createPost(@RequestBody PostDto request) {
        try {
            PostDto savedPost = postService.createPost(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // Invalid UUID
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // User not found
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> createPostWithImage(
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("keycloakId") String keycloakId) {

        try {
            UUID uuid = UUID.fromString(keycloakId); // Convert String to UUID

            String fileName = null;
            if (image != null && !image.isEmpty()) {
                validateImage(image);
                fileName = saveImage(image);
            }

            PostDto postDto = new PostDto(content, uuid, fileName);
            PostDto savedPost = postService.createPost(postDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // Invalid UUID format
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> updatePostWithImage(
            @PathVariable Long id,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("keycloakId") String keycloakId) {

        try {
            UUID uuid = UUID.fromString(keycloakId);
            PostDto existingPost = postService.getPostById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            String fileName = existingPost.getImagePath();
            if (image != null && !image.isEmpty()) {
                validateImage(image);
                // Slett forrige bilde
                if (fileName != null) deleteImage(fileName);
                fileName = saveImage(image);
            }

            PostDto postDto = new PostDto();
            postDto.setContent(content);
            postDto.setImagePath(fileName);
            postDto.setKeycloakId(uuid);

            PostDto updatedPost = postService.updatePost(id, postDto);
            return ResponseEntity.ok(updatedPost);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            PostDto postDto = postService.getPostById(id)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            if (postDto.getImagePath() != null) {
                deleteImage(postDto.getImagePath());
            }

            postService.deletePost(id);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- Helper Methods ---

    private void validateImage(MultipartFile image) {
        if (image.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds limit (5MB)");
        }
        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new RuntimeException("Invalid file type. Only images allowed.");
        }
    }

    private String saveImage(MultipartFile image) throws IOException {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR, fileName);
        Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    private void deleteImage(String imagePath) {
        File file = new File(UPLOAD_DIR + imagePath);
        if (file.exists()) {
            file.delete();
        }
    }
}