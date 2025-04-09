package com.api.models;

import java.io.Serializable;
import java.util.Objects;

public class CommentId implements Serializable {
    private Integer event;  // Must match the property name in Comment class
    private Integer user;   // Must match the property name in Comment class
    
    // Default constructor required by JPA
    public CommentId() {}
    
    public CommentId(Integer event, Integer user) {
        this.event = event;
        this.user = user;
    }
    
    // Equals and hashCode methods are required for a composite key class
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CommentId commentId = (CommentId) o;
        return Objects.equals(event, commentId.event) && Objects.equals(user, commentId.user);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(event, user);
    }

    // Getters and setters
    public Integer getEvent() {
        return event;
    }

    public void setEvent(Integer event) {
        this.event = event;
    }

    public Integer getUser() {
        return user;
    }

    public void setUser(Integer user) {
        this.user = user;
    }
} 