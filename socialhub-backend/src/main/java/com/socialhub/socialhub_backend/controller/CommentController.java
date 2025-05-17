package com.socialhub.socialhub_backend.controller;

import com.socialhub.socialhub_backend.model.Comment;
import com.socialhub.socialhub_backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/posts/{postId}/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public Comment addComment(@PathVariable Long postId,
                              @RequestParam String content,
                              @RequestParam String keycloakId) {
        UUID uuid = UUID.fromString(keycloakId);  // 🔧 Fix: convert String to UUID
        return commentService.addComment(postId, uuid, content);
    }

    @GetMapping
    public List<Comment> getCommentsByPost(@PathVariable Long postId) {
        return commentService.getCommentsByPost(postId);
    }
}
