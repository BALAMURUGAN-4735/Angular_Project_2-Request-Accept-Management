package com.example.request_management.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.request_management.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 👈 THIS IS THE EXACT METHOD THE COMPILER IS COMPLAINING ABOUT
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(String email, String password);

    boolean existsByEmail(String email);
}