package com.api.services.impl;

import com.api.models.University;
import com.api.repositories.UniversityRepository;
import com.api.services.UniversityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UniversityServiceImpl implements UniversityService {
    
    private final UniversityRepository universityRepository;
    
    @Autowired
    public UniversityServiceImpl(UniversityRepository universityRepository) {
        this.universityRepository = universityRepository;
    }
    
    @Override
    public List<University> getAllUniversities() {
        return universityRepository.findAll();
    }
    
    @Override
    public Optional<University> getUniversityById(Integer id) {
        return universityRepository.findById(id);
    }
    
    @Override
    public Optional<University> getUniversityByName(String name) {
        return universityRepository.findByName(name);
    }
    
    @Override
    public University createUniversity(University university) {
        return universityRepository.save(university);
    }
    
    @Override
    public University updateUniversity(Integer id, University university) {
        if (!universityRepository.existsById(id)) {
            throw new IllegalArgumentException("University not found with id: " + id);
        }
        
        university.setUniversityId(id);
        return universityRepository.save(university);
    }
    
    @Override
    public void deleteUniversity(Integer id) {
        if (!universityRepository.existsById(id)) {
            throw new IllegalArgumentException("University not found with id: " + id);
        }
        
        universityRepository.deleteById(id);
    }
}