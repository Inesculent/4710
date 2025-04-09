package com.api.repositories;

import com.api.models.PublicEvent;
import com.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicEventRepository extends JpaRepository<PublicEvent, Integer> {
    List<PublicEvent> findByOwner(User owner);
    List<PublicEvent> findByApproved(Boolean approved);
} 