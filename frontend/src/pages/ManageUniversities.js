import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardMedia,
  CardActions, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, Divider, IconButton, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function ManageUniversities() {
  const { currentUser, userRole } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for creating/editing a university
  const [universityData, setUniversityData] = useState({
    name: '',
    location: '',
    description: '',
    numStudents: '',
    pictureUrl: ''
  });

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        const response = await api.universities.getAll();
        if (response.success) {
          setUniversities(response.universities || []);
        } else {
          setFormError('Failed to load universities');
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
        setFormError('Failed to load universities');
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Reset form data
  const resetFormData = () => {
    setUniversityData({
      name: '',
      location: '',
      description: '',
      numStudents: '',
      pictureUrl: ''
    });
    setFormError('');
  };

  // Handle opening the edit dialog
  const handleEditClick = (university) => {
    setSelectedUniversity(university);
    setUniversityData({
      name: university.name,
      location: university.location || '',
      description: university.description,
      numStudents: university.students.toString(),
      pictureUrl: university.pictureUrl || ''
    });
    setEditDialogOpen(true);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (university) => {
    setSelectedUniversity(university);
    setConfirmDeleteDialog(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUniversityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate university form
  const validateUniversityForm = () => {
    // Check for required fields
    if (!universityData.name || !universityData.description) {
      setFormError('Please fill in all required fields');
      return false;
    }

    // Validate student count is a positive number
    if (isNaN(universityData.numStudents) || parseInt(universityData.numStudents) <= 0) {
      setFormError('Student count must be a positive number');
      return false;
    }

    // Validate picture URL if provided
    if (universityData.pictureUrl && !universityData.pictureUrl.startsWith('http')) {
      setFormError('Please enter a valid URL for the picture');
      return false;
    }

    setFormError('');
    return true;
  };

  // Display temporary success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Handle creating a new university
  const handleCreateUniversity = async () => {
    if (!validateUniversityForm()) return;
    
    setActionLoading(true);
    try {
      const createData = {
        userId: currentUser.userId,
        name: universityData.name,
        description: universityData.description,
        numStudents: parseInt(universityData.numStudents)
      };
      
      const response = await api.universities.create(createData);
      
      if (response.success) {
        // Reload universities to get the new data
        const updatedUniversities = await api.universities.getAll();
        setUniversities(updatedUniversities.universities || []);
        
        resetFormData();
        setCreateDialogOpen(false);
        showSuccessMessage('University created successfully');
      } else {
        setFormError(response.message || 'Failed to create university');
      }
    } catch (error) {
      console.error('Error creating university:', error);
      setFormError(error.response?.data?.message || 'Failed to create university');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle updating a university
  const handleUpdateUniversity = async () => {
    if (!validateUniversityForm() || !selectedUniversity) return;
    
    setActionLoading(true);
    try {
      const updateData = {
        name: universityData.name,
        description: universityData.description,
        numStudents: parseInt(universityData.numStudents)
      };
      
      const response = await api.universities.update(selectedUniversity.id, updateData);
      
      if (response.success) {
        // Reload universities to get the updated data
        const updatedUniversities = await api.universities.getAll();
        setUniversities(updatedUniversities.universities || []);
        
        resetFormData();
        setEditDialogOpen(false);
        showSuccessMessage('University updated successfully');
      } else {
        setFormError(response.message || 'Failed to update university');
      }
    } catch (error) {
      console.error('Error updating university:', error);
      setFormError(error.response?.data?.message || 'Failed to update university');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deleting a university
  const handleDeleteUniversity = async () => {
    if (!selectedUniversity) return;
    
    setActionLoading(true);
    try {
      const response = await api.universities.delete(selectedUniversity.id);
      
      if (response.success) {
        // Remove the university from local state
        setUniversities(prev => prev.filter(uni => uni.id !== selectedUniversity.id));
        setConfirmDeleteDialog(false);
        showSuccessMessage('University deleted successfully');
      } else {
        setFormError(response.message || 'Failed to delete university');
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      setFormError(error.response?.data?.message || 'Failed to delete university');
    } finally {
      setActionLoading(false);
    }
  };

  // If user is not a super admin, show access denied
  if (userRole !== 'superadmin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2 }}>
          <Typography variant="h5" color="error" align="center">
            Access Denied
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Only super administrators can manage universities.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'white' }}>Loading universities...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom color="white">
          Manage Universities
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            resetFormData();
            setCreateDialogOpen(true);
          }}
        >
          Add University
        </Button>
      </Box>
      
      {/* University List */}
      <Grid container spacing={4}>
        {universities.map(university => (
          <Grid item key={university.id} xs={12} md={6}>
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
              <CardMedia
                component="img"
                height="200"
                image={university.pictureUrl || "https://source.unsplash.com/random?university"}
                alt={university.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h3">
                    {university.name}
                  </Typography>
                  
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditClick(university)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteClick(university)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  <strong>Location:</strong> {university.location || 'Not specified'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  <strong>Students:</strong> {university.students.toLocaleString()}
                </Typography>
                
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {university.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
                <Button size="small" color="primary" href={`/events?university=${university.id}`}>
                  View Events
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {universities.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, backgroundColor: '#161a1e', color: 'white', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                No universities found. Create one now!
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Create University Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Add New University</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="University Name"
            name="name"
            value={universityData.name}
            onChange={handleChange}
            sx={{ mb: 3, mt: 2 }}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={universityData.location}
            onChange={handleChange}
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
            value={universityData.description}
            onChange={handleChange}
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
            label="Number of Students"
            name="numStudents"
            type="number"
            value={universityData.numStudents}
            onChange={handleChange}
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
            label="Picture URL"
            name="pictureUrl"
            value={universityData.pictureUrl}
            onChange={handleChange}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUniversity} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Create University'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit University Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Edit University</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="University Name"
            name="name"
            value={universityData.name}
            onChange={handleChange}
            sx={{ mb: 3, mt: 2 }}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={universityData.location}
            onChange={handleChange}
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
            value={universityData.description}
            onChange={handleChange}
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
            label="Number of Students"
            name="numStudents"
            type="number"
            value={universityData.numStudents}
            onChange={handleChange}
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
            label="Picture URL"
            name="pictureUrl"
            value={universityData.pictureUrl}
            onChange={handleChange}
            InputProps={{
              sx: { backgroundColor: '#161a1e', color: 'white' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateUniversity} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Update University'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
        PaperProps={{
          sx: { backgroundColor: '#1b1e22', color: 'white' }
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUniversity?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUniversity} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManageUniversities; 