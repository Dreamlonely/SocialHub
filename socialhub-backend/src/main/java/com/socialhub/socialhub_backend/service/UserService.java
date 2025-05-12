package com.socialhub.socialhub_backend.service;

import com.socialhub.socialhub_backend.dto.UserDto;
import com.socialhub.socialhub_backend.model.User;
import com.socialhub.socialhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // For hashing passwords

    public User createUser(UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setKeycloakId(userDto.getKeycloakId());
        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword())); // Hash password
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setKeycloakId(userDto.getKeycloakId());
        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword())); // Hash password
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByKeycloakId(String keycloakId) {
        UUID keycloakUuid;
        try {
            keycloakUuid = UUID.fromString(keycloakId);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid keycloakId format: " + keycloakId, e);
        }
        return userRepository.findByKeycloakId(keycloakUuid)
                .orElseThrow(() -> new RuntimeException("User with keycloak_id not found"));
    }

    public User updateUserByKeycloakId(String keycloakId, UserDto userDto) {
        UUID keycloakUuid;
        try {
            keycloakUuid = UUID.fromString(keycloakId);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid keycloakId format: " + keycloakId, e);
        }
        User user = userRepository.findByKeycloakId(keycloakUuid)
                .orElseThrow(() -> new RuntimeException("User with keycloak_id not found"));

        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword())); // Hash password
        }

        return userRepository.save(user);
    }

    public User syncUser(UserDto userDto) {
        UUID keycloakUuid = userDto.getKeycloakId();
        if (keycloakUuid == null) {
            throw new RuntimeException("KeycloakId cannot be null");
        }

        Optional<User> existingUserByKeycloakId = userRepository.findByKeycloakId(keycloakUuid);
        if (existingUserByKeycloakId.isPresent()) {
            User existingUser = existingUserByKeycloakId.get();
            existingUser.setUsername(userDto.getUsername());
            existingUser.setEmail(userDto.getEmail());
            return userRepository.save(existingUser);
        }

        Optional<User> existingUserByEmail = userRepository.findByEmail(userDto.getEmail());
        if (existingUserByEmail.isPresent()) {
            User existingUser = existingUserByEmail.get();
            existingUser.setKeycloakId(keycloakUuid);
            existingUser.setUsername(userDto.getUsername());
            return userRepository.save(existingUser);
        }

        User newUser = new User();
        newUser.setUsername(userDto.getUsername());
        newUser.setEmail(userDto.getEmail());
        newUser.setKeycloakId(keycloakUuid);
        if (userDto.getPassword() != null) {
            newUser.setPassword(passwordEncoder.encode(userDto.getPassword())); // Hash password
        }
        return userRepository.save(newUser);
    }

    // Add the missing toUserDto method
    public UserDto toUserDto(User user) {
        return new UserDto(
                user.getUsername(),
                user.getEmail(),
                null, // Exclude password for security
                user.getKeycloakId()
        );
    }
}