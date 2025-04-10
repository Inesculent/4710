package com.api.repositories;

import com.api.models.PublicEvent;
import com.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicEventRepository extends JpaRepository<PublicEvent, Integer> {
    List<PublicEvent> findByOwner(User owner);
    List<PublicEvent> findByApproved(Boolean approved);
    
    @Query("SELECT pe FROM PublicEvent pe WHERE pe.owner.uid = :userId")
    List<PublicEvent> findByOwnerId(@Param("userId") Integer userId);
} 