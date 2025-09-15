import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import axios from 'axios';

function RiderDialog({ open, onClose, dialogType, rider, onRiderUpdated }) {
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (rider) {
      setVehicleType(rider.vehicle_type);
      setStatus(rider.status);
      setLocation(rider.location);
    } else {
      setVehicleType('');
      setStatus('');
      setLocation('');
    }
  }, [rider]);

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      if (dialogType === 'create') {
        const newRider = await axios.post('http://localhost:5000/api/riders', 
          { vehicle_type: vehicleType, status, location }, 
          { headers: { Authorization: `${token}` } }
        );
        onRiderUpdated(newRider.data);
      } else {
        const updatedRider = await axios.put(`http://localhost:5000/api/riders/${rider.rider_id}`, 
          { vehicle_type: vehicleType, status, location },
          { headers: { Authorization: `${token}` } }
        );
        onRiderUpdated(updatedRider.data);
      }
    } catch (error) {
      console.error('Error saving rider:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{dialogType === 'create' ? 'Register New Rider' : 'Edit Rider'}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Vehicle Type"
          fullWidth
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Status"
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Location"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="gray">Cancel</Button>
        <Button onClick={handleSave} color="primary">{dialogType === 'create' ? 'Register' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RiderDialog;
