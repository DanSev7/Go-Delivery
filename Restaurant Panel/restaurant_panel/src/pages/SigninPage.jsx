import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api, { endpoints } from '../config/api';
import {
  Button,
  TextField,
  Grid,
  Box,
  Container,
  Typography,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const SigninPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [notification, setNotification] = useState({ message: '', type: '', open: false });
  const [passwordFocused, setPasswordFocused] = useState(false); // State to track if password field is focused
  const navigate = useNavigate();

  const showNotification = (message, type) => {
    setNotification({ message, type, open: true });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
      };

      const response = await api.post(endpoints.auth.login, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { token, user } = response.data;
      const { user_id, role } = user;
      
      // Check if user has restaurant_manager role
      if (role !== 'restaurant_manager') {
        showNotification('Access denied. Restaurant manager privileges required.', 'error');
        return;
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('restaurantId', user_id);
      localStorage.setItem('userRole', role);

      showNotification('Sign In Successful! Redirecting to Dashboard...', 'success');
      setTimeout(() => {
        navigate('/restaurant/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Sign In Failed. Please check your credentials.';
      showNotification(errorMessage, 'error');
    }
  };

  const password = watch('password');

  // Password validation criteria
  const passwordValidation = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasMinLength: password && password.length >= 6,
  };

  const allValid = Object.values(passwordValidation).every(Boolean);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Sign In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                {...register('password', {
                  required: 'Password is required',
                })}
                error={!!errors.password}
                onFocus={() => setPasswordFocused(true)}  // Set focus to true when focused
                onBlur={() => setPasswordFocused(false)}  // Set focus to false when focus is lost
              />
              {passwordFocused && (
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="At least one lowercase letter"
                      sx={{ color: passwordValidation.hasLowercase ? 'green' : 'red' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="At least one uppercase letter"
                      sx={{ color: passwordValidation.hasUppercase ? 'green' : 'red' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="At least one number"
                      sx={{ color: passwordValidation.hasNumber ? 'green' : 'red' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Minimum 6 characters"
                      sx={{ color: passwordValidation.hasMinLength ? 'green' : 'red' }}
                    />
                  </ListItem>
                </List>
              )}
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={!allValid}
            sx={{
              mt: 3,
              mb: 2,
              padding: '10px',
              fontWeight: 'bold',
              background: allValid
                ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                : 'gray',
            }}
          >
            Sign In
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SigninPage;
