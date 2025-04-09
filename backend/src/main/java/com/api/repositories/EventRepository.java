package com.api.repositories;

import com.api.models.Event;
import com.api.models.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByUniversity(University university);
    List<Event> findByDateAfter(LocalDate date);
    List<Event> findByUniversityAndDateAfter(University university, LocalDate date);
} 