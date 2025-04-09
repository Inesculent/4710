package com.api.repositories;

import com.api.models.Rso;
import com.api.models.RsoEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RsoEventRepository extends JpaRepository<RsoEvent, Integer> {
    List<RsoEvent> findByRso(Rso rso);
} 