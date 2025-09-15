import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, Typography } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import axios from 'axios';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('view');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    availability_status: '',
    imageFile: null,
    imagePreview: '',
  });
  const [imagePreview, setImagePreview] = useState(''); // For displaying image preview
  const token = localStorage.getItem('authToken');
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurantId');
      console.log("Restaurant Id on menuManagement : ", restaurantId)
      const response = await axios.get(`http://localhost:5000/api/menu-items/restaurants/${restaurantId}`, {
        headers: {Authorization: `${token}`}
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleDialogOpen = (type, item = null) => {
    setDialogType(type);
    setSelectedMenuItem(item);
    setFormValues(item || {
      name: '',
      price: '',
      description: '',
      image: '',
      category: '',
      availability_status: '',
      imageFile: null,
      imagePreview: '',
    });
    setImagePreview(item ? item.image : ''); // Set image preview if editing/viewing an item
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload and generate base64 preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the base64 image preview
        setFormValues(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result // Store the base64 string in formValues
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async () => {
    const restaurantId = localStorage.getItem('restaurantId');
    let base64Image = formValues.imagePreview.split(',')[1]; // Extract base64 data

    const requestData = {
      name: formValues.name,
      price: formValues.price,
      description: formValues.description,
      image: base64Image,
      category: formValues.category,
      availability_status: formValues.availability_status,
    };

    try {
      console.log("Token when creating menuItems: ", token);

      if (dialogType === 'add') {
          await axios.post(`http://localhost:5000/api/menu-items/${restaurantId}`, requestData, {
              headers: {
                  Authorization: token  // Directly include the token
              }
          });
      } else if (dialogType === 'edit') {
          await axios.put(`http://localhost:5000/api/menu-items/${selectedMenuItem.menu_item_id}`, formValues, {
              headers: {
                  Authorization: token  // Directly include the token
              }
          });
      }
      fetchMenuItems();
      handleDialogClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/menu-items/${selectedMenuItem.menu_item_id}`, {
        headers: {Authorization: token}
      });
      fetchMenuItems();
      handleDialogClose();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5">Menu Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleDialogOpen('add')}>
          Add Menu Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {menuItems.map(item => (
    <div key={item.menu_item_id} className="p-4 border rounded shadow-sm">
        <Typography variant="h6">{item.name}</Typography>
        <div className="flex items-center mt-2">
            <img src={`data:image/jpeg;base64,${item.image}`} alt={item.name} className="w-20 h-20 object-cover" />
            <p className="font-bold text-lg ml-4">{item.price} Birr</p> {/* Side by side with the image */}
        </div>
        <p>{item.description}</p>
        <div className="flex justify-end space-x-2">
            <IconButton onClick={() => handleDialogOpen('view', item)}><Visibility /></IconButton>
            <IconButton onClick={() => handleDialogOpen('edit', item)}><Edit /></IconButton>
            <IconButton onClick={() => handleDialogOpen('delete', item)}><Delete /></IconButton>
        </div>
    </div>
))}
      </div>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'add' ? 'Add Menu Item' : dialogType === 'edit' ? 'Edit Menu Item' : dialogType === 'view' ? 'View Menu Item' : 'Delete Menu Item'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'view' ? (
            <div>
              <Typography variant="h6">{formValues.name}</Typography>
              <img src={`data:image/jpeg;base64,${formValues.image}`} alt={formValues.name} className="w-32 h-32 object-cover mt-2" /> {/* Image in dialog */}
              <p>{formValues.description}</p>
              <p>Price: {formValues.price}</p>
              <p>Category: {formValues.category}</p>
              <p>Status: {formValues.availability_status}</p>
            </div>
          ) : dialogType === 'delete' ? (
            <Typography>Are you sure you want to delete this menu item?</Typography>
          ) : (
            <div className="space-y-4">
              <TextField label="Name" name="name" value={formValues.name} onChange={handleFormChange} fullWidth />
              <TextField label="Price" name="price" value={formValues.price} onChange={handleFormChange} fullWidth />
              <TextField label="Description" name="description" value={formValues.description} onChange={handleFormChange} fullWidth multiline />
              
              {/* Image upload and preview */}
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover mt-2" />
              )}

              <TextField label="Category" name="category" value={formValues.category} onChange={handleFormChange} fullWidth />
              <TextField label="Availability Status" name="availability_status" value={formValues.availability_status} onChange={handleFormChange} fullWidth />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          {dialogType === 'delete' ? (
            <Button onClick={handleDelete} color="error">Delete</Button>
          ) : dialogType !== 'view' && (
            <Button onClick={handleFormSubmit} color="primary">{dialogType === 'add' ? 'Add' : 'Update'}</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
