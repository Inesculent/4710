package com.api.services;

import com.api.models.University;

import java.util.List;
import java.util.Optional;

public interface UniversityService {
    List<University> getAllUniversities();
    Optional<University> getUniversityById(Integer id);
    Optional<University> getUniversityByName(String name);
    University createUniversity(University university);
    University updateUniversity(Integer id, University university);
    void deleteUniversity(Integer id);
} 