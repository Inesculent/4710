package com.api.services.impl;

import com.api.models.Rso;
import com.api.models.User;
import com.api.repositories.RsoRepository;
import com.api.repositories.UserRepository;
import com.api.services.RsoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class RsoServiceImpl implements RsoService {
    
    private final RsoRepository rsoRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public RsoServiceImpl(RsoRepository rsoRepository, UserRepository userRepository) {
        this.rsoRepository = rsoRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public List<Rso> getAllRsos() {
        return rsoRepository.findAll();
    }
    
    @Override
    public Optional<Rso> getRsoById(Integer id) {
        return rsoRepository.findById(id);
    }
    
    @Override
    public Optional<Rso> getRsoByName(String name) {
        return rsoRepository.findByRsoName(name);
    }
    
    @Override
    public List<Rso> getRsosByUniversityId(Integer universityId) {
        return rsoRepository.findByUniversityId(universityId);
    }
    
    @Override
    public List<Rso> getActiveRsos() {
        return rsoRepository.findByIsActive(true);
    }
    
    @Override
    public Rso createRso(Rso rso) {
        return rsoRepository.save(rso);
    }
    
    @Override
    public Rso updateRso(Integer id, Rso rso) {
        if (!rsoRepository.existsById(id)) {
            throw new IllegalArgumentException("RSO not found with id: " + id);
        }
        
        rso.setRsoId(id);
        return rsoRepository.save(rso);
    }
    
    @Override
    public void deleteRso(Integer id) {
        if (!rsoRepository.existsById(id)) {
            throw new IllegalArgumentException("RSO not found with id: " + id);
        }
        
        rsoRepository.deleteById(id);
    }
    
    @Override
    public Rso addMember(Integer rsoId, User user) {
        Rso rso = rsoRepository.findById(rsoId)
                .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
        
        // Check if user's email matches the RSO domain
        if (!user.getEmail().endsWith(rso.getEmailDomain())) {
            throw new IllegalArgumentException("User email doesn't match the RSO domain: " + rso.getEmailDomain());
        }
        
        Set<User> members = rso.getMembers();
        if (members == null) {
            members = new HashSet<>();
        }
        
        members.add(user);
        rso.setMembers(members);
        
        return rsoRepository.save(rso);
    }
    
    @Override
    public Rso removeMember(Integer rsoId, Integer userId) {
        Rso rso = rsoRepository.findById(rsoId)
                .orElseThrow(() -> new IllegalArgumentException("RSO not found with id: " + rsoId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Set<User> members = rso.getMembers();
        if (members != null) {
            members.remove(user);
            rso.setMembers(members);
        }
        
        return rsoRepository.save(rso);
    }
} 