package com.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "public_events")
public class PublicEvent extends Event {
    
    private Boolean approved;
    
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
    
    // Getters and Setters
    public Boolean getApproved() {
        return approved;
    }
    
    public void setApproved(Boolean approved) {
        this.approved = approved;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
} 