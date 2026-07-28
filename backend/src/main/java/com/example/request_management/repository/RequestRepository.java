package com.example.request_management.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.request_management.entity.Request;
import com.example.request_management.entity.User;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    List<Request> findByUser(User user);

    List<Request> findByEmail(String email);

    // 🟢 USING JPQL: Safely queries by user.name to avoid naming mismatches
    @Query("SELECT r FROM Request r WHERE r.user.name = :name")
    List<Request> findByUserNameProperty(@Param("name") String name);
}