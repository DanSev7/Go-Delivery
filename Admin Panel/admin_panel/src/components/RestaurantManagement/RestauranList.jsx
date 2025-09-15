import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  TextField,
  Alert
} from '@mui/material';
import { Visibility as EyeIcon, Edit as EditIcon, Delete as TrashIcon, Add as AddIcon } from '@mui/icons-material';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false); // For Add/Edit dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For Delete Confirmation dialog
  const [openViewDialog, setOpenViewDialog] = useState(false); // For View details dialog
  const [currentRestaurant, setCurrentRestaurant] = useState(null); // Store restaurant for view, edit, or delete
  const [formMode, setFormMode] = useState('add'); // To determine if form is for 'add' or 'edit'
  const [error, setError] = useState(null); // Store error messages
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    location: '',
    phone_number: '',
    image: '',
    logo: '',
    opening_hours: '',
    average_delivery_time: ''
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/restaurants', {
          headers: {
            Authorization: `${token}`,
          },
        });
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Error fetching restaurants. Please try again later.');
      }
    };

    fetchRestaurants();
  }, []);

  const handleToggleActivation = async (restaurantId, isActive) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/restaurants/${restaurantId}/activate`,
        { isActive: !isActive }, // Toggling the active status
        {
          headers: { Authorization: `${token}` },
        }
      );
      setRestaurants(restaurants.map(restaurant =>
        restaurant.restaurant_id === restaurantId ? { ...restaurant, isActive: !isActive } : restaurant
      ));
    } catch (error) {
      console.error('Error updating restaurant activation status:', error);
      setError('Error updating restaurant status. Please try again later.');
    }
  };

  const handleOpenFormDialog = (restaurant = null) => {
    if (restaurant) {
      setFormMode('edit');
      setRestaurantForm(restaurant);
    } else {
      setFormMode('add');
      setRestaurantForm({
        name: '',
        location: '',
        phone_number: '',
        image: '',
        logo: '',
        opening_hours: '',
        average_delivery_time: ''
      });
    }
    setOpenFormDialog(true);
  };

  const handleOpenDeleteDialog = (restaurant) => {
    setCurrentRestaurant(restaurant); // Set restaurant data for delete
    setOpenDeleteDialog(true);
  };

  const handleOpenViewDialog = (restaurant) => {
    setCurrentRestaurant(restaurant); // Set restaurant data for viewing
    setOpenViewDialog(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/restaurants/${currentRestaurant.restaurant_id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setRestaurants(restaurants.filter((restaurant) => restaurant.restaurant_id !== currentRestaurant.restaurant_id));
      setOpenDeleteDialog(false);
      setCurrentRestaurant(null);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      setError('Error deleting restaurant. Please try again later.');
    }
  };

  const handleCloseDialog = () => {
    setOpenFormDialog(false);
    setOpenDeleteDialog(false);
    setOpenViewDialog(false); // Close the view dialog
    setCurrentRestaurant(null);
  };

  const handleFormChange = (e) => {
    setRestaurantForm({
      ...restaurantForm,
      [e.target.name]: e.target.value,
    });
  };

  // Convert file to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1]; // Extract base64 data
      setRestaurantForm({
        ...restaurantForm,
        [e.target.name]: base64Data, // Save Base64 data to form state
      });
    };
    if (file) {
      reader.readAsDataURL(file); // Read the file as Base64
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (formMode === 'edit') {
        await axios.put(`http://localhost:5000/api/restaurants/${restaurantForm.restaurant_id}`, restaurantForm, {
          headers: { Authorization: `${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/api/restaurants', restaurantForm, {
          headers: { Authorization: `${token}` },
        });
      }
      setOpenFormDialog(false);
      setCurrentRestaurant(null);
      // Fetch updated restaurants list after submitting
      const response = await axios.get('http://localhost:5000/api/restaurants', {
        headers: { Authorization: `${token}` },
      });
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error saving restaurant:', error);
      setError('Error saving restaurant. Please try again later.');
    }
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Restaurants
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenFormDialog()}
        sx={{ marginBottom: 2 }}
      >
        Add Restaurant
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Logo</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Location</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant.restaurant_id}>
                <TableCell align="center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={`data:image/png;base64,${restaurant.logo}`}
                    alt={`${restaurant.name} logo`}
                    style={{
                      width: 96,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: '20%',
                      boxShadow: '0 2px 5px rgba(0.6, 0.2, 0.2, 0.7)' // Add shadow here
                    }}
                  />
                </TableCell>
                <TableCell align="center">{restaurant.name}</TableCell>
                <TableCell align="center">{restaurant.location}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenViewDialog(restaurant)} color="primary">
                    <EyeIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenFormDialog(restaurant)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteDialog(restaurant)} color="error">
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Restaurant Dialog */}
      <Dialog open={openFormDialog} onClose={handleCloseDialog}>
        <DialogTitle>{formMode === 'edit' ? 'Edit Restaurant' : 'Add Restaurant'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={restaurantForm.name}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Location"
              name="location"
              value={restaurantForm.location}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Phone Number"
              name="phone_number"
              value={restaurantForm.phone_number}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Opening Hours (JSON format)"
              name="opening_hours"
              value={restaurantForm.opening_hours}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Average Delivery Time (minutes)"
              name="average_delivery_time"
              value={restaurantForm.average_delivery_time}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Upload Logo
              <input
                type="file"
                hidden
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {restaurantForm.logo && (
              <img
                src={`data:image/png;base64,${restaurantForm.logo}`}
                alt="Preview"
                style={{ width: '100%', marginTop: 10 }}
              />
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" type="submit">
            {formMode === 'edit' ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Restaurant Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseDialog}>
        <DialogTitle>Restaurant Details</DialogTitle>
        <DialogContent>
          {currentRestaurant && (
            <div>
              <img
                src={`data:image/png;base64,${currentRestaurant.logo}`}
                alt={`${currentRestaurant.name} logo`}
                style={{ width: '100%', height: 150, objectFit: 'cover' }}
              />
              <Typography variant="h6">{currentRestaurant.name}</Typography>
              <Typography>Location: {currentRestaurant.location}</Typography>
              <Typography>Phone Number: {currentRestaurant.phone_number}</Typography>
              <Typography>Opening Hours: {currentRestaurant.opening_hours}</Typography>
              <Typography>Average Delivery Time: {currentRestaurant.average_delivery_time}</Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Are you sure you want to delete this restaurant?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="error">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RestaurantList;
