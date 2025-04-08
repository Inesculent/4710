import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, CardMedia,
  CardActions, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, Divider, IconButton, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';

// Mock data for universities
const mockUniversities = [
  {
    id: 1,
    name: 'University of Central Florida',
    location: 'Orlando, FL',
    description: 'UCF is a public research university with the largest university campus by enrollment in Florida.',
    studentCount: 70000,
    pictures: [
      'https://images.unsplash.com/photo-1587068415117-b49abac631a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  },
  {
    id: 2,
    name: 'Florida State University',
    location: 'Tallahassee, FL',
    description: 'FSU is a public research university offering bachelor\'s, master\'s, and doctoral degrees.',
    studentCount: 45000,
    pictures: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  },
  {
    id: 3,
    name: 'University of Florida',
    location: 'Gainesville, FL',
    description: 'UF is a public land-grant research university, ranked among the top 5 public universities in the United States.',
    studentCount: 55000,
    pictures: [
      'https://images.unsplash.com/photo-1592564630984-7410f94db184?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  }
];

function ManageUniversities() {
  const { currentUser, userRole } = useAuth();
  const [universities, setUniversities] = useState(mockUniversities);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [formError, setFormError] = useState('');

  // Form state for creating/editing a university
  const [universityData, setUniversityData] = useState({
    name: '',
    location: '',
    description: '',
    studentCount: '',
    pictureUrl: ''
  });

  // Reset form data
  const resetFormData = () => {
    setUniversityData({
      name: '',
      location: '',
      description: '',
      studentCount: '',
      pictureUrl: ''
    });
  };

  // Handle opening the edit dialog
  const handleEditClick = (university) => {
    setSelectedUniversity(university);
    setUniversityData({
      name: university.name,
      location: university.location,
      description: university.description,
      studentCount: university.studentCount.toString(),
      pictureUrl: university.pictures[0]
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
    if (!universityData.name || !universityData.location || !universityData.description) {
      setFormError('Please fill in all required fields');
      return false;
    }

    // Validate student count is a positive number
    if (isNaN(universityData.studentCount) || parseInt(universityData.studentCount) <= 0) {
      setFormError('Student count must be a positive number');
      return false;
    }

    // Validate picture URL (basic check)
    if (universityData.pictureUrl && !universityData.pictureUrl.startsWith('http')) {
      setFormError('Please enter a valid URL for the picture');
      return false;
    }

    setFormError('');
    return true;
  };

  // Handle creating a new university
  const handleCreateUniversity = () => {
    if (validateUniversityForm()) {
      const newUniversity = {
        id: universities.length + 1,
        name: universityData.name,
        location: universityData.location,
        description: universityData.description,
        studentCount: parseInt(universityData.studentCount),
        pictures: [universityData.pictureUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80']
      };

      setUniversities(prev => [...prev, newUniversity]);
      resetFormData();
      setCreateDialogOpen(false);
    }
  };

  // Handle updating a university
  const handleUpdateUniversity = () => {
    if (validateUniversityForm() && selectedUniversity) {
      setUniversities(prev => prev.map(uni => 
        uni.id === selectedUniversity.id 
          ? {
              ...uni,
              name: universityData.name,
              location: universityData.location,
              description: universityData.description,
              studentCount: parseInt(universityData.studentCount),
              pictures: [universityData.pictureUrl || uni.pictures[0]]
            }
          : uni
      ));
      
      resetFormData();
      setEditDialogOpen(false);
    }
  };

  // Handle deleting a university
  const handleDeleteUniversity = () => {
    if (selectedUniversity) {
      setUniversities(prev => prev.filter(uni => uni.id !== selectedUniversity.id));
      setConfirmDeleteDialog(false);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                image={university.pictures[0]}
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
                  <strong>Location:</strong> {university.location}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  <strong>Students:</strong> {university.studentCount.toLocaleString()}
                </Typography>
                
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {university.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
                <Button size="small" color="primary">
                  View Events
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
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
            name="studentCount"
            type="number"
            value={universityData.studentCount}
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
          <Button onClick={handleCreateUniversity} color="primary" variant="contained">
            Create University
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
            name="studentCount"
            type="number"
            value={universityData.studentCount}
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
          <Button onClick={handleUpdateUniversity} color="primary" variant="contained">
            Update University
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
          <Button onClick={handleDeleteUniversity} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManageUniversities; 