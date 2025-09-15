import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Avatar,
  IconButton,
  Typography,
  Paper,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [userData, setUserData] = useState({});
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    profile_picture: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const userId = localStorage.getItem('adminId');
  const navigate = useNavigate(); // For routing

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/profile`, {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`,
          },
        });
        setUserData(response.data);
        setEditData({
          name: response.data.name,
          email: response.data.email,
          password: '',
          phone_number: response.data.phone_number,
          address: response.data.address,
          profile_picture: response.data.profile_picture,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle file upload and convert to base64
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditData({ ...editData, profile_picture: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleEditDialogOpen = () => {
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/update/${userId}`, editData, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`,
        },
      });
      setUserData(response.data);
      setOpenEditDialog(false);
      setOpenSnackbar(true); // Open success snackbar
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Destroy session
    navigate('/sign-in'); // Redirect to login
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">User Management</Typography>
          <IconButton onClick={handleLogout}>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
            {/* <LogoutIcon /> */}
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <Avatar src={userData.profile_picture} alt="Profile" sx={{ width: 80, height: 80 }} />
          <Box sx={{ marginLeft: 2 }}>
            <Typography variant="h6">{userData.name}</Typography>
            <Typography>Email: {userData.email}</Typography>
            <Typography>Phone: {userData.phone_number}</Typography>
            <Typography>Address: {userData.address}</Typography>
            <Typography>Role: {userData.role}</Typography>
          </Box>
          <IconButton onClick={handleEditDialogOpen} sx={{ marginLeft: 'auto' }}>
            <EditIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit User Information</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            value={editData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={editData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={editData.password}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            name="phone_number"
            fullWidth
            value={editData.phone_number}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            fullWidth
            value={editData.address}
            onChange={handleInputChange}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-picture-upload"
            type="file"
            onChange={handleProfilePictureChange}
          />
          <label htmlFor="profile-picture-upload">
            <Button variant="outlined" component="span" sx={{ marginTop: 2 }}>
              Upload Profile Picture
            </Button>
          </label>
          {editData.profile_picture && (
            <Avatar src={editData.profile_picture} alt="Profile" sx={{ width: 80, height: 80, marginTop: 2 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // 3 seconds timeout
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          User details updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
