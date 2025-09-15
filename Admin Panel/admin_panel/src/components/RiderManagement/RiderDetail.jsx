import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function RiderDetail({ riderId, open, onClose }) {
  const [riderDetails, setRiderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && riderId) {
      fetchRiderDetails(riderId);
    }
  }, [open, riderId]);

  const fetchRiderDetails = async (riderId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await axios.get(`http://localhost:5000/api/riders/${riderId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setRiderDetails(response.data);
    } catch (error) {
      console.error('Error fetching rider details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Rider Details
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          style={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : riderDetails ? (
          <div>
            <Typography variant="h6">Rider Name: {riderDetails.rider_name}</Typography>
            <Typography variant="h6">Phone Number: {riderDetails.rider_phone}</Typography>
            <Typography variant="body1">Rider ID: {riderDetails.rider_id}</Typography>
            <Typography variant="body1">Vehicle Type: {riderDetails.vehicle_type}</Typography>
            <Typography variant="body1">Status: {riderDetails.status}</Typography>
            <Typography variant="body1">Location: {riderDetails.location}</Typography>
          </div>
        ) : (
          <Typography variant="body1">No details available</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RiderDetail;
