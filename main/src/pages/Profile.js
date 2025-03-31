import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, Avatar, Button, 
  TextField, Card, CardContent, CardMedia, CardActions, 
  Chip, Divider, List, ListItem, ListItemText, ListItemIcon,
  Switch, FormControlLabel, Tab, Tabs
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../contexts/AuthContext';

// Mock data for user's events
const mockUserEvents = [
  {
    id: 1,
    title: 'Tech Talk: AI and Ethics',
    date: '2025-04-15',
    time: '15:00',
    location: 'Computer Science Building, Room 101',
    category: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 3,
    title: 'Chess Club Tournament',
    date: '2025-04-25',
    time: '13:00',
    location: 'Student Union, Room 223',
    category: 'social',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 5,
    title: 'Resume Workshop',
    date: '2025-05-05',
    time: '14:00',
    location: 'Career Center',
    category: 'educational',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

// Mock data for user's RSOs
const mockUserRSOs = [
  { 
    id: 2, 
    name: 'Chess Club', 
    memberCount: 15,
    role: 'Member'
  },
  { 
    id: 5, 
    name: 'Soccer Club', 
    memberCount: 18,
    role: 'Member'
  }
];

function Profile() {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userEvents, setUserEvents] = useState(mockUserEvents);
  const [userRSOs, setUserRSOs] = useState(mockUserRSOs);
  
  // User profile data
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || 'John Doe',
    email: currentUser?.email || 'john.doe@knights.ucf.edu',
    university: 'University of Central Florida',
    bio: 'Computer Science student interested in AI and machine learning.',
    avatarUrl: currentUser?.photoURL || 'https://i.pravatar.cc/300'
  });
  
  // User notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    eventReminders: true,
    rsoUpdates: true
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle profile data changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle notification setting changes
  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle removing an event from user's list
  const handleRemoveEvent = (eventId) => {
    setUserEvents(prev => prev.filter(event => event.id !== eventId));
  };
  
  // Handle leaving an RSO
  const handleLeaveRSO = (rsoId) => {
    setUserRSOs(prev => prev.filter(rso => rso.id !== rsoId));
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // If user is not logged in, show message
  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please Sign In
          </Typography>
          <Typography variant="body1">
            You need to be logged in to view your profile.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/"
            sx={{ mt: 3 }}
          >
            Go to Homepage
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          backgroundColor: '#161a1e', 
          color: 'white', 
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 3
        }}
      >
        <Avatar 
          src={profileData.avatarUrl} 
          alt={profileData.displayName}
          sx={{ width: 120, height: 120 }}
        />
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {profileData.displayName}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {profileData.email}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {profileData.university}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`} 
                color="primary" 
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`RSOs: ${userRSOs.length}`} 
                color="secondary" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Events: ${userEvents.length}`} 
                color="success" 
                size="small"
              />
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph>
            {profileData.bio}
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary"
          sx={{ alignSelf: { xs: 'center', md: 'flex-start' } }}
        >
          Edit Profile
        </Button>
      </Paper>
      
      {/* Tabs Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            backgroundColor: '#161a1e', 
            borderRadius: 2,
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: 'white',
              },
            },
          }}
        >
          <Tab label="My Events" icon={<EventIcon />} iconPosition="start" />
          <Tab label="My RSOs" icon={<GroupIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<NotificationsIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={4}>
          {userEvents.length > 0 ? (
            userEvents.map(event => (
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
                    height="140"
                    image={event.imageUrl}
                    alt={event.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={event.category.charAt(0).toUpperCase() + event.category.slice(1)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      <strong>Date:</strong> {formatDate(event.date)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      <strong>Time:</strong> {event.time}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Location:</strong> {event.location}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={`/events/${event.id}`}>
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveEvent(event.id)}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  You haven't added any events yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  href="/events"
                  sx={{ mt: 2 }}
                >
                  Browse Events
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Grid container spacing={4}>
          {userRSOs.length > 0 ? (
            userRSOs.map(rso => (
              <Grid item key={rso.id} xs={12} sm={6}>
                <Card 
                  sx={{ 
                    backgroundColor: '#161a1e',
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {rso.name}
                      </Typography>
                      <Chip 
                        label={rso.role} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      <strong>Members:</strong> {rso.memberCount}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={`/rsos/${rso.id}`}>
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleLeaveRSO(rso.id)}
                    >
                      Leave RSO
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  You aren't a member of any RSOs yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  href="/rsos"
                  sx={{ mt: 2 }}
                >
                  Browse RSOs
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {activeTab === 2 && (
        <Grid container spacing={4}>
          {/* Profile Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Profile Information
              </Typography>
              
              <Box component="form" sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { backgroundColor: '#1b1e22', color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { backgroundColor: '#1b1e22', color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="University"
                  name="university"
                  value={profileData.university}
                  onChange={handleProfileChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { backgroundColor: '#1b1e22', color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { backgroundColor: '#1b1e22', color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Avatar URL"
                  name="avatarUrl"
                  value={profileData.avatarUrl}
                  onChange={handleProfileChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    sx: { backgroundColor: '#1b1e22', color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Notification Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive notifications via email"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                  />
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onChange={() => handleNotificationChange('emailNotifications')}
                    color="primary"
                  />
                </ListItem>
                
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Push Notifications" 
                    secondary="Receive notifications in your browser"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                  />
                  <Switch 
                    checked={notificationSettings.pushNotifications}
                    onChange={() => handleNotificationChange('pushNotifications')}
                    color="primary"
                  />
                </ListItem>
                
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <ListItem>
                  <ListItemIcon>
                    <EventIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Event Reminders" 
                    secondary="Get reminders before your events"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                  />
                  <Switch 
                    checked={notificationSettings.eventReminders}
                    onChange={() => handleNotificationChange('eventReminders')}
                    color="primary"
                  />
                </ListItem>
                
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="RSO Updates" 
                    secondary="Get updates from your RSOs"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                  />
                  <Switch 
                    checked={notificationSettings.rsoUpdates}
                    onChange={() => handleNotificationChange('rsoUpdates')}
                    color="primary"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                >
                  Save Settings
                </Button>
              </Box>
            </Paper>
            
            {/* Security Section */}
            <Paper sx={{ p: 4, mt: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Security
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Password" 
                    secondary="Change your password"
                    secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                  />
                  <Button size="small" variant="outlined">
                    Change
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Profile; 