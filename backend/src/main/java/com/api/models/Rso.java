package com.api.models;

import jakarta.persistence.*;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "rso")
public class Rso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rsoId;
    
    @Column(unique = true)
    private String rsoName;
    
    private String description;
    
    @Column(name = "universityID")
    private Integer universityId;
    
    private String adminEmail;
    
    private String emailDomain;
    
    private Boolean isActive;
    
    @OneToMany(mappedBy = "rso")
    private List<RsoEvent> events;
    
    @ManyToMany(mappedBy = "rsos")
    private Set<User> members;
    
    // Getters and Setters
    public Integer getRsoId() {
        return rsoId;
    }

    public void setRsoId(Integer rsoId) {
        this.rsoId = rsoId;
    }

    public String getRsoName() {
        return rsoName;
    }

    public void setRsoName(String rsoName) {
        this.rsoName = rsoName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getUniversityId() {
        return universityId;
    }

    public void setUniversityId(Integer universityId) {
        this.universityId = universityId;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getEmailDomain() {
        return emailDomain;
    }

    public void setEmailDomain(String emailDomain) {
        this.emailDomain = emailDomain;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<RsoEvent> getEvents() {
        return events;
    }

    public void setEvents(List<RsoEvent> events) {
        this.events = events;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }
} 