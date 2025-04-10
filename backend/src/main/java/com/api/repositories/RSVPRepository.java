package com.api.repositories;

import com.api.models.RSVP;
import com.api.models.RSVPId;
import com.api.models.Event;
import com.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RSVPRepository extends JpaRepository<RSVP, RSVPId> {
    List<RSVP> findByUser(User user);
    List<RSVP> findByEvent(Event event);
    List<RSVP> findByEventAndStatus(Event event, String status);
    List<RSVP> findByUserAndStatus(User user, String status);
    long countByEventAndStatus(Event event, String status);
} 