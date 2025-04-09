import React, { useState, useEffect } from 'react';
import { 
  AppBar, Box, Toolbar, Typography, Button, IconButton, 
  Menu, MenuItem, Avatar, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, 
  InputLabel, Select
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { currentUser, userRole, login, logout, changeRole, register } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [roleSelectorOpen, setRoleSelectorOpen] = useState(false);
  
  // Form state
  const [universities, setUniversities] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [universityId, setUniversityId] = useState(1);
  const [selectedRole, setSelectedRole] = useState(userRole);
  const [error, setError] = useState('');
  

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.universities.getAll();
        console.log(response);
        setUniversities(response.universities);
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    fetchUniversities();
  }, []);


  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoginDialogOpen = () => {
    setLoginDialogOpen(true);
    setError('');
  };

  const handleLoginDialogClose = () => {
    setLoginDialogOpen(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleRegisterDialogOpen = () => {
    setRegisterDialogOpen(true);
    setError('');
  };

  const handleRegisterDialogClose = () => {
    setRegisterDialogOpen(false);
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
  };

  const handleRoleSelectorOpen = () => {
    setRoleSelectorOpen(true);
    setSelectedRole(userRole);
  };

  const handleRoleSelectorClose = () => {
    setRoleSelectorOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      handleLoginDialogClose();
    } catch (error) {
      setError('Failed to login: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userData = {
        username: displayName,
        password: password,
        email: email,
        role: 'student', // Default role for new users
        universityId: universityId
      };
      await register(userData);
      handleRegisterDialogClose();
    } catch (error) {
      setError('Failed to register: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleRoleChange = async () => {
    try {
      await changeRole(selectedRole);
      handleRoleSelectorClose();
    } catch (error) {
      setError('Failed to change role: ' + error.message);
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleRSOs = () => {
    handleClose();
    navigate('/rsos');
  };
  
  console.log(universities);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#282c34' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            College Event Hub
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!currentUser ? (
              <>
                <Button color="inherit" onClick={handleLoginDialogOpen}>
                  Sign In
                </Button>
                <Button color="inherit" onClick={handleRegisterDialogOpen}>
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/')}>
                  Home
                </Button>
                <Button color="inherit" onClick={() => navigate('/events')}>
                  Events
                </Button>
                <Button color="inherit" onClick={() => navigate('/rsos')}>
                  RSOs
                </Button>
                {(userRole === 'admin' || userRole === 'superadmin') && (
                  <Button color="inherit" onClick={() => navigate('/create-event')}>
                    Create Event
                  </Button>
                )}
                {userRole === 'superadmin' && (
                  <Button color="inherit" onClick={() => navigate('/manage-universities')}>
                    Universities
                  </Button>
                )}
                <IconButton
                  onClick={handleMenu}
                  sx={{ ml: 2 }}
                >
                  <Avatar 
                    alt={currentUser?.displayName || "User"} 
                    src={currentUser?.photoURL || ""}
                    sx={{ width: 32, height: 32 }} 
                  />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleProfile}>Profile</MenuItem>
                  <MenuItem onClick={handleRSOs}>My RSOs</MenuItem>
                  <MenuItem onClick={handleRoleSelectorOpen}>Switch Role (Demo)</MenuItem>
                  <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Login Dialog */}
      <Dialog 
        open={loginDialogOpen} 
        onClose={handleLoginDialogClose}
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Sign In</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                sx: { backgroundColor: '#161a1e', color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { backgroundColor: '#161a1e', color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleLogin} variant="contained">
            Sign In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog 
        open={registerDialogOpen} 
        onClose={handleRegisterDialogClose}
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              InputProps={{
                sx: { backgroundColor: '#161a1e', color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                sx: { backgroundColor: '#161a1e', color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: { backgroundColor: '#161a1e', color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="university-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                University
              </InputLabel>
              <Select
                labelId="university-label"
                value={universityId}
                label="University"
                onChange={(e) => setUniversityId(e.target.value)}
                sx={{ backgroundColor: '#161a1e', color: 'white' }}
              >
                {universities?.map((university) => (
                  <MenuItem key={university.id} value={university.name}>
                    {university.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRegisterDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleRegister} variant="contained">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Selector Dialog (for demo purposes) */}
      <Dialog 
        open={roleSelectorOpen} 
        onClose={handleRoleSelectorClose}
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Switch Role (Demo)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This is for demonstration purposes only. In a real application, roles would be assigned based on university verification.
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Role
            </InputLabel>
            <Select
              labelId="role-label"
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value)}
              sx={{ backgroundColor: '#161a1e', color: 'white' }}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRoleSelectorClose}>
            Cancel
          </Button>
          <Button onClick={handleRoleChange} variant="contained">
            Switch Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Navbar; 