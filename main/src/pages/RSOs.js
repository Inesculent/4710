import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardActions, 
  Button, Chip, Divider, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Mock data for RSOs
const mockRSOs = [
  { 
    id: 1, 
    name: 'Computer Science Club', 
    description: 'A club for computer science students interested in programming and technology.',
    university: 'UCF',
    memberCount: 25,
    active: true,
    admin: 'john.doe@knights.ucf.edu',
    isMember: false
  },
  { 
    id: 2, 
    name: 'Chess Club', 
    description: 'Weekly meetings for chess enthusiasts of all skill levels.',
    university: 'UCF',
    memberCount: 15,
    active: true,
    admin: 'jane.smith@knights.ucf.edu',
    isMember: true
  },
  { 
    id: 3, 
    name: 'Engineering Society', 
    description: 'Professional organization for engineering students.',
    university: 'UCF',
    memberCount: 50,
    active: true,
    admin: 'alex.johnson@knights.ucf.edu',
    isMember: false
  },
  { 
    id: 4, 
    name: 'Drama Club', 
    description: 'For students interested in theater and performance arts.',
    university: 'UCF',
    memberCount: 20,
    active: true,
    admin: 'sarah.williams@knights.ucf.edu',
    isMember: false
  },
  { 
    id: 5, 
    name: 'Soccer Club', 
    description: 'Casual soccer games every weekend.',
    university: 'UCF',
    memberCount: 18,
    active: true,
    admin: 'mike.brown@knights.ucf.edu',
    isMember: true
  }
];

function RSOs() {
  const { currentUser, userRole } = useAuth();
  const [rsos, setRSOs] = useState(mockRSOs);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Form state for creating a new RSO
  const [newRSO, setNewRSO] = useState({
    name: '',
    description: '',
    members: ['', '', '', ''] // Need at least 4 other members (5 total including admin)
  });

  // Form validation
  const [errors, setErrors] = useState({});

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
    newRSO.members.forEach((member, index) => {
      if (!member.trim()) {
        newErrors[`member${index}`] = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@knights\.ucf\.edu$/i.test(member)) {
        newErrors[`member${index}`] = 'Must be a valid university email (@knights.ucf.edu)';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle RSO creation submission
  const handleCreateRSO = () => {
    if (validateRSOForm()) {
      // In a real app, we would send this data to the backend
      const newRSOData = {
        id: rsos.length + 1,
        name: newRSO.name,
        description: newRSO.description,
        university: 'UCF', // Assuming university
        memberCount: newRSO.members.length + 1, // +1 for admin (current user)
        active: true,
        admin: currentUser?.email || 'current.user@knights.ucf.edu',
        isMember: true // Creator is automatically a member
      };
      
      // Add new RSO to list
      setRSOs(prev => [...prev, newRSOData]);
      
      // Reset form and close dialog
      setNewRSO({
        name: '',
        description: '',
        members: ['', '', '', '']
      });
      setCreateDialogOpen(false);
    }
  };

  // Handle joining an RSO
  const handleJoinRSO = (rsoId) => {
    // Check if user is logged in
    if (!currentUser) {
      setJoinError('You must be logged in to join an RSO');
      return;
    }
    
    // In a real app, we would send a request to join the RSO
    // For now, just update the UI
    setRSOs(prev => prev.map(rso => 
      rso.id === rsoId ? { ...rso, isMember: true, memberCount: rso.memberCount + 1 } : rso
    ));
  };

  // Handle leaving an RSO
  const handleLeaveRSO = (rsoId) => {
    // In a real app, we would send a request to leave the RSO
    // For now, just update the UI
    setRSOs(prev => prev.map(rso => 
      rso.id === rsoId ? { ...rso, isMember: false, memberCount: rso.memberCount - 1 } : rso
    ));
  };

  // Filter RSOs based on search term
  const filteredRSOs = rsos.filter(rso => 
    rso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rso.description.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      {/* RSO List */}
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
                    label={`${rso.memberCount} members`} 
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
                  <strong>University:</strong> {rso.university}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <strong>Administrator:</strong> {rso.admin}
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
                
                <Button size="small" color="primary">
                  View Details
                </Button>
                
                {currentUser && userRole === 'admin' && currentUser.email === rso.admin && (
                  <Button size="small" color="secondary">
                    Manage
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
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