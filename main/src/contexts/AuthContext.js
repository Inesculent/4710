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
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setUserRole(user.role);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const user = await api.auth.login(email, password);
      setCurrentUser(user);
      setUserRole(user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (email, password, displayName, universityId) => {
    try {
      const user = await api.auth.register(email, password, displayName, universityId);
      setCurrentUser(user);
      setUserRole(user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setUserRole('student');
    localStorage.removeItem('currentUser');
  };

  // Change role (for demo purposes)
  const changeRole = async (newRole) => {
    if (!currentUser) return;
    
    try {
      const updatedUser = await api.auth.setUserRole(currentUser.uid, newRole);
      setCurrentUser(updatedUser);
      setUserRole(updatedUser.role);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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