package com.api.services.impl;

import com.api.models.Admin;
import com.api.models.Student;
import com.api.models.SuperAdmin;
import com.api.models.University;
import com.api.models.User;
import com.api.repositories.AdminRepository;
import com.api.repositories.StudentRepository;
import com.api.repositories.SuperAdminRepository;
import com.api.repositories.UniversityRepository;
import com.api.repositories.UserRepository;
import com.api.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final SuperAdminRepository superAdminRepository;
    private final UniversityRepository universityRepository;
    
    @Autowired
    public UserServiceImpl(
            UserRepository userRepository,
            StudentRepository studentRepository,
            AdminRepository adminRepository,
            SuperAdminRepository superAdminRepository,
            UniversityRepository universityRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.superAdminRepository = superAdminRepository;
        this.universityRepository = universityRepository;
    }
    
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Override
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
    
    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public User createUser(User user) {
        // Check if user with email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists");
        }
        return userRepository.save(user);
    }
    
    @Override
    public User updateUser(Integer id, User user) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User with id " + id + " not found");
        }
        
        user.setUid(id);
        return userRepository.save(user);
    }
    
    @Override
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User with id " + id + " not found");
        }
        
        userRepository.deleteById(id);
    }
    
    @Override
    public boolean verifyLogin(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(user -> user.getPassword().equals(password)).orElse(false);
    }
    
    @Override
    public void createStudentRole(Integer userId, Integer universityId) {
        try {
            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Get university
            Optional<University> universityOpt = universityRepository.findById(universityId);
            if (universityOpt.isEmpty()) {
                // Log error with more details
                System.err.println("Failed to find university with ID: " + universityId + 
                    ". Available universities: " + universityRepository.findAll().size());
                throw new IllegalArgumentException("University not found with id: " + universityId);
            }
            
            University university = universityOpt.get();
            
            // Create student - using direct JDBC approach
            System.out.println("Creating student role with SQL...");
            studentRepository.createStudentRecord(userId, universityId);
            
            System.out.println("Student role created successfully for user: " + userId);
        } catch (Exception e) {
            // Log the original error
            System.err.println("Error creating student role: " + e.getMessage());
            e.printStackTrace(); // Add stack trace for debugging
            throw e;
        }
    }
    
    @Override
    public void createAdminRole(Integer userId, Integer universityId) {
        try {
            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Get university
            University university = universityRepository.findById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            
            // Create admin - using direct JDBC approach
            System.out.println("Creating admin role with SQL...");
            adminRepository.createAdminRecord(userId, universityId);
            
            System.out.println("Admin role created successfully for user: " + userId);
        } catch (Exception e) {
            // Log the original error
            System.err.println("Error creating admin role: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public void createSuperAdminRole(Integer userId) {
        try {
            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Create super admin - using direct JDBC approach
            System.out.println("Creating superadmin role with SQL...");
            superAdminRepository.createSuperAdminRecord(userId);
            
            System.out.println("SuperAdmin role created successfully for user: " + userId);
        } catch (Exception e) {
            // Log the original error
            System.err.println("Error creating superadmin role: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
} 