import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Grid,
  Box,
  Container,
  Typography,
  InputLabel,
  Input,
} from '@mui/material';

import Notification from './Notification';

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000);
  };

  const handleFileChange = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data) => {
    try {
      const base64Image = data.profile_picture[0]
        ? await handleFileChange(data.profile_picture[0])
        : '';

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone_number: data.phone_number,
        address: data.address,
        profile_picture: base64Image, // Sending the base64 image
        role: 'admin',
      };

      await axios.post('http://localhost:5000/api/users/register', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      showNotification('Sign Up Successful! Redirecting to Sign In...', 'success');
      setTimeout(() => {
        navigate('/sign-in');
      }, 800);
    } catch (error) {
      showNotification('Sign Up Failed. Please try again.', 'error');
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'white',
        }}
      >
        <Notification message={notification.message} type={notification.type} />
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 3 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phone_number', { required: 'Phone number is required' })}
                error={!!errors.phone_number}
                helperText={errors.phone_number ? errors.phone_number.message : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                {...register('address', { required: 'Address is required' })}
                error={!!errors.address}
                helperText={errors.address ? errors.address.message : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel htmlFor="profile_picture">Profile Picture</InputLabel>
              <Input
                type="file"
                fullWidth
                {...register('profile_picture', { required: 'Profile picture is required' })}
                error={!!errors.profile_picture}
                sx={{ mt: 1 }}
              />
              {errors.profile_picture && (
                <Typography variant="caption" color="error">
                  {errors.profile_picture.message}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SignupPage;
