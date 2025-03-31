import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardMedia, 
  CardActions, Button, Chip, FormControl, InputLabel, Select, MenuItem,
  TextField, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Events() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [error, setError] = useState('');
  
  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let fetchedEvents;
        
        if (currentUser) {
          // Fetch events that this user can see
          fetchedEvents = await api.events.getVisibleEvents(currentUser.uid);
        } else {
          // If not logged in, only show public events
          fetchedEvents = await api.events.getAll();
          // Add null check before filtering
          fetchedEvents = fetchedEvents.filter(event => event && event.type === 'public');
        }
        
        setEvents(fetchedEvents || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentUser]);
  
  // Handle joining an event
  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      // Prompt to log in
      navigate('/');
      return;
    }
    
    try {
      await api.events.joinEvent(eventId, currentUser.uid);
      // Update UI to show the user is now attending
      alert('You have successfully joined this event!');
    } catch (err) {
      console.error('Error joining event:', err);
      setError('Failed to join event. Please try again later.');
    }
  };
  
  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    // Skip null events
    if (!event) return false;
    
    // Filter by search term
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by event type
    const matchesType = 
      typeFilter === 'all' || 
      event.type === typeFilter;
    
    // Filter by category
    const matchesCategory = 
      categoryFilter === 'all' || 
      event.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom color="white">
        Browse Events
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          label="Search events"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { backgroundColor: '#161a1e', color: 'white' }
          }}
          InputLabelProps={{
            sx: { color: 'rgba(255, 255, 255, 0.7)' }
          }}
          sx={{ flex: 2 }}
        />
        
        <FormControl variant="outlined" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel id="type-filter-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Event Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Event Type"
            sx={{ backgroundColor: '#161a1e', color: 'white' }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="rso">RSO</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel id="category-filter-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
            sx={{ backgroundColor: '#161a1e', color: 'white' }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="social">Social</MenuItem>
            <MenuItem value="educational">Educational</MenuItem>
            <MenuItem value="tech">Tech</MenuItem>
            <MenuItem value="fundraising">Fundraising</MenuItem>
            <MenuItem value="sports">Sports</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Events Grid */
        filteredEvents.length > 0 ? (
          <Grid container spacing={4}>
            {filteredEvents.map(event => (
              <Grid item key={event.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: '#161a1e',
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={event.imageUrl}
                    alt={event.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                        size="small" 
                        color={
                          event.type === 'public' 
                            ? 'success' 
                            : event.type === 'private' 
                              ? 'primary' 
                              : 'secondary'
                        }
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={event.category.charAt(0).toUpperCase() + event.category.slice(1)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography gutterBottom variant="h6" component="h3">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      {event.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Date:</strong> {formatDate(event.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Time:</strong> {event.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Location:</strong> {event.location_name}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                    {currentUser && (
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => handleJoinEvent(event.id)}
                      >
                        Add to Calendar
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6, color: 'white' }}>
            <Typography variant="h6">
              No events found matching your criteria.
            </Typography>
          </Box>
        )
      )}
    </Container>
  );
}

export default Events; 