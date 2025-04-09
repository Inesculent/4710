package com.api.services;

import com.api.models.Event;
import com.api.models.PrivateEvent;
import com.api.models.PublicEvent;
import com.api.models.RsoEvent;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventService {
    List<Event> getAllEvents();
    Optional<Event> getEventById(Integer id);
    List<Event> getEventsByUniversityId(Integer universityId);
    List<Event> getUpcomingEvents(LocalDate date);
    List<Event> getUpcomingEventsByUniversity(Integer universityId, LocalDate date);
    
    PublicEvent createPublicEvent(PublicEvent event);
    PrivateEvent createPrivateEvent(PrivateEvent event);
    RsoEvent createRsoEvent(RsoEvent event);
    
    Event updateEvent(Integer id, Event event);
    void deleteEvent(Integer id);
} 