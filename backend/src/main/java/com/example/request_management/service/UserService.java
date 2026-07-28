package com.example.request_management.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.request_management.dto.LoginRequest;
import com.example.request_management.dto.SignupRequest;
import com.example.request_management.entity.User;
import com.example.request_management.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Signup
    public String signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        userRepository.save(user);

        return "Signup Successful";
    }

    // Login
   public User login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new RuntimeException("Email and password fields cannot be blank!");
        }

        String inputEmail = request.getEmail().trim();
        String inputPassword = request.getPassword().trim();

        // 1. Fetch user by email. Throws an error immediately if unregistered.
        User user = userRepository.findByEmail(inputEmail)
            .orElseThrow(() -> new RuntimeException("Access Denied: Email address is not registered!"));

        // 2. Exact string validation check
        if (user.getPassword() != null && user.getPassword().trim().equals(inputPassword)) {
            System.out.println("AUTHENTICATION SUCCESS: Valid session initialized for " + inputEmail);
            return user;
        } else {
            throw new RuntimeException("Access Denied: Incorrect password credentials entered!");
        }
    }
}