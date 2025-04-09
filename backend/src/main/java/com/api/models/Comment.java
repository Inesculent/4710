package com.api.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@IdClass(CommentId.class)
public class Comment {
    
    @Id
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
    
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String text;
    
    private Integer rating;
    
    private LocalDateTime timestamp;
    
    // Getters and Setters
    public Event getEvent() {
        return event;
    }
    
    public void setEvent(Event event) {
        this.event = event;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
} 