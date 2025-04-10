import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateEvent() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: null,
    time: null,
    endTime: null,
    latitude: '',
    longitude: '',
    locationName: '',
    locationDescription: '',
    contactPhone: '',
    contactEmail: '',
    type: '',
    rsoId: '',
    universityId: currentUser?.universityId ? currentUser.universityId.toString() : ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [rsos, setRsos] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Load universities and RSOs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch universities
        const universitiesResponse = await api.universities.getAll();
        setUniversities(universitiesResponse.universities || []);
        
        // Set default university if user has one and it's available
        if (currentUser?.universityId && !eventData.universityId) {
          setEventData(prev => ({
            ...prev,
            universityId: currentUser.universityId.toString()
          }));
        } else if (universitiesResponse.universities?.length > 0 && !eventData.universityId) {
          // Set first university as default if none selected
          setEventData(prev => ({
            ...prev,
            universityId: universitiesResponse.universities[0].id.toString()
          }));
        }
        
        // Fetch RSOs if user is logged in
        if (currentUser && currentUser.userId) {
          const rsosResponse = await api.rsos.getUserRsos(currentUser.userId);
          setRsos(rsosResponse.rsos || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("Failed to load necessary data. Please refresh the page.");
      }
    };
    
    fetchData();
  }, [currentUser]);
  
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
  
  // Handle date change
  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]; // format as YYYY-MM-DD
      setEventData(prev => ({
        ...prev,
        date: formattedDate
      }));
      
      // Clear error
      if (errors.date) {
        setErrors(prev => ({
          ...prev,
          date: ''
        }));
      }
    }
  };
  
  // Handle time change
  const handleTimeChange = (time, field) => {
    if (time) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      setEventData(prev => ({
        ...prev,
        [field]: timeString
      }));
      
      // Clear error
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['name', 'description', 'date', 'time', 'locationName', 'latitude', 'longitude', 'type', 'universityId'];
    requiredFields.forEach(field => {
      if (!eventData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation (if provided)
    if (eventData.contactEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(eventData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address';
    }
    
    // Phone validation (if provided)
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
    
    // Check location description length (max 50 characters as per VARCHAR(50))
    if (eventData.locationDescription && eventData.locationDescription.length > 50) {
      newErrors.locationDescription = 'Location description cannot exceed 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setApiError('');
      
      try {
        // Prepare data for API
        const apiEventData = {
          name: eventData.name,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          endTime: eventData.endTime || '',
          longitude: parseFloat(eventData.longitude),
          latitude: parseFloat(eventData.latitude),
          locationName: eventData.locationName,
          locationDescription: eventData.locationDescription || '',
          type: eventData.type.toLowerCase(),
          universityId: parseInt(eventData.universityId),
          ownerId: currentUser.userId || currentUser.uid
        };
        
        // Add RSO ID if applicable
        if (eventData.type === 'rso' && eventData.rsoId) {
          apiEventData.rsoId = parseInt(eventData.rsoId);
        }
        
        // Add contact info if provided
        if (eventData.contactPhone) {
          apiEventData.contactPhone = eventData.contactPhone;
        }
        
        if (eventData.contactEmail) {
          apiEventData.contactEmail = eventData.contactEmail;
        }

        // Debug what we're sending
        console.log("Creating event with:", JSON.stringify(apiEventData, null, 2));
        
        // Call API to create event
        const response = await api.events.create(apiEventData);
        
        if (response.success) {
          // Reset form after submission
          setEventData({
            name: '',
            description: '',
            date: null,
            time: null,
            endTime: null,
            latitude: '',
            longitude: '',
            locationName: '',
            locationDescription: '',
            contactPhone: '',
            contactEmail: '',
            type: '',
            rsoId: '',
            universityId: currentUser?.universityId ? currentUser.universityId.toString() : ''
          });
          
          // Show success message
          setSuccess(true);
          
          // Navigate to event details after 2 seconds
          setTimeout(() => {
            navigate(`/events/${response.eventId}`);
          }, 2000);
        } else {
          setApiError(response.message || 'Failed to create event');
        }
      } catch (error) {
        console.error("Error creating event:", error);
        setApiError(error.message || 'Failed to create event. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle alert close
  const handleCloseAlert = () => {
    setSuccess(false);
    setApiError('');
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

  console.log(universities);
  console.log(rsos);
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                  name="name"
                  value={eventData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
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
              
              {/* University Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!errors.universityId}>
                  <InputLabel id="university-label">University</InputLabel>
                  <Select
                    labelId="university-label"
                    id="universityId"
                    name="universityId"
                    value={eventData.universityId || ''}
                    onChange={handleChange}
                    label="University"
                    required
                  >
                    {universities.map((university) => (
                      <MenuItem key={university.id} value={university.id.toString()}>
                        {university.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.universityId && <FormHelperText>{errors.universityId}</FormHelperText>}
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
                  <FormControl fullWidth margin="normal" error={!!errors.rsoId}>
                    <InputLabel id="rso-label">RSO</InputLabel>
                    <Select
                      labelId="rso-label"
                      id="rsoId"
                      name="rsoId"
                      value={eventData.rsoId || ''}
                      onChange={handleChange}
                      label="RSO"
                      required
                    >
                      {rsos.map((rso) => (
                        <MenuItem key={rso.id} value={rso.id.toString()}>
                          {rso.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.rsoId && <FormHelperText>{errors.rsoId}</FormHelperText>}
                  </FormControl>
                </Grid>
              )}
              
              {/* Date and Time */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Date"
                  value={eventData.date ? new Date(eventData.date) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.date,
                      helperText: errors.date,
                      InputLabelProps: {
                        sx: { color: 'rgba(255, 255, 255, 0.7)' }
                      },
                      InputProps: {
                        sx: { backgroundColor: '#1b1e22', color: 'white' }
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="Start Time"
                  value={eventData.time ? new Date(`2023-01-01T${eventData.time}`) : null}
                  onChange={(time) => handleTimeChange(time, 'time')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.time,
                      helperText: errors.time,
                      InputLabelProps: {
                        sx: { color: 'rgba(255, 255, 255, 0.7)' }
                      },
                      InputProps: {
                        sx: { backgroundColor: '#1b1e22', color: 'white' }
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TimePicker
                  label="End Time"
                  value={eventData.endTime ? new Date(`2023-01-01T${eventData.endTime}`) : null}
                  onChange={(time) => handleTimeChange(time, 'endTime')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endTime,
                      helperText: errors.endTime,
                      InputLabelProps: {
                        sx: { color: 'rgba(255, 255, 255, 0.7)' }
                      },
                      InputProps: {
                        sx: { backgroundColor: '#1b1e22', color: 'white' }
                      }
                    }
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Description"
                  name="locationDescription"
                  value={eventData.locationDescription}
                  onChange={handleChange}
                  error={!!errors.locationDescription}
                  helperText={errors.locationDescription || "Brief description of the location (max 50 characters)"}
                  inputProps={{ maxLength: 50 }}
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
                    disabled={loading}
                    sx={{ mt: 3 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Event'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Success/Error Message */}
        <Snackbar
          open={success || !!apiError}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={success ? "success" : "error"}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {success ? "Event created successfully!" : apiError}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}

export default CreateEvent; 