package com.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "rso_events")
public class RsoEvent extends Event {
    
    @ManyToOne
    @JoinColumn(name = "rso_id")
    private Rso rso;
    
    // Getters and Setters
    public Rso getRso() {
        return rso;
    }
    
    public void setRso(Rso rso) {
        this.rso = rso;
    }
} 