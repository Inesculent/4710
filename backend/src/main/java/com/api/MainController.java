package com.api;

import org.springframework.web.bind.annotation.*;

import com.api.Main; // Ensure Main class is imported

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MainController {

    @PostMapping("/approveEvent")
    public boolean approveEvent(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam int eventId) {

        int userId = Main.validateUser(email, password);

        if (userId < 0){
            return false;
        }


        return Main.approveEvent(eventId, userId);
    }

    @PostMapping("/addComment")
    public boolean addComment(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam int eventId,
            @RequestParam String text,
            @RequestParam int rating,
            @RequestParam String date) {

        int userId = Main.validateUser(email, password);

        if (userId < 0){
            return false;
        }

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
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam int university_id,
            @RequestParam String eventType,
            @RequestParam double longitude,
            @RequestParam double latitude,
            @RequestParam int rso_id



    )
    {
        int ownerId = Main.validateUser(email, password);

        if (ownerId < 0){
            return -1;
        }
        return Main.createEvent(event, ownerId, university_id, eventType, longitude, latitude, rso_id);
    }

    @DeleteMapping("/deleteEvent")
    public boolean deleteEvent(@RequestParam int eventId) {
        return Main.deleteEvent(eventId);
    }

    @GetMapping("/getEvents")
    public List<Main.Event> getEvents(@RequestParam String email, @RequestParam String password) {

        int userId = Main.validateUser(email, password);

        if (userId < 0){
            return null;
        }

        return Main.getEvents(userId);
    }

    @GetMapping("/existsUser")
    public boolean existsUser(@RequestParam String email) {
        return Main.existsUser(email);
    }

    //If greater than 0, then we validated
    @PostMapping("/validateUser")
    public int validateUser(@RequestParam String email, @RequestParam String password) {
        return Main.validateUser(email, password);
    }

    @PostMapping("/createUser")
    public int createUser(
            @RequestParam String userType,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam int universityId) {
        return Main.createUser(userType, name, email, password, universityId);
    }
}
