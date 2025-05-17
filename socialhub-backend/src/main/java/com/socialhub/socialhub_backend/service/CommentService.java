package com.socialhub.socialhub_backend.service;

import com.socialhub.socialhub_backend.model.Comment;
import com.socialhub.socialhub_backend.model.Post;
import com.socialhub.socialhub_backend.model.User;
import com.socialhub.socialhub_backend.repository.CommentRepository;
import com.socialhub.socialhub_backend.repository.PostRepository;
import com.socialhub.socialhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(Long postId, UUID keycloakId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment(content, user, post);
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return commentRepository.findByPostOrderByCreatedAtAsc(post);
    }
}
