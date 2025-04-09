package com.api.models;

import jakarta.persistence.*;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer uid;
    
    private String name;
    
    @Column(unique = true)
    private String email;
    
    private String password;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Student student;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Admin admin;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private SuperAdmin superAdmin;
    
    @OneToMany(mappedBy = "owner")
    private List<PublicEvent> publicEvents;
    
    @OneToMany(mappedBy = "owner")
    private List<PrivateEvent> privateEvents;
    
    @ManyToMany
    @JoinTable(
        name = "user_access",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private Set<Event> accessibleEvents;
    
    @ManyToMany
    @JoinTable(
        name = "user_rso",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "rso_id")
    )
    private Set<Rso> rsos;
    
    @OneToMany(mappedBy = "user")
    private List<Comment> comments;
    
    // Getters and Setters
    public Integer getUid() {
        return uid;
    }

    public void setUid(Integer uid) {
        this.uid = uid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    // Relationship getters and setters
    public Student getStudent() {
        return student;
    }
    
    public void setStudent(Student student) {
        this.student = student;
    }
    
    public Admin getAdmin() {
        return admin;
    }
    
    public void setAdmin(Admin admin) {
        this.admin = admin;
    }
    
    public SuperAdmin getSuperAdmin() {
        return superAdmin;
    }
    
    public void setSuperAdmin(SuperAdmin superAdmin) {
        this.superAdmin = superAdmin;
    }
    
    public List<PublicEvent> getPublicEvents() {
        return publicEvents;
    }
    
    public void setPublicEvents(List<PublicEvent> publicEvents) {
        this.publicEvents = publicEvents;
    }
    
    public List<PrivateEvent> getPrivateEvents() {
        return privateEvents;
    }
    
    public void setPrivateEvents(List<PrivateEvent> privateEvents) {
        this.privateEvents = privateEvents;
    }
    
    public Set<Event> getAccessibleEvents() {
        return accessibleEvents;
    }
    
    public void setAccessibleEvents(Set<Event> accessibleEvents) {
        this.accessibleEvents = accessibleEvents;
    }
    
    public Set<Rso> getRsos() {
        return rsos;
    }
    
    public void setRsos(Set<Rso> rsos) {
        this.rsos = rsos;
    }
    
    public List<Comment> getComments() {
        return comments;
    }
    
    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
} 