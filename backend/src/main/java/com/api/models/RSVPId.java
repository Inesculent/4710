package com.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RSVPId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "event_id")
    private Integer eventId;
    
    // Default constructor
    public RSVPId() {
    }
    
    // Constructor with parameters
    public RSVPId(Integer userId, Integer eventId) {
        this.userId = userId;
        this.eventId = eventId;
    }
    
    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Integer getEventId() {
        return eventId;
    }
    
    public void setEventId(Integer eventId) {
        this.eventId = eventId;
    }
    
    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RSVPId rsvpId = (RSVPId) o;
        return Objects.equals(userId, rsvpId.userId) && Objects.equals(eventId, rsvpId.eventId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(userId, eventId);
    }
} 