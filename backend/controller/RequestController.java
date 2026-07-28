package com.example.request_management.controller;

import com.example.request_management.entity.Request;
import com.example.request_management.repository.RequestRepository;
import com.example.request_management.service.RequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/request")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class RequestController {

    private final RequestService requestService;
    private final RequestRepository requestRepository;

    public RequestController(RequestService requestService, RequestRepository requestRepository) {
        this.requestService = requestService;
        this.requestRepository = requestRepository;
    }

    @PostMapping("/add")
    public Request addRequest(@RequestBody Request request) {
        if (request.getProcess() == null || request.getProcess().isEmpty()) {
            request.setProcess("PENDING");
        }
        if (request.getReason() == null) {
            request.setReason("-");
        }
        return requestService.saveRequest(request);
    }

    @GetMapping("/all")
    public List<Request> getAllRequests() {
        return requestService.getAllRequests();
    }

    // 👈 FOOLPROOF POST MAPPING THAT MATCHES ANGULAR PERFECTLY
    @PostMapping("/update")
    public ResponseEntity<Request> updateRequest(@RequestBody Request updatedRequest) {
        try {
            Optional<Request> requestData = requestRepository.findById(updatedRequest.getId());

            if (requestData.isPresent()) {
                Request existingRequest = requestData.get();
                existingRequest.setProcess(updatedRequest.getProcess());
                existingRequest.setReason(updatedRequest.getReason());

                Request savedResult = requestRepository.save(existingRequest);
                return ResponseEntity.ok(savedResult);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("Error updating status: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<Request> updateRequest(@PathVariable Long id, @RequestBody Request updatedRequest) {
        try {
            // Fetch directly from the repository database layout mapping context
            Optional<Request> requestData = requestRepository.findById(id);

            if (requestData.isPresent()) {
                Request existingRequest = requestData.get();
                
                // Modify only the status and rejection notes fields
                existingRequest.setProcess(updatedRequest.getProcess());
                existingRequest.setReason(updatedRequest.getReason());

                // Persist directly back to MySQL database
                Request savedResult = requestRepository.save(existingRequest);
                return ResponseEntity.ok(savedResult);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("Error saving status updates: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}