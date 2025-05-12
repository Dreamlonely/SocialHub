package com.socialhub.socialhub_backend.controller;

import com.socialhub.socialhub_backend.dto.UserDto;
import com.socialhub.socialhub_backend.model.User;
import com.socialhub.socialhub_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/keycloak/{keycloakId}")
    public ResponseEntity<UserDto> getUserByKeycloakId(@PathVariable String keycloakId) {
        User user = userService.getUserByKeycloakId(keycloakId);
        return ResponseEntity.ok(userService.toUserDto(user));
    }

    @PutMapping("/keycloak/{keycloakId}")
    public ResponseEntity<UserDto> updateUserByKeycloakId(@PathVariable String keycloakId, @Valid @RequestBody UserDto userDto) {
        User user = userService.updateUserByKeycloakId(keycloakId, userDto);
        return ResponseEntity.ok(userService.toUserDto(user));
    }

    @PostMapping("/sync")
    public ResponseEntity<UserDto> syncUser(@Valid @RequestBody UserDto userDto) {
        User user = userService.syncUser(userDto);
        return ResponseEntity.ok(userService.toUserDto(user));
    }
}