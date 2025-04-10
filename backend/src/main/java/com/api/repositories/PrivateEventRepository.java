package com.api.repositories;

import com.api.models.PrivateEvent;
import com.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateEventRepository extends JpaRepository<PrivateEvent, Integer> {
    List<PrivateEvent> findByOwner(User owner);
    
    @Query("SELECT pe FROM PrivateEvent pe WHERE pe.owner.uid = :userId")
    List<PrivateEvent> findByOwnerId(@Param("userId") Integer userId);
} 