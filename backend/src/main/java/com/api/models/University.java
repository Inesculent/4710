package com.api.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "university")
public class University {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer universityId;
    
    private String name;
    
    private Integer students;
    
    private String description;
    
    @OneToMany(mappedBy = "university")
    private List<Student> studentList;
    
    @OneToMany(mappedBy = "university")
    private List<Admin> adminList;
    
    @OneToMany(mappedBy = "university")
    private List<Event> events;
    
    // Getters and Setters
    public Integer getUniversityId() {
        return universityId;
    }

    public void setUniversityId(Integer universityId) {
        this.universityId = universityId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getStudents() {
        return students;
    }

    public void setStudents(Integer students) {
        this.students = students;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<Student> getStudentList() {
        return studentList;
    }
    
    public void setStudentList(List<Student> studentList) {
        this.studentList = studentList;
    }
    
    public List<Admin> getAdminList() {
        return adminList;
    }
    
    public void setAdminList(List<Admin> adminList) {
        this.adminList = adminList;
    }
    
    public List<Event> getEvents() {
        return events;
    }
    
    public void setEvents(List<Event> events) {
        this.events = events;
    }
} 