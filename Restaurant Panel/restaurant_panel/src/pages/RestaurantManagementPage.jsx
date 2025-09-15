import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import api, { endpoints } from '../config/api';

// Helper function to format opening hours
const formatOpeningHours = (openingHours) => {
  if (!openingHours) return 'Not specified';
  
  // If it's already a string, return it
  if (typeof openingHours === 'string') {
    return openingHours;
  }
  
  // If it's an object, format it nicely
  if (typeof openingHours === 'object') {
    return Object.entries(openingHours)
      .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
      .join(', ');
  }
  
  return 'Not specified';
};

const RestaurantManagementPage = () => {
  const [restaurant, setRestaurant] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone_number: '',
    image: '',
    logo: '',
    opening_hours: '',
    average_delivery_time: '',
    category: '',
  });
  const [imagePreview, setImagePreview] = useState(''); // For image preview
  const [logoPreview, setLogoPreview] = useState(''); // For logo preview
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false); // Track if adding a new restaurant

  const restaurantId = localStorage.getItem('restaurantId');
  console.log("Restaurant Id on  Restaurant Management page : ",restaurantId );
  
  // Fetch restaurant details on component load
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        if (restaurantId) {
          // Fetch existing restaurant
          const response = await api.get(endpoints.restaurants.get(restaurantId));

          setRestaurant(response.data);
          localStorage.setItem('restaurantId', response.data.restaurant_id); 
          setFormData({
            name: response.data.name,
            location: response.data.location,
            phone_number: response.data.phone_number,
            opening_hours: typeof response.data.opening_hours === 'object' 
              ? JSON.stringify(response.data.opening_hours) 
              : response.data.opening_hours || '',
            average_delivery_time: response.data.average_delivery_time,
            image: response.data.image || '', // Preserve previous values
            logo: response.data.logo || '',   // Preserve previous values
            category: response.data.category || '',
          });
          setImagePreview(response.data.image ? `data:image/jpeg;base64,${response.data.image}` : '');
          setLogoPreview(response.data.logo ? `data:image/jpeg;base64,${response.data.logo}` : '');
        } else {
          // No restaurant exists, clear form
          setRestaurant({});
          setFormData({
            name: '',
            location: '',
            phone_number: '',
            image: '',
            logo: '',
            opening_hours: '',
            average_delivery_time: '',
            category: '',
          });
          setImagePreview('');
          setLogoPreview('');
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // Handle opening the edit dialog
  const handleEditClick = () => {
    setIsAdding(false); // Reset to editing mode
    setEditDialogOpen(true);
  };

  // Handle closing the edit dialog
  const handleDialogClose = () => {
    setEditDialogOpen(false);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file change (convert to base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (e.target.name === 'image') {
          setImagePreview(reader.result);
        } else if (e.target.name === 'logo') {
          setLogoPreview(reader.result);
        }
        setFormData({
          ...formData,
          [e.target.name]: reader.result.split(',')[1], // Extract base64 part
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit (save updated restaurant)
  const handleSubmit = async () => {
    try {
      const method = isAdding ? 'POST' : 'PUT';
      const endpoint = isAdding ? endpoints.restaurants.create : endpoints.restaurants.update(restaurantId);

      // Prepare form data with proper opening hours handling
      const submitData = {
        ...formData,
        opening_hours: formData.opening_hours || ''
      };

      await api({
        method,
        url: endpoint,
        data: submitData
      });

      // Refresh restaurant data to reflect changes
      const response = await api.get(endpoints.restaurants.get(restaurantId));

      setRestaurant(response.data);
      setImagePreview(response.data.image ? `data:image/jpeg;base64,${response.data.image}` : '');
      setLogoPreview(response.data.logo ? `data:image/jpeg;base64,${response.data.logo}` : '');
      setSuccessDialogOpen(true);
      setEditDialogOpen(false);
      setIsAdding(false); // Reset to editing mode
    } catch (error) {
      console.error('Error updating/creating restaurant:', error);
      setErrorMessage('Error updating/creating restaurant.');
      setErrorDialogOpen(true);
    }
  };

  // Function to handle adding a new restaurant
  const handleAddRestaurant = () => {
    setIsAdding(true); // Set to adding mode
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Restaurant Management
      </Typography>

      {restaurant.name ? (
        // Show restaurant details if one exists
        <Box sx={{ 
          padding: 4, 
          borderRadius: 2, 
          boxShadow: 3, 
          backgroundColor: 'background.paper' 
        }}>
          <Typography variant="h6" gutterBottom>
            Restaurant Details
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {restaurant.name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {restaurant.location}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Phone Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {restaurant.phone_number}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Opening Hours
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatOpeningHours(restaurant.opening_hours)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Average Delivery Time
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {restaurant.average_delivery_time}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Background Image
                </Typography>
                {imagePreview && (
                  <img src={imagePreview} alt="Restaurant" width="200" height="100" />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Logo
                </Typography>
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" width="200" height="100" />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                padding: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                backgroundColor: 'rgb(245, 245, 245)' 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Category
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {restaurant.category}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ marginTop: 4 }}>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleEditClick}>
                Edit Restaurant
              </Button>
            </Grid>
          </Grid>
        </Box>
      ) : (
        // Show button to add a restaurant if none exists
        <Grid container spacing={2} sx={{ marginTop: 4 }}>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleAddRestaurant}>
              Add Restaurant
            </Button>
          </Grid>
        </Grid>
      )}

      {/* Edit Dialog (for both editing and adding) */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{isAdding ? 'Add Restaurant' : 'Edit Restaurant Details'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opening Hours"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleChange}
                placeholder="e.g., Mon-Fri: 9:00-22:00, Sat-Sun: 10:00-23:00"
                multiline
                rows={2}
                helperText="Enter opening hours as text or JSON format"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Average Delivery Time"
                name="average_delivery_time"
                value={formData.average_delivery_time}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                name="image"
                onChange={handleFileChange}
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span">
                  Upload Background Image
                </Button>
              </label>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ width: '30%', marginTop: 10 }} />
              )}
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                name="logo"
                onChange={handleFileChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="contained" component="span">
                  Upload Logo
                </Button>
              </label>
              {logoPreview && (
                <img src={logoPreview} alt="Preview" style={{ width: '30%', marginTop: 10 }} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isAdding ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>{isAdding ? 'Restaurant added' : 'Restaurant details updated'} successfully.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantManagementPage;