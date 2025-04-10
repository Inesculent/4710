package com.api.repositories;

import com.api.models.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Integer> {
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO super_admin (uid) VALUES (:userId)", nativeQuery = true)
    void createSuperAdminRecord(@Param("userId") Integer userId);
} 