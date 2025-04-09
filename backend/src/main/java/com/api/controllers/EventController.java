package com.api.controllers;

import com.api.models.*;
import com.api.services.CommentService;
import com.api.services.EventService;
import com.api.services.LocationService;
import com.api.services.UserService;
import com.api.services.UniversityService;
import com.api.services.RsoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserService userService;
    private final LocationService locationService;
    private final UniversityService universityService;
    private final RsoService rsoService;
    private final CommentService commentService;

    @Autowired
    public EventController(
            EventService eventService,
            UserService userService,
            LocationService locationService,
            UniversityService universityService,
            RsoService rsoService,
            CommentService commentService) {
        this.eventService = eventService;
        this.userService = userService;
        this.locationService = locationService;
        this.universityService = universityService;
        this.rsoService = rsoService;
        this.commentService = commentService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Map<String, Object> eventData) {
        try {
            String name = (String) eventData.get("name");
            String description = (String) eventData.get("description");
            String time = (String) eventData.get("time");
            String date = (String) eventData.get("date");
            double longitude = Double.parseDouble(eventData.get("longitude").toString());
            double latitude = Double.parseDouble(eventData.get("latitude").toString());
            String type = (String) eventData.get("type");
            int rsoId = eventData.containsKey("rsoId") ? Integer.parseInt(eventData.get("rsoId").toString()) : 0;
            int universityId = Integer.parseInt(eventData.get("universityId").toString());
            int ownerId = Integer.parseInt(eventData.get("ownerId").toString());
            
            // Parse date and time
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            
            LocalDate localDate = LocalDate.parse(date, dateFormatter);
            LocalTime startTime = LocalTime.parse(time, timeFormatter);
            
            // Default end time to 1 hour after start if not provided
            LocalTime endTime = startTime.plusHours(1);
            if (eventData.containsKey("endTime")) {
                endTime = LocalTime.parse((String)eventData.get("endTime"), timeFormatter);
            }
            
            // Get owner
            User owner = userService.getUserById(ownerId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + ownerId));
            
            // Get or create location
            Location location = new Location();
            location.setLongitude(longitude);
            location.setLatitude(latitude);
            location = locationService.createLocation(location);
            
            // Get university
            University university = universityService.getUniversityById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            
            // Create different event types based on the 'type' parameter
            Event event = null;
            
            if ("public".equalsIgnoreCase(type)) {
                PublicEvent publicEvent = new PublicEvent();
                publicEvent.setTitle(name);
                publicEvent.setDescription(description);
                publicEvent.setDate(localDate);
                publicEvent.setStart(startTime);
                publicEvent.setEnd(endTime);
                publicEvent.setLocation(location);
                publicEvent.setUniversity(university);
                publicEvent.setOwner(owner);
                publicEvent.setApproved(false); // Needs approval by default
                
                event = eventService.createPublicEvent(publicEvent);
            } else if ("private".equalsIgnoreCase(type)) {
                PrivateEvent privateEvent = new PrivateEvent();
                privateEvent.setTitle(name);
                privateEvent.setDescription(description);
                privateEvent.setDate(localDate);
                privateEvent.setStart(startTime);
                privateEvent.setEnd(endTime);
                privateEvent.setLocation(location);
                privateEvent.setUniversity(university);
                privateEvent.setOwner(owner);
                
                event = eventService.createPrivateEvent(privateEvent);
            } else if ("rso".equalsIgnoreCase(type) && rsoId > 0) {
                Rso rso = rsoService.getRsoById(rsoId)
                        .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
                
                RsoEvent rsoEvent = new RsoEvent();
                rsoEvent.setTitle(name);
                rsoEvent.setDescription(description);
                rsoEvent.setDate(localDate);
                rsoEvent.setStart(startTime);
                rsoEvent.setEnd(endTime);
                rsoEvent.setLocation(location);
                rsoEvent.setUniversity(university);
                rsoEvent.setRso(rso);
                
                event = eventService.createRsoEvent(rsoEvent);
            } else {
                throw new IllegalArgumentException("Invalid event type or missing RSO ID for RSO event");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("eventId", event.getEventId());
            response.put("message", "Event created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Map<String, Object>> deleteEvent(@PathVariable int eventId) {
        try {
            eventService.deleteEvent(eventId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Event deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/approve")
    public ResponseEntity<Map<String, Object>> approveEvent(@RequestBody Map<String, Object> approvalData) {
        try {
            int eventId = Integer.parseInt(approvalData.get("eventId").toString());
            
            // Find event
            Event event = eventService.getEventById(eventId)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
            
            // Check if it's a public event
            if (!(event instanceof PublicEvent)) {
                throw new IllegalArgumentException("Only public events can be approved");
            }
            
            PublicEvent publicEvent = (PublicEvent) event;
            publicEvent.setApproved(true);
            
            // Update event
            eventService.updateEvent(eventId, publicEvent);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Event approved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getEvents(
            @RequestParam(required = false) Integer universityId,
            @RequestParam(required = false) Integer rsoId,
            @RequestParam(required = false) String type) {
        try {
            List<Event> eventsList;
            
            // Get events based on filters
            if (universityId != null) {
                eventsList = eventService.getEventsByUniversityId(universityId);
            } else {
                eventsList = eventService.getAllEvents();
            }
            
            // Additional filtering based on type
            if (type != null && !type.isEmpty()) {
                eventsList = eventsList.stream()
                        .filter(event -> {
                            if ("public".equalsIgnoreCase(type)) {
                                return event instanceof PublicEvent;
                            } else if ("private".equalsIgnoreCase(type)) {
                                return event instanceof PrivateEvent;
                            } else if ("rso".equalsIgnoreCase(type)) {
                                return event instanceof RsoEvent;
                            }
                            return true;
                        })
                        .collect(Collectors.toList());
            }
            
            // RSO filtering
            if (rsoId != null && rsoId > 0) {
                // This would require a specialized service method or filtering in-memory
                eventsList = eventsList.stream()
                        .filter(event -> event instanceof RsoEvent && 
                                ((RsoEvent)event).getRso().getRsoId().equals(rsoId))
                        .collect(Collectors.toList());
            }
            
            // Convert Event objects to Map for response
            List<Map<String, Object>> eventsResponse = new ArrayList<>();
            for (Event event : eventsList) {
                Map<String, Object> eventMap = new HashMap<>();
                eventMap.put("id", event.getEventId());
                eventMap.put("title", event.getTitle());
                eventMap.put("description", event.getDescription());
                eventMap.put("date", event.getDate().toString());
                eventMap.put("startTime", event.getStart().toString());
                eventMap.put("endTime", event.getEnd().toString());
                
                // Add event type
                if (event instanceof PublicEvent) {
                    eventMap.put("type", "public");
                    eventMap.put("approved", ((PublicEvent)event).getApproved());
                } else if (event instanceof PrivateEvent) {
                    eventMap.put("type", "private");
                } else if (event instanceof RsoEvent) {
                    eventMap.put("type", "rso");
                    eventMap.put("rsoId", ((RsoEvent)event).getRso().getRsoId());
                    eventMap.put("rsoName", ((RsoEvent)event).getRso().getRsoName());
                }
                
                // Add location info
                if (event.getLocation() != null) {
                    eventMap.put("longitude", event.getLocation().getLongitude());
                    eventMap.put("latitude", event.getLocation().getLatitude());
                }
                
                eventsResponse.add(eventMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("events", eventsResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{eventId}/comments")
    public ResponseEntity<Map<String, Object>> addComment(@PathVariable int eventId, 
                                                        @RequestBody Map<String, Object> commentData) {
        try {
            int userId = Integer.parseInt(commentData.get("userId").toString());
            String text = (String) commentData.get("comment");
            int rating = commentData.containsKey("rating") ? 
                         Integer.parseInt(commentData.get("rating").toString()) : 5; // Default rating
            
            // Retrieve user and event
            User user = userService.getUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            Event event = eventService.getEventById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
            
            // Create comment
            Comment comment = new Comment();
            comment.setUser(user);
            comment.setEvent(event);
            comment.setText(text);
            comment.setRating(rating);
            comment.setTimestamp(LocalDateTime.now());
            
            // Save comment
            Comment savedComment = commentService.addComment(comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comment added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{eventId}/comments")
    public ResponseEntity<Map<String, Object>> getComments(@PathVariable int eventId) {
        try {
            List<Comment> commentsList = commentService.getCommentsByEvent(eventId);
            
            // Convert Comment objects to Map for response
            List<Map<String, Object>> commentsResponse = new ArrayList<>();
            for (Comment comment : commentsList) {
                Map<String, Object> commentMap = new HashMap<>();
                commentMap.put("eventId", comment.getEvent().getEventId());
                commentMap.put("userId", comment.getUser().getUid());
                commentMap.put("text", comment.getText());
                commentMap.put("rating", comment.getRating());
                commentMap.put("timestamp", comment.getTimestamp().toString());
                commentMap.put("userName", comment.getUser().getName()); // Include user name
                commentsResponse.add(commentMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("comments", commentsResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 