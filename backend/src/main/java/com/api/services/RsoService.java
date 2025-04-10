package com.api.services;

import com.api.models.Rso;
import com.api.models.User;

import java.util.List;
import java.util.Optional;

public interface RsoService {
    List<Rso> getAllRsos();
    Optional<Rso> getRsoById(Integer id);
    Optional<Rso> getRsoByName(String name);
    List<Rso> getRsosByUniversityId(Integer universityId);
    List<Rso> getActiveRsos();
    Rso createRso(Rso rso);
    Rso updateRso(Integer id, Rso rso);
    void deleteRso(Integer id);
    Rso addMember(Integer rsoId, User user);
    Rso removeMember(Integer rsoId, Integer userId);
    List<Rso> getRsosByUserId(Integer userId);
} 