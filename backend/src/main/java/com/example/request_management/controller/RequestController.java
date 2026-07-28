package com.example.request_management.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.request_management.entity.Request;
import com.example.request_management.service.RequestService;
import com.example.request_management.repository.RequestRepository;
import com.example.request_management.repository.UserRepository;

@RestController
@RequestMapping("/request")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class RequestController {

    @Autowired
    private RequestService requestService;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository; 

    // User adds a request dynamically linked to their account record via Query Parameter
    @PostMapping("/add") 
    public Request addRequest(@RequestParam("username") String username, @RequestBody Request request) {
        String searchKey = username.trim();
        Long actualUserId = 3L; 

        Optional<com.example.request_management.entity.User> userOpt = userRepository.findByEmail(searchKey);
        
        if (!userOpt.isPresent()) {
            for (com.example.request_management.entity.User u : userRepository.findAll()) {
                if (u.getName() != null && u.getName().equalsIgnoreCase(searchKey)) {
                    userOpt = Optional.of(u);
                    break;
                }
            }
        }

        if (userOpt.isPresent()) {
            actualUserId = userOpt.get().getId();
            request.setUser(userOpt.get()); 
            request.setEmail(userOpt.get().getEmail()); 
            request.setStatus("Pending");
            request.setReason("");
        }

        return requestService.saveRequest(request, actualUserId); 
    }
    
    // Admin gets all requests
    @GetMapping("/all")
    public List<Request> getAllRequests() {
        return requestService.getAllRequests();
    }

    // User gets own requests safely using a query parameter to preserve special characters like semicolons
    @GetMapping("/user/own") 
    public List<Request> getUserRequests(@RequestParam("userId") String userId) {
        return requestService.getUserRequests(userId);
    }

    // Admin updates status (Dropdown selection)
    @PutMapping("/update/{id}")
    public ResponseEntity<Request> updateStatus(@PathVariable Long id, @RequestBody Request updatedRequest) {
        try {
            Optional<Request> requestData = requestRepository.findById(id);

            if (requestData.isPresent()) {
                Request existingRequest = requestData.get();
                existingRequest.setStatus(updatedRequest.getStatus());
                existingRequest.setReason(updatedRequest.getReason());

                Request savedResult = requestRepository.save(existingRequest);
                return ResponseEntity.ok(savedResult);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("Error saving updates: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // User deletes an individual request entry row mapping
    @DeleteMapping("/delete/{id}") // 🟢 FIXED: Maps to /request/delete/{id} to handle the frontend call
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) {
        try {
            // Check if the request exists before deleting
            if (requestRepository.existsById(id)) {
                requestService.deleteRequest(id);
                return ResponseEntity.ok().body("{\"message\": \"Deleted successfully from database!\"}");
            } else {
                return ResponseEntity.status(404).body("{\"message\": \"Request record not found.\"}");
            }
        } catch (Exception e) {
            System.out.println("Error deleting request: " + e.getMessage());
            return ResponseEntity.internalServerError().body("{\"message\": \"Failed to delete record.\"}");
        }
    }
    // User edits an individual request line entry
    @PutMapping("/action/edit/{id}") 
    public Request editRequest(@PathVariable Long id, @RequestBody Request updatedData) {
        return requestRepository.findById(id).map(r -> {
            r.setTitle(updatedData.getTitle());          
            r.setDescription(updatedData.getDescription());  
            r.setStatus("Pending");                       
            r.setReason("");                              
            Long dynamicUserId = (r.getUser() != null) ? r.getUser().getId() : 3L;
            return requestService.saveRequest(r, dynamicUserId);
        }).orElse(null);
    }

    // Forgot Password Endpoint
    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/forgot-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String newPassword = payload.get("password");

            if (email == null || newPassword == null) {
                return ResponseEntity.badRequest().body("{\"message\": \"Missing email or password fields.\"}");
            }

            Optional<com.example.request_management.entity.User> userOpt = userRepository.findByEmail(email.trim());

            if (userOpt.isPresent()) {
                com.example.request_management.entity.User user = userOpt.get();
                user.setPassword(newPassword.trim()); 
                userRepository.saveAndFlush(user);
                return ResponseEntity.ok().body("{\"message\": \"Password changed successfully!\"}");
            } else {
                return ResponseEntity.status(404).body("{\"message\": \"Account email record not found.\"}");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"Server transaction failure.\"}");
        }
    }
}