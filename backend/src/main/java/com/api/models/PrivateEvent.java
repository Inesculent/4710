package com.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "private_events")
public class PrivateEvent extends Event {
    
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
    
    // Getters and Setters
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
} 