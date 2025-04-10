// API Service for making requests to the backend
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header if user is logged in
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
const auth = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/users/validate', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('API register call with data:', userData);
      const response = await axiosInstance.post('/users/create', userData);
      console.log('API register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error);
      if (error.response && error.response.data) {
        throw {...error, message: error.response.data.message || 'Registration failed'};
      }
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// User services
const users = {
  getProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  updateProfile: async (userId, profileData) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// University services
const universities = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/universities/all');
      return response.data;
    } catch (error) {
      console.error('Get universities error:', error);
      throw error;
    }
  },
  
  getById: async (uniId) => {
    try {
      const response = await axiosInstance.get(`/universities/${uniId}`);
      return response.data;
    } catch (error) {
      console.error(`Get university ${uniId} error:`, error);
      throw error;
    }
  },
  
  create: async (universityData) => {
    try {
      const response = await axiosInstance.post('/universities/create', universityData);
      return response.data;
    } catch (error) {
      console.error('Create university error:', error);
      throw error;
    }
  },
  
  update: async (universityId, universityData) => {
    try {
      const response = await axiosInstance.put(`/universities/${universityId}`, universityData);
      return response.data;
    } catch (error) {
      console.error(`Update university ${universityId} error:`, error);
      throw error;
    }
  },
  
  delete: async (universityId) => {
    try {
      const response = await axiosInstance.delete(`/universities/${universityId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete university ${universityId} error:`, error);
      throw error;
    }
  }
};

// Event for a user services
const events = {
  getAllPublicEvents: async () => {
    try {
      const response = await axiosInstance.get('/events/all');
      return response.data;
    } catch (error) {
      console.error('Get all public events error:', error);
      throw error;
    }
  },

  getAllUserEvents: async (userId) => {
    try {
      const response = await axiosInstance.get(`/events/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get all events error:', error);
      throw error;
    }
  },
  
  getAllPublicUserEvents: async (userId) => {
    try {
      const response = await axiosInstance.get(`/events/public/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get public events error:', error);
      throw error;
    }
  },

  getAllPrivateUserEvents: async (userId) => {
    try {
      const response = await axiosInstance.get(`/events/private/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get private events error:', error);
      throw error;
    }
  },
  
  getByUniversity: async (uniId) => {
    try {
      const response = await axiosInstance.get(`/events/university/${uniId}`);
      return response.data;
    } catch (error) {
      console.error(`Get events for university ${uniId} error:`, error);
      throw error;
    }
  },
  
  getByRSO: async (rsoId) => {
    try {
      const response = await axiosInstance.get(`/events/rso/${rsoId}`);
      return response.data;
    } catch (error) {
      console.error(`Get events for RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  getById: async (eventId) => {
    try {
      const response = await axiosInstance.get(`/events/event/${eventId}`);
      return response.data.event;
    } catch (error) {
      console.error(`Get event ${eventId} error:`, error);
      throw error;
    }
  },
  
  search: async (params) => {
    try {
      const response = await axiosInstance.get('/events/search', { params });
      return response.data.events;
    } catch (error) {
      console.error('Search events error:', error);
      throw error;
    }
  },
  
  create: async (eventData) => {
    try {
      console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
      const response = await axiosInstance.post('/events/create', eventData);
      console.log('Event creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create event error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        return {
          success: false,
          message: error.response.data.message || 'Failed to create event'
        };
      }
      throw error;
    }
  },
  
  update: async (eventId, eventData) => {
    try {
      const response = await axiosInstance.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Update event ${eventId} error:`, error);
      throw error;
    }
  },
  
  delete: async (eventId) => {
    try {
      const response = await axiosInstance.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete event ${eventId} error:`, error);
      throw error;
    }
  },
  
  approve: async (eventId, adminId) => {
    try {
      const response = await axiosInstance.post(`/events/approve`, { eventId, adminId });
      return response.data;
    } catch (error) {
      console.error(`Approve event ${eventId} error:`, error);
      throw error;
    }
  },
  
  joinEvent: async (eventId, userId) => {
    try {
      const response = await axiosInstance.post(`/events/${eventId}/join`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Join event ${eventId} error:`, error);
      throw error;
    }
  },
  
  leaveEvent: async (eventId, userId) => {
    try {
      const response = await axiosInstance.delete(`/events/${eventId}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Leave event ${eventId} error:`, error);
      throw error;
    }
  }
};

// RSO services
const rsos = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/universities/rso');
      return response.data;
    } catch (error) {
      console.error('Get all RSOs error:', error);
      throw error;
    }
  },
  
  getByUniversity: async (uniId) => {
    try {
      // Validate universityId before making the request
      if (!uniId) {
        console.error('Invalid university ID:', uniId);
        throw new Error('University ID is required');
      }
      
      const response = await axiosInstance.get(`/universities/rso/university/${uniId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSOs for university ${uniId} error:`, error);
      throw error;
    }
  },
  
  getUserRsos: async (userId) => {
    try {
      const response = await axiosInstance.get(`/universities/rso/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSOs for user ${userId} error:`, error);
      throw error;
    }
  },
  
  getById: async (rsoId) => {
    try {
      const response = await axiosInstance.get(`/universities/rso/${rsoId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  create: async (rsoData) => {
    try {
      console.log('Creating RSO with data:', JSON.stringify(rsoData, null, 2));
      const response = await axiosInstance.post('/universities/rso/create', rsoData);
      console.log('RSO creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create RSO error:', error);
      if (error.response) {
        console.error('RSO creation error response:', error.response.data);
      }
      throw error;
    }
  },
  
  update: async (rsoId, rsoData) => {
    try {
      const response = await axiosInstance.put(`/universities/rso/${rsoId}`, rsoData);
      return response.data;
    } catch (error) {
      console.error(`Update RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  delete: async (rsoId) => {
    try {
      const response = await axiosInstance.delete(`/universities/rso/${rsoId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  join: async (rsoId, userId) => {
    try {
      const response = await axiosInstance.post(`/universities/rso/join`, { 
        rsoId: rsoId, 
        userId: userId 
      });
      return response.data;
    } catch (error) {
      console.error(`Join RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  leave: async (rsoId, userId) => {
    try {
      const response = await axiosInstance.delete(`/universities/rso/${rsoId}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Leave RSO ${rsoId} error:`, error);
      throw error;
    }
  }
};

// Comment services
const comments = {
  getByEvent: async (eventId) => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/comments`);
      return response.data.comments;
    } catch (error) {
      console.error(`Get comments for event ${eventId} error:`, error);
      throw error;
    }
  },
  
  add: async (commentData) => {
    try {
      const response = await axiosInstance.post(`/events/${commentData.event_id}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },
  
  delete: async (commentId) => {
    try {
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete comment ${commentId} error:`, error);
      throw error;
    }
  }
};

// Location services
const locations = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Get all locations error:', error);
      throw error;
    }
  },
  
  getById: async (locationId) => {
    try {
      const response = await axiosInstance.get(`/locations/${locationId}`);
      return response.data;
    } catch (error) {
      console.error(`Get location ${locationId} error:`, error);
      throw error;
    }
  },
  
  create: async (locationData) => {
    try {
      const response = await axiosInstance.post('/locations', locationData);
      return response.data;
    } catch (error) {
      console.error('Create location error:', error);
      throw error;
    }
  }
};

// RSVP services
const rsvps = {
  getByEvent: async (eventId) => {
    try {
      const response = await axiosInstance.get(`/rsvps/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSVPs for event ${eventId} error:`, error);
      throw error;
    }
  },
  
  getByUser: async (userId) => {
    try {
      const response = await axiosInstance.get(`/rsvps/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSVPs for user ${userId} error:`, error);
      throw error;
    }
  },
  
  getStatus: async (userId, eventId) => {
    try {
      const response = await axiosInstance.get(`/rsvps/status/${userId}/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSVP status for user ${userId} and event ${eventId} error:`, error);
      throw error;
    }
  },
  
  create: async (rsvpData) => {
    try {
      const response = await axiosInstance.post('/rsvps/create', rsvpData);
      return response.data;
    } catch (error) {
      console.error('Create RSVP error:', error);
      throw error;
    }
  },
  
  update: async (rsvpData) => {
    try {
      const response = await axiosInstance.put('/rsvps/update', rsvpData);
      return response.data;
    } catch (error) {
      console.error('Update RSVP error:', error);
      throw error;
    }
  },
  
  delete: async (userId, eventId) => {
    try {
      const response = await axiosInstance.delete(`/rsvps/${userId}/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete RSVP for user ${userId} and event ${eventId} error:`, error);
      throw error;
    }
  }
};

// Export all api services
const api = {
  auth,
  users,
  universities,
  events,
  rsos,
  comments,
  locations,
  rsvps
};

export default api; 