package com.api.services;

import com.api.models.Location;

import java.util.List;
import java.util.Optional;

public interface LocationService {
    List<Location> getAllLocations();
    Optional<Location> getLocationById(Integer id);
    Location createLocation(Location location);
    Location updateLocation(Integer id, Location location);
    void deleteLocation(Integer id);
} 