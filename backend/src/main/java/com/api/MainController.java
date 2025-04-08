package com.api;

import org.springframework.web.bind.annotation.*;

import com.api.Main; // Ensure Main class is imported

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MainController {

    @PostMapping("/approveEvent")
    public boolean approveEvent(@RequestParam int eventId, @RequestParam int userId) {
        return Main.approveEvent(eventId, userId);
    }

    @PostMapping("/addComment")
    public boolean addComment(
            @RequestParam int eventId,
            @RequestParam int userId,
            @RequestParam String text,
            @RequestParam int rating,
            @RequestParam String date) {
        Timestamp timestamp = Timestamp.valueOf(date);
        return Main.addComment(eventId, userId, text, rating, timestamp);
    }

    @GetMapping("/getComments")
    public List<Main.Comment> getComments(@RequestParam int eventId) {
        return Main.getComments(eventId);
    }

    @PostMapping("/createEvent")
    public int createEvent(
            @RequestBody Main.Event event,
            @RequestParam int ownerId,
            @RequestParam String eventType) {
        return Main.createEvent(event, ownerId, eventType);
    }

    @DeleteMapping("/deleteEvent")
    public boolean deleteEvent(@RequestParam int eventId) {
        return Main.deleteEvent(eventId);
    }

    @GetMapping("/getEvents")
    public List<Main.Event> getEvents(@RequestParam int userId) {
        return Main.getEvents(userId);
    }

    @GetMapping("/existsUser")
    public boolean existsUser(@RequestParam int uid) {
        return Main.existsUser(uid);
    }

    @PostMapping("/validateUser")
    public boolean validateUser(@RequestParam String email, @RequestParam String password) {
        return Main.validateUser(email, password);
    }

    @PostMapping("/createUser")
    public boolean createUser(
            @RequestParam String userType,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam int uid,
            @RequestParam String password) {
        return Main.createUser(userType, name, email, uid, password);
    }
}
