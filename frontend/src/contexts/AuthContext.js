import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('student'); // Default role: student, admin, or superadmin

  useEffect(() => {
    // Check for saved user in localStorage (for persistence between refreshes)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setUserRole(user.isAdmin ? 'admin' : user.isSuperAdmin ? 'superadmin' : 'student');
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const data = await api.auth.login(email, password);
      const user = data.user;
      setCurrentUser(user);
      
      // Set role based on admin status
      let role = 'student';
      if (user.isSuperAdmin) {
        role = 'superadmin';
      } else if (user.isAdmin) {
        role = 'admin';
      }
      
      setUserRole(role);
      localStorage.setItem('user', JSON.stringify(user));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('Registering with data:', userData);
      const response = await api.auth.register(userData);
      
      if (response.success) {
        // Handle successful registration
        console.log('Registration successful:', response);
        // Auto-login after registration if appropriate
        await login(userData.email, userData.password);
        return response;
      } else {
        console.error('Registration failed:', response);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Forward the error message from backend if available
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setUserRole('student');
  };

  // Change role (this would need API support in a real app)
  const changeRole = async (newRole) => {
    if (!currentUser) return;
    
    try {
      // This would require backend support to change roles
      // For now, we'll just update the UI
      const updatedUser = {
        ...currentUser,
        isAdmin: newRole === 'admin',
        isSuperAdmin: newRole === 'superadmin'
      };
      
      setCurrentUser(updatedUser);
      setUserRole(newRole);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Change role error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    register,
    logout,
    changeRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 