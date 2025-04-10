import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';

const EventSearch = () => {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [universityId, setUniversityId] = useState('');
  const [eventType, setEventType] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(10);
  const [universities, setUniversities] = useState([]);
  const [events, setEvents] = useState([]);
  const [useLocation, setUseLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('/api/universities/all');
        if (response.data.success) {
          setUniversities(response.data.universities);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };

    fetchUniversities();

    // Get user's current location if they allow it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {};
      if (query) params.query = query;
      if (startDate) params.startDate = moment(startDate).format('YYYY-MM-DD');
      if (endDate) params.endDate = moment(endDate).format('YYYY-MM-DD');
      if (universityId) params.universityId = universityId;
      if (eventType) params.eventType = eventType;
      
      // Add location parameters if using location-based search
      if (useLocation && latitude && longitude && radius) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.radius = radius;
      }

      const response = await axios.get('/api/events/search', { params });
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setStartDate(null);
    setEndDate(null);
    setUniversityId('');
    setEventType('');
    setUseLocation(false);
    setRadius(10);
    setEvents([]);
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'rso': return 'RSO';
      default: return type;
    }
  };

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'public': return 'primary';
      case 'private': return 'secondary';
      case 'rso': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Search Events
      </Typography>
      
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by name or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>University</InputLabel>
                <Select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  label="University"
                >
                  <MenuItem value="">Any University</MenuItem>
                  {universities.map((uni) => (
                    <MenuItem key={uni.universityId} value={uni.universityId}>
                      {uni.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  label="Event Type"
                >
                  <MenuItem value="">Any Type</MenuItem>
                  <MenuItem value="public">Public Events</MenuItem>
                  <MenuItem value="private">Private Events</MenuItem>
                  <MenuItem value="rso">RSO Events</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={startDate}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography>Use location-based search:</Typography>
                <Button 
                  variant={useLocation ? "contained" : "outlined"} 
                  color="primary"
                  onClick={() => setUseLocation(!useLocation)}
                  sx={{ ml: 2 }}
                >
                  {useLocation ? "Location Enabled" : "Enable Location"}
                </Button>
              </Box>
              
              {useLocation && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        disabled={!useLocation}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        disabled={!useLocation}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography gutterBottom>
                        Search Radius: {radius} km
                      </Typography>
                      <Slider
                        value={radius}
                        onChange={(e, newValue) => setRadius(newValue)}
                        min={1}
                        max={50}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        disabled={!useLocation}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleClear} sx={{ mr: 1 }}>
            Clear
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Events'}
          </Button>
        </CardActions>
      </Card>
      
      <Typography variant="h5" gutterBottom>
        {events.length > 0 ? `${events.length} Events Found` : 'No Events Found'}
      </Typography>
      
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Chip 
                    label={getEventTypeLabel(event.type)} 
                    color={getEventTypeColor(event.type)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.description}
                </Typography>
                
                <Typography variant="body2">
                  <strong>Date:</strong> {event.date}
                </Typography>
                
                <Typography variant="body2">
                  <strong>Time:</strong> {event.startTime} - {event.endTime}
                </Typography>
                
                {event.universityName && (
                  <Typography variant="body2">
                    <strong>University:</strong> {event.universityName}
                  </Typography>
                )}
                
                {event.type === 'rso' && event.rsoName && (
                  <Typography variant="body2">
                    <strong>RSO:</strong> {event.rsoName}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Button size="small" color="primary" href={`/events/${event.id}`}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default EventSearch; 