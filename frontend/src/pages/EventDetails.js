import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, Divider, Button, 
  Avatar, TextField, Rating, Card, CardContent, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RSVPComponent from '../components/RSVPComponent';
import EventMap from '../components/EventMap';

function EventDetails() {
  const { currentUser, userRole } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  
  // Fetch event details and comments
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        
        // Check if eventId is valid
        if (!eventId) {
          setError("Invalid event ID");
          setLoading(false);
          return;
        }
        
        // Fetch event details
        const eventData = await api.events.getById(parseInt(eventId));
        if (!eventData) {
          setError("Event not found");
          setLoading(false);
          return;
        }
        
        setEvent(eventData);
        
        // Fetch location details if we have a locationId
        if (eventData.locationId) {
          try {
            const locationData = await api.locations.getById(eventData.locationId);
            setLocation(locationData);
          } catch (err) {
            console.error("Error fetching location:", err);
            // Non-critical error, we can still show the event
          }
        }
        
        // Fetch comments for this event
        const commentsData = await api.comments.getByEvent(parseInt(eventId));
        setComments(commentsData || []);
        
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format comment date
  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };
  
  // Handle rating change
  const handleRatingChange = async (event, newValue) => {
    if (!currentUser) {
      navigate('/'); // Prompt to log in
      return;
    }
    
    if (!eventId) {
      setError("Invalid event ID");
      return;
    }
    
    setUserRating(newValue);
    
    try {
      // In a real app, we might have a separate rating endpoint
      // For now, we'll add a comment with just a rating
      await api.comments.add({
        event_id: parseInt(eventId),
        user_id: currentUser.uid,
        text: '',
        rating: newValue
      });
      
      // Refresh comments to get updated average
      const updatedComments = await api.comments.getByEvent(parseInt(eventId));
      setComments(updatedComments || []);
      
      // Update the event with the new rating
      const updatedEvent = await api.events.getById(parseInt(eventId));
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to submit rating. Please try again.");
    }
  };
  
  // Handle submitting a new comment
  const handleCommentSubmit = async () => {
    if (!currentUser) {
      navigate('/'); // Prompt to log in
      return;
    }
    
    if (!eventId) {
      setError("Invalid event ID");
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      // Create new comment
      await api.comments.add({
        event_id: parseInt(eventId),
        user_id: currentUser.uid,
        text: commentText,
        rating: userRating || 3 // Default to 3 if no rating provided
      });
      
      // Clear comment text
      setCommentText('');
      
      // Refresh comments
      const updatedComments = await api.comments.getByEvent(parseInt(eventId));
      setComments(updatedComments || []);
      
      // Update the event with the new rating
      const updatedEvent = await api.events.getById(parseInt(eventId));
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to submit comment. Please try again.");
    }
  };
  
  // Handle liking a comment
  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      navigate('/'); // Prompt to log in
      return;
    }
    
    try {
      await api.comments.like(commentId);
      
      // Update comment in the UI
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 } 
          : comment
      ));
    } catch (err) {
      console.error("Error liking comment:", err);
      setError("Failed to like comment. Please try again.");
    }
  };
  
  // Start editing a comment
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };
  
  // Save edited comment
  const handleSaveEditedComment = async () => {
    if (!editedCommentText.trim()) return;
    
    try {
      await api.comments.update(editingCommentId, {
        text: editedCommentText
      });
      
      // Refresh comments
      const updatedComments = await api.comments.getByEvent(parseInt(eventId));
      setComments(updatedComments);
      
      // Reset editing state
      setEditingCommentId(null);
      setEditedCommentText('');
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment. Please try again.");
    }
  };
  
  // Cancel editing comment
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };
  
  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await api.comments.delete(commentId);
      
      // Refresh comments
      const updatedComments = await api.comments.getByEvent(parseInt(eventId));
      setComments(updatedComments);
      
      // Update the event with the new rating
      const updatedEvent = await api.events.getById(parseInt(eventId));
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment. Please try again.");
    }
  };
  
  // Share to social media (mock implementation)
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this event: ${event?.title}`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading event details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Event not found. It may have been deleted or you don't have permission to view it.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Event Image */}
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              src={event.imageUrl || "/default-event-image.jpg"}
              alt={event.title}
              sx={{ 
                width: '100%', 
                height: 'auto', 
                borderRadius: 2,
                maxHeight: 400,
                objectFit: 'cover'
              }}
            />
          </Grid>
          
          {/* Event Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom>
              {event.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating 
                value={event.rating || 0} 
                precision={0.5} 
                readOnly 
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                ({event.rating ? event.rating.toFixed(1) : '0'} / 5)
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {formatDate(event.date)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {event.startTime} - {event.endTime}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {location ? location.name : (event.locationName || 'Location not specified')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {event.contactPhone || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {event.contactEmail || 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <IconButton 
                color="primary" 
                onClick={() => handleShare('facebook')}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                onClick={() => handleShare('twitter')}
              >
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Event Description */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <Typography variant="h5" component="h2" gutterBottom>
              About This Event
            </Typography>
            
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
          </Grid>
          
          {/* RSVP Component */}
          {currentUser && (
            <Grid item xs={12}>
              <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <RSVPComponent eventId={parseInt(eventId)} userId={currentUser.uid} showAttendees={true} />
            </Grid>
          )}
          
          {/* Map */}
          {event.latitude && event.longitude && (
            <Grid item xs={12}>
              <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Location
              </Typography>
              
              <EventMap 
                universityId={event.universityId} 
                eventType={event.type}
              />
            </Grid>
          )}
          
          {/* Rating Section */}
          {currentUser && (
            <Grid item xs={12}>
              <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <Typography variant="h5" component="h2" gutterBottom>
                Rate This Event
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Your Rating:
                </Typography>
                <Rating
                  name="event-rating"
                  value={userRating}
                  onChange={handleRatingChange}
                  size="large"
                />
              </Box>
            </Grid>
          )}
          
          {/* Comments Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <Typography variant="h5" component="h2" gutterBottom>
              Comments
            </Typography>
            
            {/* Add Comment */}
            {currentUser && (
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  InputProps={{
                    sx: { backgroundColor: '#1b1e22', color: 'white' }
                  }}
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                >
                  Post Comment
                </Button>
              </Box>
            )}
            
            {/* Comments List */}
            {comments.length > 0 ? (
              comments.map(comment => (
                <Card 
                  key={comment.id} 
                  sx={{ 
                    mb: 2, 
                    backgroundColor: '#1b1e22', 
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar 
                        src={comment.userAvatar} 
                        alt={comment.userName}
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1">
                            {comment.userName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {formatCommentDate(comment.timestamp)}
                          </Typography>
                        </Box>
                        
                        {editingCommentId === comment.id ? (
                          <Box>
                            <TextField
                              fullWidth
                              multiline
                              value={editedCommentText}
                              onChange={(e) => setEditedCommentText(e.target.value)}
                              InputProps={{
                                sx: { backgroundColor: '#161a1e', color: 'white' }
                              }}
                              sx={{ mb: 2 }}
                            />
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={handleSaveEditedComment}
                              sx={{ mr: 1 }}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </Box>
                        ) : (
                          <>
                            {comment.text && (
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {comment.text}
                              </Typography>
                            )}
                            {comment.rating > 0 && (
                              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Rating value={comment.rating} readOnly size="small" />
                                <Typography variant="body2" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.6)' }}>
                                  {comment.rating}/5
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Button 
                            startIcon={<ThumbUpIcon />} 
                            size="small"
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            Like ({comment.likes})
                          </Button>
                          
                          {currentUser && (comment.user_id === currentUser.uid || userRole === 'admin' || userRole === 'superadmin') && (
                            <Box>
                              {editingCommentId !== comment.id && (
                                <>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditComment(comment)}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteComment(comment.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default EventDetails; 