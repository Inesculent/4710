package com.api.controllers;

import com.api.models.Rso;
import com.api.models.University;
import com.api.models.User;
import com.api.services.RsoService;
import com.api.services.UniversityService;
import com.api.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {

    private final UniversityService universityService;
    private final UserService userService;
    private final RsoService rsoService;

    @Autowired
    public UniversityController(
            UniversityService universityService,
            UserService userService,
            RsoService rsoService) {
        this.universityService = universityService;
        this.userService = userService;
        this.rsoService = rsoService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUniversity(@RequestBody Map<String, Object> universityData) {
        try {
            int userId = universityData.containsKey("userId") ? 
                Integer.parseInt(universityData.get("userId").toString()) : 1; // Default superadmin
            String name = (String) universityData.get("name");
            String description = (String) universityData.get("description");
            int students = Integer.parseInt(universityData.get("numStudents").toString());
            
            // Check if the user exists and is a super admin
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            if (user.getSuperAdmin() == null) {
                throw new IllegalArgumentException("Only super admins can create universities");
            }
            
            // Create university object
            University university = new University();
            university.setName(name);
            university.setDescription(description);
            university.setStudents(students);
            
            // Save university
            University createdUniversity = universityService.createUniversity(university);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "University created successfully");
            response.put("universityId", createdUniversity.getUniversityId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get all rsos for a user
    @GetMapping("/rso/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserRsos(@PathVariable int userId) {
        try {
            System.out.println("Getting RSOs for user: " + userId);
            List<Rso> rsos = rsoService.getRsosByUserId(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rsos", rsos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/rso/create")
    public ResponseEntity<Map<String, Object>> createRso(@RequestBody Map<String, Object> rsoData) {
        try {
            String rsoName = (String) rsoData.get("rsoName");
            String description = (String) rsoData.get("description");
            String adminEmail = (String) rsoData.get("adminEmail");
            String emailDomain = (String) rsoData.get("emailDomain");
            
            // Get userId from request and find the user
            int userId = rsoData.containsKey("userId") ? 
                Integer.parseInt(rsoData.get("userId").toString()) : 0;
                
            if (userId == 0) {
                throw new IllegalArgumentException("User ID is required");
            }
            
            // Get user and their university
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Get university from user based on their role
            int universityId;
            if (user.getStudent() != null) {
                universityId = user.getStudent().getUniversity().getUniversityId();
            } else if (user.getAdmin() != null) {
                universityId = user.getAdmin().getUniversity().getUniversityId();
            } else if (rsoData.containsKey("universityId")) {
                universityId = Integer.parseInt(rsoData.get("universityId").toString());
            } else {
                throw new IllegalArgumentException("User is not associated with a university");
            }
            
            // Verify university exists
            University university = universityService.getUniversityById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            
            // Create RSO
            Rso rso = new Rso();
            rso.setRsoName(rsoName);
            rso.setDescription(description);
            rso.setUniversityId(universityId);
            rso.setAdminEmail(adminEmail);
            rso.setEmailDomain(emailDomain);
            rso.setIsActive(false); // Initially inactive until it has enough members
            
            // Save RSO
            Rso createdRso = rsoService.createRso(rso);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rsoId", createdRso.getRsoId());
            response.put("message", "RSO created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/rso/join")
    public ResponseEntity<Map<String, Object>> joinRso(@RequestBody Map<String, Integer> joinData) {
        try {
            int rsoId = joinData.get("rsoId");
            int userId = joinData.get("userId");
            
            // Get user and RSO
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Add member to RSO - this handles validation internally
            Rso updatedRso = rsoService.addMember(rsoId, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully joined RSO");
            response.put("isActive", updatedRso.getIsActive());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentUniversity(@PathVariable int studentId) {
        try {
            // Get user
            User user = userService.getUserById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + studentId));
            
            // Check if user is a student
            if (user.getStudent() == null) {
                throw new IllegalArgumentException("User is not a student");
            }
            
            // Get university
            University university = user.getStudent().getUniversity();
            
            Map<String, Object> response = new HashMap<>();
            if (university != null) {
                Map<String, Object> universityMap = new HashMap<>();
                universityMap.put("id", university.getUniversityId());
                universityMap.put("name", university.getName());
                universityMap.put("description", university.getDescription());
                universityMap.put("students", university.getStudents());
                
                response.put("success", true);
                response.put("university", universityMap);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "No university found for the student");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/rso/{rsoId}")
    public ResponseEntity<Map<String, Object>> getRsoUniversity(@PathVariable int rsoId) {
        try {
            // Get RSO
            Rso rso = rsoService.getRsoById(rsoId)
                    .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
            
            // Get university
            University university = universityService.getUniversityById(rso.getUniversityId())
                    .orElseThrow(() -> new IllegalArgumentException("University not found for RSO"));
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> universityMap = new HashMap<>();
            universityMap.put("id", university.getUniversityId());
            universityMap.put("name", university.getName());
            universityMap.put("description", university.getDescription());
            universityMap.put("students", university.getStudents());
            
            response.put("success", true);
            response.put("university", universityMap);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllUniversities() {
        try {
            List<University> universities = universityService.getAllUniversities();
            
            List<Map<String, Object>> universityList = universities.stream()
                    .map(university -> {
                        Map<String, Object> uniMap = new HashMap<>();
                        uniMap.put("id", university.getUniversityId());
                        uniMap.put("name", university.getName());
                        uniMap.put("description", university.getDescription());
                        uniMap.put("students", university.getStudents());
                        return uniMap;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("universities", universityList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{universityId}")
    public ResponseEntity<Map<String, Object>> getUniversityById(@PathVariable int universityId) {
        try {
            University university = universityService.getUniversityById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            
            Map<String, Object> universityMap = new HashMap<>();
            universityMap.put("id", university.getUniversityId());
            universityMap.put("name", university.getName());
            universityMap.put("description", university.getDescription());
            universityMap.put("students", university.getStudents());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("university", universityMap);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{universityId}")
    public ResponseEntity<Map<String, Object>> updateUniversity(
            @PathVariable int universityId,
            @RequestBody Map<String, Object> universityData) {
        try {
            // Get existing university
            University university = universityService.getUniversityById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            
            // Update fields
            if (universityData.containsKey("name")) {
                university.setName((String) universityData.get("name"));
            }
            
            if (universityData.containsKey("description")) {
                university.setDescription((String) universityData.get("description"));
            }
            
            if (universityData.containsKey("numStudents")) {
                university.setStudents(Integer.parseInt(universityData.get("numStudents").toString()));
            }
            
            // Save updated university
            University updatedUniversity = universityService.updateUniversity(universityId, university);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "University updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{universityId}")
    public ResponseEntity<Map<String, Object>> deleteUniversity(@PathVariable int universityId) {
        try {
            universityService.deleteUniversity(universityId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "University deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 