package com.example.request_management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "requests")
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String email; 
    
    private String department;

    private String description;

    @Column(name = "created_date") // Maps camelCase to snake_case column
    private String createdDate;

    @Column(name = "process") // CRITICAL: Maps your DB 'process' column to Java's status property
    private String status = "PENDING";

    @Column(name = "reason") // Maps DB 'reason' column to Java's reason property
    private String reason;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Request() {
    }

    public Request(Long id, String title, String description, String createdDate,
                   String status, String reason, User user) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdDate = createdDate;
        this.status = status;
        this.reason = reason;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // 👈 THIS METHOD FIXES THE UNDEFINED ERROR
    public String getEmail() { 
        return email; 
    } 
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getDepartment() { 
        return department; 
    }
    public void setDepartment(String department) { 
        this.department = department;
    }
}