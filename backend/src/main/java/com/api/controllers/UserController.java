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

    // Get user profile
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable int userId) {
        try {
            User user = userService.getUserById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> userData) {
        try {
            // Log received data
            System.out.println("Creating user with data: " + userData);
            
            String name = (String) userData.get("username");
            String password = (String) userData.get("password");
            String email = (String) userData.get("email");
            String role = (String) userData.get("role");
            
            // Validate required fields
            if (name == null || password == null || email == null || role == null) {
                String missing = "";
                if (name == null) missing += "username, ";
                if (password == null) missing += "password, ";
                if (email == null) missing += "email, ";
                if (role == null) missing += "role, ";
                
                String message = "Missing required fields: " + missing.substring(0, missing.length() - 2);
                System.err.println(message);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", message);
                return ResponseEntity.badRequest().body(response);
            }
            
            // Parse universityId with error handling
            int universityId;
            try {
                Object universityIdObj = userData.get("universityId");
                if (universityIdObj == null) {
                    String message = "University ID is required";
                    System.err.println(message);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", message);
                    return ResponseEntity.badRequest().body(response);
                }
                
                if (universityIdObj instanceof Integer) {
                    universityId = (Integer) universityIdObj;
                } else {
                    universityId = Integer.parseInt(universityIdObj.toString());
                }
            } catch (NumberFormatException e) {
                String message = "Invalid university ID format: " + userData.get("universityId");
                System.err.println(message);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", message);
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("Parsed university ID: " + universityId);
            
            // Create user object
            User user = new User();
            user.setName(name);
            user.setPassword(password);
            user.setEmail(email);
            
            // Create user
            System.out.println("Creating base user record");
            User createdUser = userService.createUser(user);
            System.out.println("Created user with ID: " + createdUser.getUid());
            
            try {
                // Add role-specific record based on the role
                System.out.println("Creating role: " + role);
                
                if ("student".equalsIgnoreCase(role)) {
                    userService.createStudentRole(createdUser.getUid(), universityId);
                    System.out.println("Created student role for user: " + createdUser.getUid());
                } else if ("admin".equalsIgnoreCase(role)) {
                    userService.createAdminRole(createdUser.getUid(), universityId);
                    System.out.println("Created admin role for user: " + createdUser.getUid());
                } else if ("superadmin".equalsIgnoreCase(role)) {
                    userService.createSuperAdminRole(createdUser.getUid());
                    System.out.println("Created superadmin role for user: " + createdUser.getUid());
                } else {
                    String message = "Invalid role: " + role;
                    System.err.println(message);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", message);
                    return ResponseEntity.badRequest().body(response);
                }
            } catch (Exception e) {
                System.err.println("Error creating role, deleting user: " + e.getMessage());
                
                // If role creation fails, delete the user
                try {
                    userService.deleteUser(createdUser.getUid());
                } catch (Exception deleteEx) {
                    System.err.println("Error deleting user after role creation failed: " + deleteEx.getMessage());
                }
                
                throw e;
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", createdUser.getUid());
            response.put("message", "User created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Print full stack trace for debugging
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