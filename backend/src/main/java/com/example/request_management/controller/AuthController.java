package com.example.request_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.request_management.entity.User;
import com.example.request_management.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepository userRepository; 

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (userRepository.findByEmail(user.getEmail().trim()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"message\": \"Error: Email is already registered!\"}");
            }

            User savedUser = userRepository.save(user);
            System.out.println("DATABASE SUCCESS: New user registered with ID: " + savedUser.getId());
            return ResponseEntity.ok().body("{\"message\": \"User registered successfully!\"}");
            
        } catch (Exception e) {
            System.out.println("Signup error details: " + e.getMessage());
            return ResponseEntity.internalServerError().body("{\"message\": \"Server registration failure.\"}");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginData) {
        try {
            java.util.Optional<User> userOpt = userRepository.findByEmail(loginData.getEmail().trim());
            
            if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginData.getPassword())) {
                User user = userOpt.get();
                return ResponseEntity.ok(user);
            }
            
            return ResponseEntity.status(401).body("{\"message\": \"Invalid email or password credentials!\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"Login server processing error.\"}");
        }
    }
}