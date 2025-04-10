import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Chip
} from '@mui/material';
import { PersonOutline, CheckCircle, DoDisturbOnOutlined, HelpOutline } from '@mui/icons-material';

const RSVPComponent = ({ eventId, userId, showAttendees = true }) => {
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId || !userId) return;

    const fetchRSVPStatus = async () => {
      try {
        const response = await axios.get(`/api/rsvps/status/${userId}/${eventId}`);
        if (response.data.success) {
          setRsvpStatus(response.data.status);
        }
      } catch (error) {
        // If no RSVP exists yet, we'll get an error - that's ok
        setRsvpStatus('');
      }
    };

    const fetchAttendees = async () => {
      if (!showAttendees) return;
      
      try {
        const response = await axios.get(`/api/rsvps/event/${eventId}`);
        if (response.data.success) {
          setAttendees(response.data.rsvps.filter(rsvp => rsvp.status === 'attending'));
          setAttendeeCount(response.data.attendeeCount);
        }
      } catch (error) {
        console.error('Error fetching attendees:', error);
      }
    };

    fetchRSVPStatus();
    fetchAttendees();
  }, [eventId, userId, showAttendees]);

  const handleRSVPSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const endpoint = rsvpStatus ? '/api/rsvps/update' : '/api/rsvps/create';
      const payload = {
        userId,
        eventId,
        status: rsvpStatus
      };

      const response = await axios.post(endpoint, payload);
      if (response.data.success) {
        setSuccess(true);
        
        // Refresh attendee list if showing attendees
        if (showAttendees) {
          const attendeeResponse = await axios.get(`/api/rsvps/event/${eventId}`);
          if (attendeeResponse.data.success) {
            setAttendees(attendeeResponse.data.rsvps.filter(rsvp => rsvp.status === 'attending'));
            setAttendeeCount(attendeeResponse.data.attendeeCount);
          }
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while updating your RSVP');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'attending':
        return <CheckCircle color="success" />;
      case 'not attending':
        return <DoDisturbOnOutlined color="error" />;
      case 'maybe':
        return <HelpOutline color="warning" />;
      default:
        return <PersonOutline />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Will you attend this event?
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Your RSVP Status</FormLabel>
        <RadioGroup
          value={rsvpStatus}
          onChange={(e) => setRsvpStatus(e.target.value)}
          name="rsvp-options"
        >
          <FormControlLabel value="attending" control={<Radio />} label="Yes, I'll be there" />
          <FormControlLabel value="maybe" control={<Radio />} label="Maybe, I'm not sure yet" />
          <FormControlLabel value="not attending" control={<Radio />} label="No, I can't attend" />
        </RadioGroup>
      </FormControl>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleRSVPSubmit}
        disabled={loading || !rsvpStatus}
        sx={{ mb: 2 }}
      >
        {loading ? 'Updating...' : 'Update RSVP'}
      </Button>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your RSVP has been updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {showAttendees && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Attendees
            </Typography>
            <Chip 
              label={`${attendeeCount} ${attendeeCount === 1 ? 'person' : 'people'} attending`} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          
          {attendees.length > 0 ? (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {attendees.map((attendee) => (
                <ListItem key={attendee.userId}>
                  <ListItemAvatar>
                    <Avatar>
                      {getStatusIcon('attending')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={attendee.userName}
                    secondary={`Confirmed on ${new Date(attendee.rsvpDate).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No confirmed attendees yet. Be the first to RSVP!
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};

export default RSVPComponent; 