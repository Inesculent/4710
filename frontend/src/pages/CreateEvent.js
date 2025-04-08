import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, FormHelperText 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Mock data for RSOs
const mockRSOs = [
  { id: 1, name: 'Computer Science Club' },
  { id: 2, name: 'Chess Club' },
  { id: 3, name: 'Engineering Society' },
  { id: 4, name: 'Drama Club' },
  { id: 5, name: 'Soccer Club' }
];

function CreateEvent() {
  const { currentUser, userRole } = useAuth();
  
  // Form state
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    locationName: '',
    latitude: '',
    longitude: '',
    contactPhone: '',
    contactEmail: '',
    type: '',
    rsoId: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['title', 'description', 'category', 'date', 'time', 'locationName', 'latitude', 'longitude', 'contactPhone', 'contactEmail', 'type'];
    requiredFields.forEach(field => {
      if (!eventData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (eventData.contactEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(eventData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }
    
    // Phone validation
    if (eventData.contactPhone && !/^\d{10}$/i.test(eventData.contactPhone.replace(/[^0-9]/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid 10-digit phone number';
    }
    
    // If RSO type is selected, require rsoId
    if (eventData.type === 'rso' && !eventData.rsoId) {
      newErrors.rsoId = 'Please select an RSO';
    }
    
    // Latitude/longitude validation
    if (eventData.latitude && (isNaN(eventData.latitude) || eventData.latitude < -90 || eventData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (eventData.longitude && (isNaN(eventData.longitude) || eventData.longitude < -180 || eventData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, we would send this data to an API
      console.log('Submitting event:', eventData);
      
      // Reset form after submission
      setEventData({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        locationName: '',
        latitude: '',
        longitude: '',
        contactPhone: '',
        contactEmail: '',
        type: '',
        rsoId: ''
      });
      
      // Show success message
      alert('Event created successfully!');
    }
  };
  
  // If user is not admin or superadmin, show access denied
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
          <Typography variant="h5" color="error" align="center">
            Access Denied
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            You need admin privileges to create events.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Create Event
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* Event Title */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Event Title"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            {/* Event Description */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Event Description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            {/* Event Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel id="category-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Category
                </InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={eventData.category}
                  onChange={handleChange}
                  label="Category"
                  sx={{ backgroundColor: '#1b1e22', color: 'white' }}
                >
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="educational">Educational</MenuItem>
                  <MenuItem value="tech">Tech</MenuItem>
                  <MenuItem value="fundraising">Fundraising</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Event Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel id="type-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Event Type
                </InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={eventData.type}
                  onChange={handleChange}
                  label="Event Type"
                  sx={{ backgroundColor: '#1b1e22', color: 'white' }}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private (University Only)</MenuItem>
                  <MenuItem value="rso">RSO (Members Only)</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* RSO Selection (only if event type is RSO) */}
            {eventData.type === 'rso' && (
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.rsoId}>
                  <InputLabel id="rso-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Select RSO
                  </InputLabel>
                  <Select
                    labelId="rso-label"
                    name="rsoId"
                    value={eventData.rsoId}
                    onChange={handleChange}
                    label="Select RSO"
                    sx={{ backgroundColor: '#1b1e22', color: 'white' }}
                  >
                    {mockRSOs.map(rso => (
                      <MenuItem key={rso.id} value={rso.id}>{rso.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.rsoId && <FormHelperText>{errors.rsoId}</FormHelperText>}
                </FormControl>
              </Grid>
            )}
            
            {/* Date and Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={eventData.date}
                onChange={handleChange}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{
                  shrink: true,
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={eventData.time}
                onChange={handleChange}
                error={!!errors.time}
                helperText={errors.time}
                InputLabelProps={{
                  shrink: true,
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
              />
            </Grid>
            
            {/* Location Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Location Name"
                name="locationName"
                value={eventData.locationName}
                onChange={handleChange}
                error={!!errors.locationName}
                helperText={errors.locationName}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Latitude"
                name="latitude"
                value={eventData.latitude}
                onChange={handleChange}
                error={!!errors.latitude}
                helperText={errors.latitude}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Longitude"
                name="longitude"
                value={eventData.longitude}
                onChange={handleChange}
                error={!!errors.longitude}
                helperText={errors.longitude}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact Phone"
                name="contactPhone"
                value={eventData.contactPhone}
                onChange={handleChange}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Contact Email"
                name="contactEmail"
                value={eventData.contactEmail}
                onChange={handleChange}
                error={!!errors.contactEmail}
                helperText={errors.contactEmail}
                InputProps={{
                  sx: { backgroundColor: '#1b1e22', color: 'white' }
                }}
                InputLabelProps={{
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ mt: 3 }}
                >
                  Create Event
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateEvent; 