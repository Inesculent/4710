package com.api.services.impl;

import com.api.models.Event;
import com.api.models.RSVP;
import com.api.models.RSVPId;
import com.api.models.User;
import com.api.repositories.EventRepository;
import com.api.repositories.RSVPRepository;
import com.api.repositories.UserRepository;
import com.api.services.RSVPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RSVPServiceImpl implements RSVPService {

    private final RSVPRepository rsvpRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Autowired
    public RSVPServiceImpl(
            RSVPRepository rsvpRepository,
            UserRepository userRepository,
            EventRepository eventRepository) {
        this.rsvpRepository = rsvpRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public RSVP createRSVP(RSVP rsvp) {
        rsvp.setRsvpDate(LocalDateTime.now());
        return rsvpRepository.save(rsvp);
    }

    @Override
    public List<RSVP> getEventRSVPs(Integer eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
        return rsvpRepository.findByEvent(event);
    }

    @Override
    public List<RSVP> getUserRSVPs(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return rsvpRepository.findByUser(user);
    }

    @Override
    public List<RSVP> getEventRSVPsByStatus(Integer eventId, String status) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
        return rsvpRepository.findByEventAndStatus(event, status);
    }

    @Override
    public long countEventAttendees(Integer eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
        return rsvpRepository.countByEventAndStatus(event, "attending");
    }

    @Override
    public Optional<RSVP> getRSVP(Integer userId, Integer eventId) {
        RSVPId id = new RSVPId(userId, eventId);
        return rsvpRepository.findById(id);
    }

    @Override
    public RSVP updateRSVP(Integer userId, Integer eventId, String status) {
        RSVPId id = new RSVPId(userId, eventId);
        RSVP rsvp = rsvpRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RSVP not found for user " + userId + " and event " + eventId));
        
        rsvp.setStatus(status);
        rsvp.setRsvpDate(LocalDateTime.now());
        
        return rsvpRepository.save(rsvp);
    }

    @Override
    public void deleteRSVP(Integer userId, Integer eventId) {
        RSVPId id = new RSVPId(userId, eventId);
        if (!rsvpRepository.existsById(id)) {
            throw new IllegalArgumentException("RSVP not found for user " + userId + " and event " + eventId);
        }
        rsvpRepository.deleteById(id);
    }
} 