package com.api.services.impl;

import com.api.models.*;
import com.api.repositories.EventRepository;
import com.api.repositories.PrivateEventRepository;
import com.api.repositories.PublicEventRepository;
import com.api.repositories.RsoEventRepository;
import com.api.repositories.RsoRepository;
import com.api.repositories.UniversityRepository;
import com.api.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {
    
    private final EventRepository eventRepository;
    private final PublicEventRepository publicEventRepository;
    private final PrivateEventRepository privateEventRepository;
    private final RsoEventRepository rsoEventRepository;
    private final UniversityRepository universityRepository;
    private final RsoRepository rsoRepository;
    
    @Autowired
    public EventServiceImpl(
            EventRepository eventRepository,
            PublicEventRepository publicEventRepository,
            PrivateEventRepository privateEventRepository,
            RsoEventRepository rsoEventRepository,
            UniversityRepository universityRepository,
            RsoRepository rsoRepository) {
        this.eventRepository = eventRepository;
        this.publicEventRepository = publicEventRepository;
        this.privateEventRepository = privateEventRepository;
        this.rsoEventRepository = rsoEventRepository;
        this.universityRepository = universityRepository;
        this.rsoRepository = rsoRepository;
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
    public List<PublicEvent> getAllPublicUserEvents(Integer userId) {
        return publicEventRepository.findByOwnerId(userId);
    }

    @Override
    public List<PrivateEvent> getAllPrivateUserEvents(Integer userId) {
        return privateEventRepository.findByOwnerId(userId);
    }
    
    @Override
    public List<RsoEvent> getAllRsoEvents(Integer rsoId) {
        // Get the RSO or throw exception
        Rso rso = rsoRepository.findById(rsoId)
            .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
        
        // Find all events for this RSO
        return rsoEventRepository.findByRso(rso);
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
    public List<Event> searchEvents(String query, LocalDate startDate, LocalDate endDate, University university, String eventType) {
        // Get all events initially
        List<Event> events = getAllEvents();
        
        // Apply filters based on provided criteria
        if (university != null) {
            events = events.stream()
                    .filter(event -> event.getUniversity() != null && 
                            event.getUniversity().getUniversityId().equals(university.getUniversityId()))
                    .collect(Collectors.toList());
        }
        
        // Filter by date range
        if (startDate != null) {
            events = events.stream()
                    .filter(event -> event.getDate() != null && 
                            (event.getDate().isEqual(startDate) || event.getDate().isAfter(startDate)))
                    .collect(Collectors.toList());
        }
        
        if (endDate != null) {
            events = events.stream()
                    .filter(event -> event.getDate() != null && 
                            (event.getDate().isEqual(endDate) || event.getDate().isBefore(endDate)))
                    .collect(Collectors.toList());
        }
        
        // Filter by event type
        if (eventType != null && !eventType.isEmpty()) {
            if ("public".equalsIgnoreCase(eventType)) {
                events = events.stream()
                        .filter(event -> event instanceof PublicEvent)
                        .collect(Collectors.toList());
            } else if ("private".equalsIgnoreCase(eventType)) {
                events = events.stream()
                        .filter(event -> event instanceof PrivateEvent)
                        .collect(Collectors.toList());
            } else if ("rso".equalsIgnoreCase(eventType)) {
                events = events.stream()
                        .filter(event -> event instanceof RsoEvent)
                        .collect(Collectors.toList());
            }
        }
        
        // Filter by search query (title or description)
        if (query != null && !query.isEmpty()) {
            String lowerQuery = query.toLowerCase();
            events = events.stream()
                    .filter(event -> 
                            (event.getTitle() != null && event.getTitle().toLowerCase().contains(lowerQuery)) ||
                            (event.getDescription() != null && event.getDescription().toLowerCase().contains(lowerQuery)))
                    .collect(Collectors.toList());
        }
        
        return events;
    }
    
    @Override
    public void deleteEvent(Integer id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with id: " + id);
        }
        
        eventRepository.deleteById(id);
    }
} 