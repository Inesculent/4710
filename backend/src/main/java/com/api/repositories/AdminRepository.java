package com.api.repositories;

import com.api.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO admin (uid, university_id) VALUES (:userId, :universityId)", nativeQuery = true)
    void createAdminRecord(@Param("userId") Integer userId, @Param("universityId") Integer universityId);
} 