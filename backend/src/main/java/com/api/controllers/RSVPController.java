package com.api.controllers;

import com.api.models.Event;
import com.api.models.RSVP;
import com.api.models.RSVPId;
import com.api.models.User;
import com.api.services.EventService;
import com.api.services.RSVPService;
import com.api.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rsvps")
public class RSVPController {

    private final RSVPService rsvpService;
    private final UserService userService;
    private final EventService eventService;

    @Autowired
    public RSVPController(
            RSVPService rsvpService,
            UserService userService,
            EventService eventService) {
        this.rsvpService = rsvpService;
        this.userService = userService;
        this.eventService = eventService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createRSVP(@RequestBody Map<String, Object> rsvpData) {
        try {
            int userId = Integer.parseInt(rsvpData.get("userId").toString());
            int eventId = Integer.parseInt(rsvpData.get("eventId").toString());
            String status = (String) rsvpData.get("status");

            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

            Event event = eventService.getEventById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));

            RSVP rsvp = new RSVP();
            RSVPId rsvpId = new RSVPId(userId, eventId);
            rsvp.setId(rsvpId);
            rsvp.setUser(user);
            rsvp.setEvent(event);
            rsvp.setStatus(status);
            rsvp.setRsvpDate(LocalDateTime.now());

            RSVP savedRSVP = rsvpService.createRSVP(rsvp);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "RSVP created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateRSVP(@RequestBody Map<String, Object> rsvpData) {
        try {
            int userId = Integer.parseInt(rsvpData.get("userId").toString());
            int eventId = Integer.parseInt(rsvpData.get("eventId").toString());
            String status = (String) rsvpData.get("status");

            RSVP updatedRSVP = rsvpService.updateRSVP(userId, eventId, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "RSVP updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{userId}/{eventId}")
    public ResponseEntity<Map<String, Object>> deleteRSVP(
            @PathVariable int userId,
            @PathVariable int eventId) {
        try {
            rsvpService.deleteRSVP(userId, eventId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "RSVP deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<Map<String, Object>> getEventRSVPs(@PathVariable int eventId) {
        try {
            List<RSVP> rsvps = rsvpService.getEventRSVPs(eventId);
            
            List<Map<String, Object>> rsvpList = rsvps.stream()
                    .map(this::convertRSVPToMap)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rsvps", rsvpList);
            response.put("attendeeCount", rsvpService.countEventAttendees(eventId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserRSVPs(@PathVariable int userId) {
        try {
            List<RSVP> rsvps = rsvpService.getUserRSVPs(userId);
            
            List<Map<String, Object>> rsvpList = rsvps.stream()
                    .map(this::convertRSVPToMap)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("rsvps", rsvpList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{userId}/{eventId}")
    public ResponseEntity<Map<String, Object>> getRSVPStatus(
            @PathVariable int userId,
            @PathVariable int eventId) {
        try {
            RSVP rsvp = rsvpService.getRSVP(userId, eventId)
                    .orElseThrow(() -> new IllegalArgumentException("RSVP not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", rsvp.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Helper method to convert RSVP to Map
    private Map<String, Object> convertRSVPToMap(RSVP rsvp) {
        Map<String, Object> map = new HashMap<>();
        map.put("userId", rsvp.getUser().getUid());
        map.put("userName", rsvp.getUser().getName());
        map.put("eventId", rsvp.getEvent().getEventId());
        map.put("eventTitle", rsvp.getEvent().getTitle());
        map.put("status", rsvp.getStatus());
        map.put("rsvpDate", rsvp.getRsvpDate().toString());
        return map;
    }
} 