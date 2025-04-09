package com.api.controllers;

import com.api.models.Comment;
import com.api.models.Event;
import com.api.models.User;
import com.api.services.CommentService;
import com.api.services.EventService;
import com.api.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;
    private final EventService eventService;

    @Autowired
    public CommentController(CommentService commentService, UserService userService, EventService eventService) {
        this.commentService = commentService;
        this.userService = userService;
        this.eventService = eventService;
    }

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addComment(@RequestBody Map<String, Object> commentData) {
        try {
            int userId = Integer.parseInt(commentData.get("userId").toString());
            int eventId = Integer.parseInt(commentData.get("eventId").toString());
            String text = (String) commentData.get("comment");
            int rating = Integer.parseInt(commentData.get("rating").toString());
            
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
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<Map<String, Object>> getCommentsByEvent(@PathVariable int eventId) {
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