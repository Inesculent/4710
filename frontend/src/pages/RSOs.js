import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardActions, 
  Button, Chip, Divider, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Alert, CircularProgress
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

  // Form state for creating a new RSO
  const [newRSO, setNewRSO] = useState({
    name: '',
    description: '',
    universityId: currentUser?.universityId || 1, // Default to first university if not set
    adminEmail: currentUser?.email || '',
    emailDomain: '@knights.ucf.edu', // Example domain
    members: ['', '', '', ''] // Need at least 4 other members
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Fetch RSOs on component mount
  useEffect(() => {
    const fetchRSOs = async () => {
      try {
        setLoading(true);
        let fetchedRSOs;
        
        if (currentUser) {
          // Fetch RSOs for user's university
          fetchedRSOs = await api.rsos.getByUniversity(currentUser.universityId);
        } else {
          // If not logged in, just get all RSOs
          fetchedRSOs = await api.rsos.getAll();
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
          name: newRSO.name,
          description: newRSO.description,
          universityId: newRSO.universityId,
          adminEmail: newRSO.adminEmail || currentUser.email,
          emailDomain: newRSO.emailDomain,
          members: newRSO.members
        };
        
        await api.rsos.create(rsoData);
        
        // Refresh RSO list
        const updatedRSOs = await api.rsos.getByUniversity(currentUser.universityId);
        setRSOs(updatedRSOs);
        
        // Reset form and close dialog
        setNewRSO({
          name: '',
          description: '',
          universityId: currentUser?.universityId || 1,
          adminEmail: currentUser?.email || '',
          emailDomain: '@knights.ucf.edu',
          members: ['', '', '', '']
        });
        setCreateDialogOpen(false);
        setError('');
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
            onClick={() => setCreateDialogOpen(true)}
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
              <Grid item key={rso.id} xs={12} md={6}>
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
                        {rso.name}
                      </Typography>
                      
                      <Chip 
                        label={`${rso.memberCount || 0} members`} 
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
                      <strong>University:</strong> {rso.universityName || 'Unknown'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Administrator:</strong> {rso.adminEmail || 'Unknown'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Status:</strong> {rso.active ? 'Active' : 'Inactive'}
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