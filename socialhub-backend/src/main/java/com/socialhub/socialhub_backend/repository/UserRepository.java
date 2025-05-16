package com.socialhub.socialhub_backend.repository;

import com.socialhub.socialhub_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByKeycloakId(UUID keycloakId);

    Optional<User> findByUsername(String username);


    Optional<User> findByEmail(String email);
}