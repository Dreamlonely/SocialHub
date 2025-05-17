package com.socialhub.socialhub_backend.repository;

import com.socialhub.socialhub_backend.model.Comment;
import com.socialhub.socialhub_backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
}
