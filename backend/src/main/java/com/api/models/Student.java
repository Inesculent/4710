package com.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {
    @Id
    @Column(name = "uid")
    private Integer uid;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "uid")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "university_id")
    private University university;

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

    public University getUniversity() {
        return university;
    }

    public void setUniversity(University university) {
        this.university = university;
    }
} 