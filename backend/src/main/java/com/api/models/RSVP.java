package com.api.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rsvps")
public class RSVP {
    
    @EmbeddedId
    private RSVPId id;
    
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @MapsId("eventId")
    @JoinColumn(name = "event_id")
    private Event event;
    
    @Column(name = "status")
    private String status; // "attending", "maybe", "not attending"
    
    @Column(name = "rsvp_date")
    private LocalDateTime rsvpDate;
    
    // Getters and Setters
    public RSVPId getId() {
        return id;
    }
    
    public void setId(RSVPId id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Event getEvent() {
        return event;
    }
    
    public void setEvent(Event event) {
        this.event = event;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getRsvpDate() {
        return rsvpDate;
    }
    
    public void setRsvpDate(LocalDateTime rsvpDate) {
        this.rsvpDate = rsvpDate;
    }
} 