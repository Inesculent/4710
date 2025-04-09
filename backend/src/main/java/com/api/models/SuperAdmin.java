package com.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "super_admin")
public class SuperAdmin {
    @Id
    @Column(name = "uid")
    private Integer uid;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "uid")
    private User user;

    public Integer getUid() {
        return uid;
    }
    
    public void setUid(Integer uid) {
        this.uid = uid;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    } 
} 