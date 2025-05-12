package com.socialhub.socialhub_backend.service;

import com.socialhub.socialhub_backend.dto.PostDto;
import com.socialhub.socialhub_backend.model.Post;
import com.socialhub.socialhub_backend.model.User;
import com.socialhub.socialhub_backend.repository.PostRepository;
import com.socialhub.socialhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/images/";

    public List<PostDto> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::toPostDto)
                .collect(Collectors.toList());
    }

    public Optional<PostDto> getPostById(Long id) {
        return postRepository.findById(id)
                .map(this::toPostDto);
    }

    public PostDto createPost(PostDto postDto) {
        User user = userRepository.findByKeycloakId(postDto.getKeycloakId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setImagePath(postDto.getImagePath());
        post.setCreatedAt(LocalDateTime.now());

        Post savedPost = postRepository.save(post);
        return toPostDto(savedPost);
    }

    public PostDto updatePost(Long id, PostDto postDto) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setContent(postDto.getContent());
        post.setImagePath(postDto.getImagePath());

        Post updatedPost = postRepository.save(post);
        return toPostDto(updatedPost);
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getImagePath() != null) {
            String imagePath = post.getImagePath().startsWith(UPLOAD_DIR)
                    ? post.getImagePath()
                    : UPLOAD_DIR + post.getImagePath();
            File imageFile = new File(imagePath);
            if (imageFile.exists()) {
                boolean deleted = imageFile.delete();
                if (!deleted) {
                    System.err.println("Failed to delete image: " + imageFile.getAbsolutePath());
                }
            }
        }

        postRepository.delete(post);
    }

    private PostDto toPostDto(Post post) {
        return new PostDto(
                post.getId(),
                post.getContent(),
                post.getUser().getKeycloakId(),
                post.getImagePath(),
                post.getCreatedAt(),
                post.getUser().getUsername() // use username for display and ownership check
        );
    }
}
