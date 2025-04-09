package com.api.services.impl;

import com.api.models.Location;
import com.api.repositories.LocationRepository;
import com.api.services.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocationServiceImpl implements LocationService {
    
    private final LocationRepository locationRepository;
    
    @Autowired
    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }
    
    @Override
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }
    
    @Override
    public Optional<Location> getLocationById(Integer id) {
        return locationRepository.findById(id);
    }
    
    @Override
    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }
    
    @Override
    public Location updateLocation(Integer id, Location location) {
        if (!locationRepository.existsById(id)) {
            throw new IllegalArgumentException("Location not found with id: " + id);
        }
        
        location.setLocID(id);
        return locationRepository.save(location);
    }
    
    @Override
    public void deleteLocation(Integer id) {
        if (!locationRepository.existsById(id)) {
            throw new IllegalArgumentException("Location not found with id: " + id);
        }
        
        locationRepository.deleteById(id);
    }
} 