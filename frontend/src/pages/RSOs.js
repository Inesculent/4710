import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardActions, 
  Button, Chip, Divider, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function RSOs() {
  const { currentUser, userRole } = useAuth();
  const [rsos, setRSOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [error, setError] = useState('');
  const [universities, setUniversities] = useState([]);
  // Form state for creating a new RSO
  const [newRSO, setNewRSO] = useState({
    name: '',
    description: '',
    userId: currentUser.userId,
    adminEmail: currentUser?.email || '',
    emailDomain: '@knights.ucf.edu', // Example domain
    members: ['', '', '', ''], // Need at least 4 other members
    universityId: currentUser?.universityId || ''
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Fetch RSOs on component mount
  useEffect(() => {
    const fetchRSOs = async () => {
      try {
        setLoading(true);
        setError('');
        let fetchedRSOs;
        
        if (currentUser) {
          // Fetch RSOs for user's university if we have a user ID
          console.log('Fetching RSOs for user:', currentUser.userId);
          fetchedRSOs = await api.rsos.getUserRsos(currentUser.userId);
          console.log('Fetched RSOs:', fetchedRSOs);
          fetchedRSOs = fetchedRSOs.rsos;
        } else {
          // If not logged in, just get all RSOs
          console.log('Fetching all RSOs (not logged in)');
          fetchedRSOs = await api.rsos.getAll();
          fetchedRSOs = fetchedRSOs.rsos;
        }
        
        setRSOs(fetchedRSOs || []);
        setError('');
      } catch (err) {
        console.error('Error fetching RSOs:', err);
        setError('Failed to load RSOs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRSOs();
  }, [currentUser]);

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      const response = await api.universities.getAll();
      setUniversities(response.universities);
    };
    fetchUniversities();
  }, []);

  // Handle input changes for new RSO form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRSO(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle member email input changes
  const handleMemberChange = (index, value) => {
    const updatedMembers = [...newRSO.members];
    updatedMembers[index] = value;
    
    setNewRSO(prev => ({
      ...prev,
      members: updatedMembers
    }));
    
    // Clear error for this member field
    if (errors[`member${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`member${index}`]: ''
      }));
    }
  };

  // Validate RSO creation form
  const validateRSOForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!newRSO.name.trim()) {
      newErrors.name = 'RSO name is required';
    }
    
    if (!newRSO.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Check university selection
    if (!newRSO.universityId) {
      newErrors.universityId = 'University selection is required';
    }
    
    // Check all members have valid university emails
    const emailRegex = new RegExp(`^[A-Z0-9._%+-]+${newRSO.emailDomain.replace('.', '\\.')}$`, 'i');
    
    newRSO.members.forEach((member, index) => {
      if (!member.trim()) {
        newErrors[`member${index}`] = 'Email is required';
      } else if (!emailRegex.test(member)) {
        newErrors[`member${index}`] = `Must be a valid university email (${newRSO.emailDomain})`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle RSO creation submission
  const handleCreateRSO = async () => {
    if (validateRSOForm()) {
      try {
        setLoading(true);
        
        const rsoData = {
          rsoName: newRSO.name,
          description: newRSO.description,
          userId: currentUser.userId,
          adminEmail: newRSO.adminEmail || currentUser.email,
          emailDomain: newRSO.emailDomain,
          members: newRSO.members.filter(email => email.trim() !== ''),
          universityId: newRSO.universityId
        };
        
        console.log('Creating RSO with data:', rsoData);
        const response = await api.rsos.create(rsoData);
        console.log('RSO creation response:', response);
        
        if (response.success) {
          // Refresh RSO list using a safe approach
          try {
            let updatedRSOs;
            
            // First try to get RSOs by the university we just used
            if (newRSO.universityId) {
              console.log(`Getting RSOs for university ID: ${newRSO.universityId}`);
              updatedRSOs = await api.rsos.getByUniversity(newRSO.universityId);
            } 
            // Fallback to getting user's RSOs
            else {
              console.log(`Getting RSOs for user ID: ${currentUser.userId}`);
              updatedRSOs = await api.rsos.getUserRsos(currentUser.userId);
            }
            
            setRSOs(updatedRSOs.rsos || []);
          } catch (refreshError) {
            console.error('Error refreshing RSOs:', refreshError);
            // Even if refresh fails, we still consider creation successful
          }
          
          // Reset form and close dialog
          setNewRSO({
            name: '',
            description: '',
            adminEmail: currentUser?.email || '',
            emailDomain: '@knights.ucf.edu',
            members: ['', '', '', ''],
            universityId: currentUser?.universityId || (universities.length > 0 ? universities[0].id : '')
          });
          setCreateDialogOpen(false);
          setError('');
        } else {
          setError(response.message || 'Failed to create RSO');
        }
      } catch (err) {
        console.error('Error creating RSO:', err);
        setError('Failed to create RSO. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle joining an RSO
  const handleJoinRSO = async (rsoId) => {
    // Check if user is logged in
    if (!currentUser) {
      setJoinError('You must be logged in to join an RSO');
      return;
    }
    
    try {
      setLoading(true);
      await api.rsos.join(rsoId, currentUser.userId);
      
      // Refresh RSO list
      const updatedRSOs = await api.rsos.getByUniversity(currentUser.universityId);
      setRSOs(updatedRSOs);
      setJoinError('');
    } catch (err) {
      console.error('Error joining RSO:', err);
      setJoinError('Failed to join RSO. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle leaving an RSO
  const handleLeaveRSO = async (rsoId) => {
    try {
      setLoading(true);
      await api.rsos.leave(rsoId, currentUser.userId);
      
      // Refresh RSO list
      const updatedRSOs = await api.rsos.getByUniversity(currentUser.universityId);
      setRSOs(updatedRSOs);
      setJoinError('');
    } catch (err) {
      console.error('Error leaving RSO:', err);
      setJoinError('Failed to leave RSO. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter RSOs based on search term
  const filteredRSOs = rsos.filter(rso => 
    rso.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rso.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle opening the create dialog
  const handleOpenCreateDialog = () => {
    // Set default university if available
    if (!newRSO.universityId && universities.length > 0) {
      setNewRSO(prev => ({
        ...prev,
        universityId: currentUser?.universityId || universities[0].id
      }));
    }
    setCreateDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom color="white">
          Registered Student Organizations
        </Typography>
        
        {currentUser && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenCreateDialog}
          >
            Create RSO
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {joinError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setJoinError('')}>
          {joinError}
        </Alert>
      )}
      
      {/* Search Box */}
      <TextField
        fullWidth
        label="Search RSOs"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          sx: { backgroundColor: '#161a1e', color: 'white' }
        }}
        InputLabelProps={{
          sx: { color: 'rgba(255, 255, 255, 0.7)' }
        }}
      />
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* RSO List */
        filteredRSOs.length > 0 ? (
          <Grid container spacing={4}>
            {filteredRSOs.map(rso => (
              <Grid item key={rso.rsoId} xs={12} md={6}>
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h3">
                        {rso.rsoName}
                      </Typography>
                      
                      <Chip 
                        label={`${rso.members.length || 0} members`} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {rso.description}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Administrator:</strong> {rso.adminEmail || 'Unknown'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Status:</strong> {rso.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    {currentUser && (
                      rso.isMember ? (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleLeaveRSO(rso.id)}
                        >
                          Leave RSO
                        </Button>
                      ) : (
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="primary"
                          onClick={() => handleJoinRSO(rso.id)}
                        >
                          Join RSO
                        </Button>
                      )
                    )}
                    
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => window.location.href = `/rsos/${rso.id}`}
                    >
                      View Details
                    </Button>
                    
                    {currentUser && userRole === 'admin' && currentUser.email === rso.adminEmail && (
                      <Button 
                        size="small" 
                        color="secondary"
                        onClick={() => window.location.href = `/rsos/${rso.id}/manage`}
                      >
                        Manage
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6, color: 'white' }}>
            <Typography variant="h6">
              No RSOs found matching your criteria.
            </Typography>
          </Box>
        )
      )}
      
      {/* Create RSO Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Create New RSO</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            To create a new RSO, you need at least 4 other members with the same university email domain.
          </Typography>
          
          <TextField
            fullWidth
            label="RSO Name"
            name="name"
            value={newRSO.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={newRSO.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          
          <TextField
            fullWidth
            label="Email Domain"
            name="emailDomain"
            value={newRSO.emailDomain}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          
          <FormControl 
            fullWidth 
            sx={{ mb: 3 }}
            error={!!errors.universityId}
          >
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>University</InputLabel>
            <Select
              name="universityId"
              value={newRSO.universityId}
              onChange={handleChange}
              sx={{ backgroundColor: '#161a1e', color: 'white' }}
              label="University"
            >
              {universities.map((university) => (
                <MenuItem key={university.id} value={university.id}>
                  {university.name}
                </MenuItem>
              ))}
            </Select>
            {errors.universityId && <FormHelperText>{errors.universityId}</FormHelperText>}
          </FormControl>
          
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            Member Emails (minimum 4)
          </Typography>
          
          {newRSO.members.map((member, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Member ${index + 1} Email`}
              value={member}
              onChange={(e) => handleMemberChange(index, e.target.value)}
              error={!!errors[`member${index}`]}
              helperText={errors[`member${index}`]}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { backgroundColor: '#161a1e', color: 'white' }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          ))}
          
          <Button
            variant="outlined"
            onClick={() => setNewRSO(prev => ({
              ...prev,
              members: [...prev.members, '']
            }))}
            sx={{ mt: 1 }}
          >
            Add Another Member
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateRSO} color="primary" variant="contained">
            Create RSO
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RSOs; 