import React, { useState, useEffect } from 'react';
import api, { endpoints } from '../config/api';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Typography,
} from '@mui/material';
import { Visibility, Edit, Delete, VisibilityOff } from '@mui/icons-material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'restaurant_manager',
    phone_number: '',
    address: '',
    profile_picture: '',
    comments: '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(endpoints.admin.users);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewUser((prev) => ({ ...prev, profile_picture: reader.result }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post(endpoints.auth.register, newUser);
      fetchUsers();
      setDialogOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'restaurant_manager',
        phone_number: '',
        address: '',
        profile_picture: '',
        comments: '',
      });
    } catch (error) {
      console.error('Error registering user: ', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const userId = selectedUser.user_id;
      await api.put(endpoints.auth.updateProfile(userId), newUser);
      fetchUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user: ', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!userId) {
      console.error("No user selected for deletion");
      return;
    }

    try {
      const response = await api.delete(endpoints.admin.deleteUser(userId));
      
      if (response.status === 200) {
        setUsers(users.filter((user) => user.user_id !== userId));
        setDeleteDialogOpen(false);
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const openViewDialog = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setNewUser(user);
    setEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      {/* Register User Button */}
      <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
        Register User
      </Button>

      {/* Register User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Register New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={newUser.phone_number}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={newUser.address}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="border rounded w-full py-2 px-3"
              >
                <option value="restaurant_manager">Restaurant Manager</option>
                <option value="rider">Rider</option>
                <option value="customer">Customer</option>
              </select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Profile Picture</label>
              <input type="file" onChange={handleFileChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                name="comments"
                value={newUser.comments}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRegister} color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Filter */}
      <div className="mb-4">
        <label className="mr-4">Filter by Role: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="restaurant_manager">Restaurant Manager</option>
          <option value="rider">Rider</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* User Table */}
      <table className="table-auto w-full text-left bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.user_id} className="border-t">
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">
                <IconButton onClick={() => openViewDialog(user)}>
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => openEditDialog(user)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}>
                  <Delete />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Name:</Typography>
                <Typography variant="body1">{selectedUser.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Email:</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Phone Number:</Typography>
                <Typography variant="body1">{selectedUser.phone_number}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Address:</Typography>
                <Typography variant="body1">{selectedUser.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Role:</Typography>
                <Typography variant="body1">{selectedUser.role}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Password:</Typography>
                <Typography variant="body1">{showPassword ? selectedUser.password : '********'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <img src={selectedUser.profile_picture} alt="Profile" width="100" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Comments:</Typography>
                <Typography variant="body1">{selectedUser.comments}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} color="primary">
            Close
          </Button>
          <FormControlLabel
            control={
              <Switch checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
            }
            label="Show Password"
          />
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={newUser.phone_number}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={newUser.address}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Grid>
            <Grid item xs={12} sm={6}>
              <label>Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="border rounded w-full py-2 px-3"
              >
                <option value="restaurant_manager">Restaurant Manager</option>
                <option value="rider">Rider</option>
                <option value="customer">Customer</option>
              </select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                name="comments"
                value={newUser.comments}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this user?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            No
          </Button>
          <Button onClick={() => handleDelete(selectedUser?.user_id)} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;