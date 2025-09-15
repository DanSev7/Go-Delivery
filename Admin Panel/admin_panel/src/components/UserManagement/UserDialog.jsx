import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import api, { endpoints } from '../../config/api';

function UserDialog({ open, onClose, dialogType, user, onUserUpdated }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setRole(user.role);
    } else {
      setEmail('');
      setRole('');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (dialogType === 'create') {
        const newUser = await api.post('/users', { email, role });
        onUserUpdated(newUser.data);
      } else {
        const updatedUser = await api.put(`/users/${user.id}`, { email, role });
        onUserUpdated(updatedUser.data);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{dialogType === 'create' ? 'Register New User' : 'Edit User'}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Role"
          fullWidth
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary">{dialogType === 'create' ? 'Register' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserDialog;
