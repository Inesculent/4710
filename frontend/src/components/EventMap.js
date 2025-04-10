import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Chip
} from '@mui/material';
import axios from 'axios';

// Note: This component requires installing react-google-maps/api
// npm install @react-google-maps/api

const EventMap = ({ universityId, eventType }) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [center, setCenter] = useState({ lat: 28.6024, lng: -81.2001 }); // Default to UCF area
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  
  useEffect(() => {
    // Load the Google Maps API script
    const loadGoogleMapsScript = () => {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      window.document.body.appendChild(googleMapsScript);
      
      googleMapsScript.addEventListener('load', () => {
        setMapLoaded(true);
      });
      
      googleMapsScript.addEventListener('error', () => {
        setError('Failed to load Google Maps. Please try again later.');
        setLoading(false);
      });
    };
    
    loadGoogleMapsScript();
  }, []);
  
  useEffect(() => {
    if (!mapLoaded) return;
    
    const loadEvents = async () => {
      try {
        let url = '/api/events';
        
        if (universityId) {
          url = `/api/events/university/${universityId}`;
        } else if (eventType) {
          url = `/api/events/${eventType}`;
        } else {
          url = '/api/events/all';
        }
        
        const response = await axios.get(url);
        if (response.data.success) {
          // Filter events that have location data
          const eventsWithLocation = response.data.events.filter(
            event => event.latitude && event.longitude
          );
          
          setEvents(eventsWithLocation);
          
          // Calculate center if we have events
          if (eventsWithLocation.length > 0) {
            const latSum = eventsWithLocation.reduce((sum, event) => sum + event.latitude, 0);
            const lngSum = eventsWithLocation.reduce((sum, event) => sum + event.longitude, 0);
            
            setCenter({
              lat: latSum / eventsWithLocation.length,
              lng: lngSum / eventsWithLocation.length
            });
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [mapLoaded, universityId, eventType]);
  
  useEffect(() => {
    if (!mapLoaded || loading) return;
    
    // Initialize map
    const initMap = () => {
      // Clear any existing markers
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
      
      // Create map instance if not created yet
      if (!mapRef.current) {
        mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
          center,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });
      } else {
        // Just update center if map exists
        mapRef.current.setCenter(center);
      }
      
      // Add markers for each event
      events.forEach((event) => {
        const marker = new window.google.maps.Marker({
          position: { lat: event.latitude, lng: event.longitude },
          map: mapRef.current,
          title: event.title,
          animation: window.google.maps.Animation.DROP
        });
        
        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px;">
              <h3>${event.title}</h3>
              <p>${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
              <a href="/events/${event.id}" style="color: blue; text-decoration: underline;">View Details</a>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(mapRef.current, marker);
        });
        
        markersRef.current.push(marker);
      });
    };
    
    initMap();
  }, [events, center, loading, mapLoaded]);
  
  const getEventTypeColor = (type) => {
    switch(type) {
      case 'public': return 'primary';
      case 'private': return 'secondary';
      case 'rso': return 'success';
      default: return 'default';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Event Map
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Showing {events.length} events on map:
            </Typography>
            
            {events.length > 0 ? (
              events.map((event) => (
                <Chip
                  key={event.id}
                  label={event.title}
                  size="small"
                  color={getEventTypeColor(event.type)}
                  variant="outlined"
                  onClick={() => {
                    const marker = markersRef.current.find(m => m.title === event.title);
                    if (marker && mapRef.current) {
                      mapRef.current.setCenter(marker.getPosition());
                      mapRef.current.setZoom(15);
                      window.google.maps.event.trigger(marker, 'click');
                    }
                  }}
                  sx={{ mb: 1 }}
                />
              ))
            ) : (
              <Typography variant="body2">
                No events with location data found
              </Typography>
            )}
          </Box>
          
          <Box
            id="map"
            sx={{
              height: '400px',
              width: '100%',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: 'text.secondary' }}>
            Click on a marker to see event details
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default EventMap; 