package com.api.repositories;

import com.api.models.Rso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RsoRepository extends JpaRepository<Rso, Integer> {
    List<Rso> findByUniversityId(Integer universityId);
    Optional<Rso> findByRsoName(String rsoName);
    List<Rso> findByIsActive(Boolean isActive);
    
    // Replace the simple method with a proper JPQL query that uses the join table
    @Query("SELECT r FROM Rso r JOIN r.members m WHERE m.uid = :userId")
    List<Rso> findByUserId(@Param("userId") Integer userId);
} 