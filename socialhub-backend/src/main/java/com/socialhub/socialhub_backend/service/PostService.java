package com.socialhub.socialhub_backend.service;

import com.socialhub.socialhub_backend.dto.PostDto;
import com.socialhub.socialhub_backend.model.Post;
import com.socialhub.socialhub_backend.model.User;
import com.socialhub.socialhub_backend.repository.PostRepository;
import com.socialhub.socialhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/images/";

    public List<PostDto> getAllPosts(UUID keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository.findAll().stream()
                .map(post -> toPostDto(post, user))
                .collect(Collectors.toList());
    }

    public void toggleLike(Long postId, UUID keycloakId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<User> likedUsers = post.getLikedBy();

        if (likedUsers.contains(user)) {
            likedUsers.remove(user);
        } else {
            likedUsers.add(user);
        }

        post.setLikedBy(likedUsers);
        postRepository.save(post);
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

    // Brukt når vi vet hvem den innloggede brukeren er (f.eks. for liked status)
    private PostDto toPostDto(Post post, User currentUser) {
        PostDto dto = new PostDto(
                post.getId(),
                post.getContent(),
                post.getUser().getKeycloakId(),
                post.getImagePath(),
                post.getCreatedAt(),
                post.getUser().getUsername()
        );

        if (post.getLikedBy() != null) {
            dto.setLikes(post.getLikedBy().size());
            dto.setLiked(post.getLikedBy().contains(currentUser));
        } else {
            dto.setLikes(0);
            dto.setLiked(false);
        }

        return dto;
    }

    // Fallback hvis vi ikke har tilgang på bruker (brukes av create/update/getById)
    private PostDto toPostDto(Post post) {
        PostDto dto = new PostDto(
                post.getId(),
                post.getContent(),
                post.getUser().getKeycloakId(),
                post.getImagePath(),
                post.getCreatedAt(),
                post.getUser().getUsername()
        );

        dto.setLikes(post.getLikedBy() != null ? post.getLikedBy().size() : 0);
        dto.setLiked(false); // fallback: ukjent om brukeren har likt

        return dto;
    }
}
