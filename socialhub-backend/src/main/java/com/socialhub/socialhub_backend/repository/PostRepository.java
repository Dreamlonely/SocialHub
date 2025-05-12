package com.socialhub.socialhub_backend.repository;

import com.socialhub.socialhub_backend.model.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<Post> findAll();
}
