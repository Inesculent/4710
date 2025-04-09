package com.api.services.impl;

import com.api.models.*;
import com.api.repositories.EventRepository;
import com.api.repositories.PrivateEventRepository;
import com.api.repositories.PublicEventRepository;
import com.api.repositories.RsoEventRepository;
import com.api.repositories.UniversityRepository;
import com.api.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {
    
    private final EventRepository eventRepository;
    private final PublicEventRepository publicEventRepository;
    private final PrivateEventRepository privateEventRepository;
    private final RsoEventRepository rsoEventRepository;
    private final UniversityRepository universityRepository;
    
    @Autowired
    public EventServiceImpl(
            EventRepository eventRepository,
            PublicEventRepository publicEventRepository,
            PrivateEventRepository privateEventRepository,
            RsoEventRepository rsoEventRepository,
            UniversityRepository universityRepository) {
        this.eventRepository = eventRepository;
        this.publicEventRepository = publicEventRepository;
        this.privateEventRepository = privateEventRepository;
        this.rsoEventRepository = rsoEventRepository;
        this.universityRepository = universityRepository;
    }
    
    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    @Override
    public Optional<Event> getEventById(Integer id) {
        return eventRepository.findById(id);
    }
    
    @Override
    public List<Event> getEventsByUniversityId(Integer universityId) {
        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
        return eventRepository.findByUniversity(university);
    }
    
    @Override
    public List<Event> getUpcomingEvents(LocalDate date) {
        return eventRepository.findByDateAfter(date);
    }
    
    @Override
    public List<Event> getUpcomingEventsByUniversity(Integer universityId, LocalDate date) {
        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new IllegalArgumentException("University not found with id: " + universityId));
        return eventRepository.findByUniversityAndDateAfter(university, date);
    }
    
    @Override
    public PublicEvent createPublicEvent(PublicEvent event) {
        return publicEventRepository.save(event);
    }
    
    @Override
    public PrivateEvent createPrivateEvent(PrivateEvent event) {
        return privateEventRepository.save(event);
    }
    
    @Override
    public RsoEvent createRsoEvent(RsoEvent event) {
        return rsoEventRepository.save(event);
    }
    
    @Override
    public Event updateEvent(Integer id, Event event) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with id: " + id);
        }
        
        event.setEventId(id);
        return eventRepository.save(event);
    }
    
    @Override
    public void deleteEvent(Integer id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with id: " + id);
        }
        
        eventRepository.deleteById(id);
    }
} 