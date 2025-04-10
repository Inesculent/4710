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
            // Log all received data
            System.out.println("======= CREATE EVENT REQUEST PAYLOAD =======");
            for (Map.Entry<String, Object> entry : eventData.entrySet()) {
                System.out.println(entry.getKey() + ": " + entry.getValue());
            }
            System.out.println("===========================================");
            
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
            
            // Set location description if provided - check both field names for compatibility
            if (eventData.containsKey("locationDescription")) {
                location.setDescription((String) eventData.get("locationDescription"));
            } else if (eventData.containsKey("description")) {
                location.setDescription((String) eventData.get("description"));
            }
            
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
    
    // Get all events
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("events", events);
        return ResponseEntity.ok(response);
    }

    // Get all public events for a user
    @GetMapping("/public/{userId}")
    public ResponseEntity<Map<String, Object>> getAllPublicUserEvents(@PathVariable int userId) {
        List<PublicEvent> events = eventService.getAllPublicUserEvents(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("events", events);
        return ResponseEntity.ok(response);
    }

    // Get all private events for a user
    @GetMapping("/private/{userId}")
    public ResponseEntity<Map<String, Object>> getAllPrivateUserEvents(@PathVariable int userId) {
        List<PrivateEvent> events = eventService.getAllPrivateUserEvents(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("events", events);
        return ResponseEntity.ok(response);
    }

    // Get events by RSO
    @GetMapping("/rso/{rsoId}")
    public ResponseEntity<Map<String, Object>> getEventsByRso(@PathVariable int rsoId) {
        try {
            // Validate RSO exists
            Rso rso = rsoService.getRsoById(rsoId)
                .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
            
            // Get all RSO events
            List<RsoEvent> events = eventService.getAllRsoEvents(rsoId);
            
            // Convert to standardized format
            List<Map<String, Object>> eventsList = events.stream()
                .map(event -> createEventMap(event, "rso"))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("events", eventsList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get events by University
    @GetMapping("/university/{universityId}")
    public ResponseEntity<Map<String, Object>> getEventsByUniversity(@PathVariable int universityId) {
        try {
            // Validate university exists
            University university = universityService.getUniversityById(universityId)
                .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            
            // Get events for this university
            List<Event> events = eventService.getEventsByUniversityId(universityId);
            
            // Convert to standardized format
            List<Map<String, Object>> eventsList = new ArrayList<>();
            
            // Process events based on type
            for (Event event : events) {
                String eventType = "event";
                if (event instanceof PublicEvent) {
                    eventType = "public";
                } else if (event instanceof PrivateEvent) {
                    eventType = "private";
                } else if (event instanceof RsoEvent) {
                    eventType = "rso";
                }
                
                Map<String, Object> eventMap = createEventMap(event, eventType);
                eventsList.add(eventMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("events", eventsList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get all events for a user (public and private)
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getAllUserEvents(@PathVariable int userId) {
        try {
            // Get user
            User user = userService.getUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            
            // Get all public and private events for the user
            List<PublicEvent> publicEvents = eventService.getAllPublicUserEvents(userId);
            List<PrivateEvent> privateEvents = eventService.getAllPrivateUserEvents(userId);
            
            // Combine into a single response
            List<Map<String, Object>> combinedEvents = new ArrayList<>();
            
            // Add public events
            for (PublicEvent event : publicEvents) {
                Map<String, Object> eventMap = createEventMap(event, "public");
                combinedEvents.add(eventMap);
            }
            
            // Add private events
            for (PrivateEvent event : privateEvents) {
                Map<String, Object> eventMap = createEventMap(event, "private");
                combinedEvents.add(eventMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("events", combinedEvents);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Get a specific event by ID
    @GetMapping("/event/{eventId}")
    public ResponseEntity<Map<String, Object>> getEventById(@PathVariable int eventId) {
        try {
            // Get the event
            Event event = eventService.getEventById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
            
            // Determine event type
            String eventType = "event";
            if (event instanceof PublicEvent) {
                eventType = "public";
            } else if (event instanceof PrivateEvent) {
                eventType = "private";
            } else if (event instanceof RsoEvent) {
                eventType = "rso";
            }
            
            // Create standardized response
            Map<String, Object> eventMap = createEventMap(event, eventType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("event", eventMap);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Search events by name, description, date range, and type
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchEvents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer universityId,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radius) {
        
        try {
            // Parse dates if provided
            LocalDate start = null;
            LocalDate end = null;
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDate.parse(startDate, dateFormatter);
            }
            
            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDate.parse(endDate, dateFormatter);
            }
            
            // Get university if provided
            University university = null;
            if (universityId != null && universityId > 0) {
                university = universityService.getUniversityById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
            }
            
            // Perform search
            List<Event> events = eventService.searchEvents(query, start, end, university, eventType);
            
            // Filter by location if coordinates and radius provided
            if (latitude != null && longitude != null && radius != null) {
                events = events.stream()
                    .filter(event -> {
                        if (event.getLocation() == null) return false;
                        
                        double eventLat = event.getLocation().getLatitude();
                        double eventLng = event.getLocation().getLongitude();
                        
                        // Calculate distance between points (Haversine formula)
                        double distance = calculateDistance(latitude, longitude, eventLat, eventLng);
                        return distance <= radius;
                    })
                    .collect(Collectors.toList());
            }
            
            // Convert to standardized format
            List<Map<String, Object>> eventsList = new ArrayList<>();
            for (Event event : events) {
                String type = "event";
                if (event instanceof PublicEvent) {
                    type = "public";
                } else if (event instanceof PrivateEvent) {
                    type = "private";
                } else if (event instanceof RsoEvent) {
                    type = "rso";
                }
                
                Map<String, Object> eventMap = createEventMap(event, type);
                eventsList.add(eventMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("events", eventsList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Calculate distance between two points using Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Earth's radius in kilometers
        final double EARTH_RADIUS = 6371.0;
        
        // Convert degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);
        
        // Haversine formula
        double dLat = lat2Rad - lat1Rad;
        double dLon = lon2Rad - lon1Rad;
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        double distance = EARTH_RADIUS * c;
        
        return distance;
    }
    
    // Helper method to create a standardized event map
    private Map<String, Object> createEventMap(Event event, String eventType) {
        Map<String, Object> eventMap = new HashMap<>();
        eventMap.put("id", event.getEventId());
        eventMap.put("title", event.getTitle());
        eventMap.put("description", event.getDescription());
        eventMap.put("date", event.getDate().toString());
        eventMap.put("startTime", event.getStart().toString());
        eventMap.put("endTime", event.getEnd().toString());
        eventMap.put("type", eventType);
        
        // Add location info if available
        if (event.getLocation() != null) {
            eventMap.put("longitude", event.getLocation().getLongitude());
            eventMap.put("latitude", event.getLocation().getLatitude());
            eventMap.put("locationId", event.getLocation().getLocID());
            eventMap.put("locationDescription", event.getLocation().getDescription());
        }
        
        // Add university info if available
        if (event.getUniversity() != null) {
            eventMap.put("universityId", event.getUniversity().getUniversityId());
            eventMap.put("universityName", event.getUniversity().getName());
        }
        
        // Add event-type specific fields
        if (event instanceof PublicEvent) {
            eventMap.put("approved", ((PublicEvent) event).getApproved());
            eventMap.put("ownerId", ((PublicEvent) event).getOwner().getUid());
        } else if (event instanceof PrivateEvent) {
            eventMap.put("ownerId", ((PrivateEvent) event).getOwner().getUid());
        } else if (event instanceof RsoEvent && ((RsoEvent) event).getRso() != null) {
            eventMap.put("rsoId", ((RsoEvent) event).getRso().getRsoId());
            eventMap.put("rsoName", ((RsoEvent) event).getRso().getRsoName());
        }
        
        return eventMap;
    }

    // Add comment to event
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
    
    // Get comments for event
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