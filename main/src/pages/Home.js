import React from 'react';
import { Container, Typography, Box, Paper, Grid, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { currentUser, userRole } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          backgroundColor: '#191f25', 
          color: 'white',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            College Event Hub
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Discover, create, and join events at your university
          </Typography>
          {!currentUser && (
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                backgroundColor: '#4285F4',
                '&:hover': {
                  backgroundColor: '#3367d6',
                },
              }}
              href="/events"
            >
              Browse Events
            </Button>
          )}
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              backgroundColor: '#161a1e',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" gutterBottom>Find Events</Typography>
            <Typography variant="body1" paragraph>
              Browse through public events, private events at your university, and events hosted by your RSOs.
            </Typography>
            <Button variant="outlined" color="primary" href="/events">
              View Events
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              backgroundColor: '#161a1e',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" gutterBottom>Join RSOs</Typography>
            <Typography variant="body1" paragraph>
              Join Registered Student Organizations or create your own with at least 4 other students.
            </Typography>
            <Button variant="outlined" color="primary" href="/rsos">
              Explore RSOs
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              backgroundColor: '#161a1e',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" gutterBottom>
              {userRole === 'admin' || userRole === 'superadmin' ? 'Create Events' : 'Track Events'}
            </Typography>
            <Typography variant="body1" paragraph>
              {userRole === 'admin' || userRole === 'superadmin' 
                ? 'Create and manage events for your university or RSO.'
                : 'Add events to your calendar and get reminders.'}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              href={userRole === 'admin' || userRole === 'superadmin' ? "/create-event" : "/my-events"}
            >
              {userRole === 'admin' || userRole === 'superadmin' ? 'Create Event' : 'My Events'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home; 