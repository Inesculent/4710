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
      const response = await axiosInstance.post('/users/create', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
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
      const response = await axiosInstance.get(`/users/${userId}`);
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
      const response = await axiosInstance.post('/universities', universityData);
      return response.data;
    } catch (error) {
      console.error('Create university error:', error);
      throw error;
    }
  }
};

// Event services
const events = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/events');
      return response.data;
    } catch (error) {
      console.error('Get all events error:', error);
      throw error;
    }
  },
  
  getPublic: async () => {
    try {
      const response = await axiosInstance.get('/events/public');
      return response.data;
    } catch (error) {
      console.error('Get public events error:', error);
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
  
  getUserEvents: async (userId) => {
    try {
      const response = await axiosInstance.get(`/events/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get events for user ${userId} error:`, error);
      throw error;
    }
  },
  
  getById: async (eventId) => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Get event ${eventId} error:`, error);
      throw error;
    }
  },
  
  create: async (eventData) => {
    try {
      const response = await axiosInstance.post('/events/create', eventData);
      return response.data;
    } catch (error) {
      console.error('Create event error:', error);
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
      const response = await axiosInstance.post(`/events/${eventId}/approve`, { adminId });
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
      const response = await axiosInstance.get('/rsos');
      return response.data;
    } catch (error) {
      console.error('Get all RSOs error:', error);
      throw error;
    }
  },
  
  getByUniversity: async (uniId) => {
    try {
      const response = await axiosInstance.get(`/rsos/university/${uniId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSOs for university ${uniId} error:`, error);
      throw error;
    }
  },
  
  getUserRsos: async (userId) => {
    try {
      const response = await axiosInstance.get(`/rsos/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSOs for user ${userId} error:`, error);
      throw error;
    }
  },
  
  getById: async (rsoId) => {
    try {
      const response = await axiosInstance.get(`/rsos/${rsoId}`);
      return response.data;
    } catch (error) {
      console.error(`Get RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  create: async (rsoData) => {
    try {
      const response = await axiosInstance.post('/rsos/create', rsoData);
      return response.data;
    } catch (error) {
      console.error('Create RSO error:', error);
      throw error;
    }
  },
  
  update: async (rsoId, rsoData) => {
    try {
      const response = await axiosInstance.put(`/rsos/${rsoId}`, rsoData);
      return response.data;
    } catch (error) {
      console.error(`Update RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  delete: async (rsoId) => {
    try {
      const response = await axiosInstance.delete(`/rsos/${rsoId}`);
      return response.data;
    } catch (error) {
      console.error(`Delete RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  join: async (rsoId, userId) => {
    try {
      const response = await axiosInstance.post(`/rsos/${rsoId}/join`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Join RSO ${rsoId} error:`, error);
      throw error;
    }
  },
  
  leave: async (rsoId, userId) => {
    try {
      const response = await axiosInstance.delete(`/rsos/${rsoId}/users/${userId}`);
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
      const response = await axiosInstance.get(`/comments/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Get comments for event ${eventId} error:`, error);
      throw error;
    }
  },
  
  add: async (commentData) => {
    try {
      const response = await axiosInstance.post('/comments/add', commentData);
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

// Export all api services
const api = {
  auth,
  users,
  universities,
  events,
  rsos,
  comments,
  locations
};

export default api; 