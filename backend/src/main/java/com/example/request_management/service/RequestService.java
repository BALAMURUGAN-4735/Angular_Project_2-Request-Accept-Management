package com.example.request_management.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.request_management.entity.Request;
import com.example.request_management.entity.User;
import com.example.request_management.repository.RequestRepository;
import com.example.request_management.repository.UserRepository;

@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    // User Add / Save Request
    public Request saveRequest(Request request, Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User databaseUser = userOpt.get();
            request.setUser(databaseUser);
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                request.setEmail(databaseUser.getEmail());
            }
            
            return requestRepository.save(request);
        }
        return null;
    }

    // Admin View All Requests
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    // User View Own Requests - Safely handles name queries, email fallbacks, and user profile links
    public List<Request> getUserRequests(String username) {
        if (username == null || username.trim().isEmpty()) {
            return List.of();
        }
        
        // 1. Find by user name relation property mapping
        List<Request> results = requestRepository.findByUserNameProperty(username.trim());
        
        // 2. Fallback: Find by direct request email column
        if (results.isEmpty()) {
            results = requestRepository.findByEmail(username.trim());
        }
        
        // 3. Fallback: Lookup user via email and find by entity mapping relationship
        if (results.isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(username.trim());
            if (userOpt.isPresent()) {
                return requestRepository.findByUser(userOpt.get());
            }
        }
        
        return results;
    }

    // Admin Update Status
    public Request updateStatus(Long id, String status, String reason) {
        Optional<Request> request = requestRepository.findById(id);

        if (request.isPresent()) {
            Request req = request.get();
            req.setStatus(status);

            if ("Declined".equalsIgnoreCase(status) || "Cancelled".equalsIgnoreCase(status)) {
                req.setReason(reason);
            } else {
                req.setReason(""); 
            }

            return requestRepository.save(req);
        }
        return null;
    }

    // Process user content modifications
    public Request editRequest(Long id, String title, String description) {
        Optional<Request> requestOpt = requestRepository.findById(id);

        if (requestOpt.isPresent()) {
            Request req = requestOpt.get();
            req.setTitle(title);
            req.setDescription(description);
            req.setStatus("Pending");
            req.setReason(""); 

            return requestRepository.save(req);
        }
        return null;
    }

    // Delete action method
    @Transactional
    public void deleteRequest(Long id) {
        requestRepository.deleteById(id);
    }
}