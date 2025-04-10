package com.api.services;

import com.api.models.RSVP;
import com.api.models.RSVPId;

import java.util.List;
import java.util.Optional;

public interface RSVPService {
    RSVP createRSVP(RSVP rsvp);
    List<RSVP> getEventRSVPs(Integer eventId);
    List<RSVP> getUserRSVPs(Integer userId);
    List<RSVP> getEventRSVPsByStatus(Integer eventId, String status);
    long countEventAttendees(Integer eventId);
    Optional<RSVP> getRSVP(Integer userId, Integer eventId);
    RSVP updateRSVP(Integer userId, Integer eventId, String status);
    void deleteRSVP(Integer userId, Integer eventId);
} 