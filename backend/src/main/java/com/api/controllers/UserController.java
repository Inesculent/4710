package com.api.controllers;

import com.api.models.Admin;
import com.api.models.Student;
import com.api.models.SuperAdmin;
import com.api.models.User;
import com.api.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> userData) {
        try {
            String name = (String) userData.get("username");
            String password = (String) userData.get("password");
            String email = (String) userData.get("email");
            String role = (String) userData.get("role");
            int universityId = Integer.parseInt(userData.get("universityId").toString());
            
            // Create user object
            User user = new User();
            user.setName(name);
            user.setPassword(password);
            user.setEmail(email);
            
            // Create user
            User createdUser = userService.createUser(user);
            
            // Add role-specific record based on the role
            if ("student".equalsIgnoreCase(role)) {
                Student student = new Student();
                student.setUser(createdUser);
                // Set university - this would need UniversityService to be injected
                // student.setUniversity(universityService.getUniversityById(universityId).get());
                // studentRepository.save(student);
            } else if ("admin".equalsIgnoreCase(role)) {
                Admin admin = new Admin();
                admin.setUser(createdUser);
                // admin.setUniversity(universityService.getUniversityById(universityId).get());
                // adminRepository.save(admin);
            } else if ("superadmin".equalsIgnoreCase(role)) {
                SuperAdmin superAdmin = new SuperAdmin();
                superAdmin.setUser(createdUser);
                // superAdminRepository.save(superAdmin);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", createdUser.getUid());
            response.put("message", "User created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateUser(@RequestBody Map<String, Object> credentials) {
        try {
            String email = (String) credentials.get("email");
            String password = (String) credentials.get("password");
            
            boolean isValid = userService.verifyLogin(email, password);
            
            Map<String, Object> response = new HashMap<>();
            if (isValid) {
                Optional<User> userOpt = userService.getUserByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", user.getUid());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("name", user.getName());
                    
                    // Check roles
                    boolean isAdmin = user.getAdmin() != null;
                    boolean isSuperAdmin = user.getSuperAdmin() != null;
                    userInfo.put("isAdmin", isAdmin);
                    userInfo.put("isSuperAdmin", isSuperAdmin);
                    
                    response.put("success", true);
                    response.put("user", userInfo);
                    return ResponseEntity.ok(response);
                }
            }
            
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> userExists(@RequestParam String email) {
        try {
            boolean exists = userService.getUserByEmail(email).isPresent();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/admin/{userId}")
    public ResponseEntity<Map<String, Object>> isAdmin(@PathVariable int userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            boolean isAdmin = userOpt.map(user -> user.getAdmin() != null).orElse(false);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isAdmin", isAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/superadmin/{userId}")
    public ResponseEntity<Map<String, Object>> isSuperAdmin(@PathVariable int userId) {
        try {
            Optional<User> userOpt = userService.getUserById(userId);
            boolean isSuperAdmin = userOpt.map(user -> user.getSuperAdmin() != null).orElse(false);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isSuperAdmin", isSuperAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}  