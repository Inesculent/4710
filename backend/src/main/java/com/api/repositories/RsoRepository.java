package com.api.repositories;

import com.api.models.Rso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RsoRepository extends JpaRepository<Rso, Integer> {
    List<Rso> findByUniversityId(Integer universityId);
    Optional<Rso> findByRsoName(String rsoName);
    List<Rso> findByIsActive(Boolean isActive);
} 