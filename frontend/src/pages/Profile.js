import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, Avatar, Button, 
  TextField, Tabs, Tab, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Switch, Divider, Chip, CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Profile() {
  const { currentUser, userRole } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEvents, setUserEvents] = useState([]);
  const [userRsos, setUserRsos] = useState([]);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || "",
    email: currentUser?.email || "",
    university: currentUser?.universityId || "",
    bio: "",
    phoneNumber: ""
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventReminders: true,
    rsoUpdates: true,
    universityAnnouncements: false
  });
  
  // Load user data, events, and RSOs on component mount
  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError("");
        
        // Fetch user profile data if available
        if (currentUser.userId) {
          let userData = await api.users.getProfile(currentUser.userId);
          userData = userData.user;
          if (userData) {
            setProfileData(prevData => ({
              ...prevData,
              displayName: userData.displayName || currentUser.displayName || "",
              email: userData.email || currentUser.email || "",
              university: userData.universityId || currentUser.universityId || "",
              bio: userData.bio || "",
              phoneNumber: userData.phoneNumber || ""
            }));
          }
        }
        
        // Fetch user events
        const events = await api.events.getAllUserEvents(currentUser.userId);
        setUserEvents(events || []);
        
        // Fetch user RSOs
        const rsos = await api.rsos.getUserRsos(currentUser.userId);
        setUserRsos(rsos || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (setting) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleRemoveEvent = async (eventId) => {
    try {
      setLoading(true);
      await api.events.leaveEvent(eventId, currentUser.userId);
      
      // Update the events list
      const updatedEvents = await api.events.getUserEvents(currentUser.userId);
      setUserEvents(updatedEvents);
      setError("");
    } catch (err) {
      console.error("Error removing event:", err);
      setError("Failed to remove event. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLeaveRSO = async (rsoId) => {
    try {
      setLoading(true);
      await api.rsos.leave(rsoId, currentUser.userId);
      
      // Update the RSOs list
      const updatedRsos = await api.rsos.getUserRsos(currentUser.userId);
      setUserRsos(updatedRsos);
      setError("");
    } catch (err) {
      console.error("Error leaving RSO:", err);
      setError("Failed to leave RSO. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.users.updateProfile(currentUser.userId, profileData);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  console.log(profileData)
  console.log(userEvents);
  console.log(userRsos);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: '#161a1e',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#4285F4'
                }}
                alt={profileData.displayName}
                src="/broken-image.jpg"
              >
                {profileData.displayName?.charAt(0) || 'U'}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profileData.displayName || 'User'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                {profileData.email}
              </Typography>
              
              <Chip 
                label={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                color={
                  userRole === 'superadmin' 
                    ? 'secondary' 
                    : userRole === 'admin' 
                      ? 'primary' 
                      : 'default'
                }
                sx={{ mb: 3 }}
              />
              
              <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  University
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {profileData.university || 'Not specified'}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  RSOs Joined
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {userRsos.length || 0}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Events Attending
                </Typography>
                <Typography variant="body2">
                  {userEvents.length || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                backgroundColor: '#161a1e',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .Mui-selected': {
                    color: '#4285F4',
                  }
                }}
              >
                <Tab label="Profile" />
                <Tab label="Events" />
                <Tab label="RSOs" />
                <Tab label="Settings" />
              </Tabs>
              
              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleProfileChange}
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
                      label="Email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled
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
                      label="Phone Number"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
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
                      multiline
                      rows={4}
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      InputProps={{
                        sx: { backgroundColor: '#1b1e22', color: 'white' }
                      }}
                      InputLabelProps={{
                        sx: { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>
              
              {/* Events Tab */}
              <TabPanel value={tabValue} index={1}>
                {userEvents.length > 0 ? (
                  <List>
                    {userEvents.map((event) => (
                      <ListItem 
                        key={event.id}
                        sx={{ 
                          mb: 2, 
                          bgcolor: '#1b1e22', 
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: '#202429'
                          }
                        }}
                      >
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="rgba(255, 255, 255, 0.7)"
                              >
                                {formatDate(event.date)} - {event.startTime || event.time}
                              </Typography>
                              <br />
                              <Chip 
                                label={event.type?.charAt(0).toUpperCase() + event.type?.slice(1) || 'Event'} 
                                size="small" 
                                sx={{ mt: 1, mr: 1 }}
                                color={
                                  event.type === 'public' 
                                    ? 'success' 
                                    : event.type === 'private' 
                                      ? 'primary' 
                                      : 'secondary'
                                }
                              />
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => window.location.href = `/events/${event.id}`}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleRemoveEvent(event.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
                    You're not attending any events yet. Browse events to find something interesting!
                  </Typography>
                )}
              </TabPanel>
              
              {/* RSOs Tab */}
              <TabPanel value={tabValue} index={2}>
                {userRsos.length > 0 ? (
                  <List>
                    {userRsos.map((rso) => (
                      <ListItem 
                        key={rso.id}
                        sx={{ 
                          mb: 2, 
                          bgcolor: '#1b1e22', 
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: '#202429'
                          }
                        }}
                      >
                        <ListItemText
                          primary={rso.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="rgba(255, 255, 255, 0.7)"
                              >
                                {rso.description}
                              </Typography>
                              <br />
                              <Chip 
                                label={`${rso.memberCount || '0'} members`} 
                                size="small" 
                                sx={{ mt: 1 }}
                                variant="outlined"
                              />
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => window.location.href = `/rsos/${rso.id}`}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleLeaveRSO(rso.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
                    You haven't joined any RSOs yet. Browse RSOs to find groups that interest you!
                  </Typography>
                )}
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel value={tabValue} index={3}>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive notifications about events and RSOs via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Event Reminders" 
                      secondary="Get reminded about upcoming events you've joined"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.eventReminders}
                        onChange={() => handleNotificationChange('eventReminders')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="RSO Updates" 
                      secondary="Get notified about changes in your RSOs"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.rsoUpdates}
                        onChange={() => handleNotificationChange('rsoUpdates')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="University Announcements" 
                      secondary="Receive notifications about university-wide announcements"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.universityAnnouncements}
                        onChange={() => handleNotificationChange('universityAnnouncements')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Profile; 