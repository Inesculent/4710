package com.api.controllers;

import com.api.models.Rso;
import com.api.models.User;
import com.api.services.RsoService;
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
@RequestMapping("/api/rsos")
public class RsoController {

    private final RsoService rsoService;
    private final UserService userService;

    @Autowired
    public RsoController(RsoService rsoService, UserService userService) {
        this.rsoService = rsoService;
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createRso(@RequestBody Map<String, Object> rsoData) {
        try {
            String name = (String) rsoData.get("name");
            String description = (String) rsoData.get("description");
            int universityId = Integer.parseInt(rsoData.get("universityId").toString());
            String adminEmail = (String) rsoData.get("adminEmail");
            String emailDomain = (String) rsoData.get("emailDomain");
            
            // Create RSO object
            Rso rso = new Rso();
            rso.setRsoName(name);
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
    
    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinRso(@RequestBody Map<String, Object> joinData) {
        try {
            int rsoId = Integer.parseInt(joinData.get("rsoId").toString());
            int userId = Integer.parseInt(joinData.get("userId").toString());
            
            // Get user
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Add user to RSO
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
    
    @GetMapping("/university/{universityId}")
    public ResponseEntity<Map<String, Object>> getRsosByUniversity(@PathVariable int universityId) {
        try {
            List<Rso> rsos = rsoService.getRsosByUniversityId(universityId);
            
            List<Map<String, Object>> rsoList = rsos.stream()
                    .map(rso -> {
                        Map<String, Object> rsoMap = new HashMap<>();
                        rsoMap.put("id", rso.getRsoId());
                        rsoMap.put("name", rso.getRsoName());
                        rsoMap.put("description", rso.getDescription());
                        rsoMap.put("isActive", rso.getIsActive());
                        rsoMap.put("adminEmail", rso.getAdminEmail());
                        rsoMap.put("memberCount", rso.getMembers() != null ? rso.getMembers().size() : 0);
                        return rsoMap;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rsos", rsoList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getRsosByUser(@PathVariable int userId) {
        try {
            // Get user
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Get RSOs for user
            List<Map<String, Object>> rsoList = new ArrayList<>();
            if (user.getRsos() != null) {
                rsoList = user.getRsos().stream()
                        .map(rso -> {
                            Map<String, Object> rsoMap = new HashMap<>();
                            rsoMap.put("id", rso.getRsoId());
                            rsoMap.put("name", rso.getRsoName());
                            rsoMap.put("description", rso.getDescription());
                            rsoMap.put("isActive", rso.getIsActive());
                            rsoMap.put("adminEmail", rso.getAdminEmail());
                            rsoMap.put("memberCount", rso.getMembers() != null ? rso.getMembers().size() : 0);
                            return rsoMap;
                        })
                        .collect(Collectors.toList());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rsos", rsoList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{rsoId}")
    public ResponseEntity<Map<String, Object>> getRsoDetails(@PathVariable int rsoId) {
        try {
            Rso rso = rsoService.getRsoById(rsoId)
                    .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
            
            Map<String, Object> rsoMap = new HashMap<>();
            rsoMap.put("id", rso.getRsoId());
            rsoMap.put("name", rso.getRsoName());
            rsoMap.put("description", rso.getDescription());
            rsoMap.put("universityId", rso.getUniversityId());
            rsoMap.put("isActive", rso.getIsActive());
            rsoMap.put("adminEmail", rso.getAdminEmail());
            rsoMap.put("emailDomain", rso.getEmailDomain());
            rsoMap.put("memberCount", rso.getMembers() != null ? rso.getMembers().size() : 0);
            
            // Get member details
            if (rso.getMembers() != null) {
                List<Map<String, Object>> memberList = rso.getMembers().stream()
                        .map(user -> {
                            Map<String, Object> userMap = new HashMap<>();
                            userMap.put("id", user.getUid());
                            userMap.put("name", user.getName());
                            userMap.put("email", user.getEmail());
                            return userMap;
                        })
                        .collect(Collectors.toList());
                rsoMap.put("members", memberList);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rso", rsoMap);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 