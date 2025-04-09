package com.api.controllers;

import com.api.models.Location;
import com.api.services.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    @Autowired
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> insertLocation(@RequestBody Map<String, Object> locationData) {
        try {
            Double latitude = Double.parseDouble(locationData.get("latitude").toString());
            Double longitude = Double.parseDouble(locationData.get("longitude").toString());
            
            // Create location object
            Location location = new Location();
            location.setLatitude(latitude);
            location.setLongitude(longitude);
            
            // Save location
            Location createdLocation = locationService.createLocation(location);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("locationId", createdLocation.getLocID());
            response.put("message", "Location created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/find")
    public ResponseEntity<Map<String, Object>> getLocationId(
            @RequestParam String latitude, 
            @RequestParam String longitude) {
        try {
            Double lat = Double.parseDouble(latitude);
            Double lng = Double.parseDouble(longitude);
            
            // Find all locations and find the closest one
            List<Location> locations = locationService.getAllLocations();
            
            Optional<Location> closestLocation = locations.stream()
                    .min((l1, l2) -> {
                        Double dist1 = distanceSquared(l1.getLatitude(), l1.getLongitude(), lat, lng);
                        Double dist2 = distanceSquared(l2.getLatitude(), l2.getLongitude(), lat, lng);
                        return dist1.compareTo(dist2);
                    });
            
            Map<String, Object> response = new HashMap<>();
            if (closestLocation.isPresent()) {
                Double distanceSquared = distanceSquared(
                        closestLocation.get().getLatitude(), 
                        closestLocation.get().getLongitude(),
                        lat, lng);
                
                // Threshold for "close enough" - about 100 meters squared
                if (distanceSquared < 0.0001) {
                    response.put("success", true);
                    response.put("locationId", closestLocation.get().getLocID());
                    return ResponseEntity.ok(response);
                }
            }
            
            response.put("success", false);
            response.put("message", "Location not found");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{locationId}")
    public ResponseEntity<Map<String, Object>> getLocationById(@PathVariable int locationId) {
        try {
            Location location = locationService.getLocationById(locationId)
                    .orElseThrow(() -> new IllegalArgumentException("Location not found with id: " + locationId));
            
            Map<String, Object> locationMap = new HashMap<>();
            locationMap.put("id", location.getLocID());
            locationMap.put("latitude", location.getLatitude());
            locationMap.put("longitude", location.getLongitude());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("location", locationMap);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Helper method to calculate squared distance between two points
    private Double distanceSquared(Double lat1, Double lng1, Double lat2, Double lng2) {
        return Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2);
    }
} 