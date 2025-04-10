package com.api.repositories;

import com.api.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO student (uid, university_id) VALUES (:userId, :universityId)", nativeQuery = true)
    void createStudentRecord(@Param("userId") Integer userId, @Param("universityId") Integer universityId);
} 