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
  TextField,
  Alert
} from '@mui/material';
import { Visibility as EyeIcon, Edit as EditIcon, Delete as TrashIcon, Add as AddIcon } from '@mui/icons-material';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false); // For Add/Edit dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For Delete Confirmation dialog
  const [openViewDialog, setOpenViewDialog] = useState(false); // For View details dialog
  const [currentCategory, setCurrentCategory] = useState(null); // Store category for view, edit, or delete
  const [formMode, setFormMode] = useState('add'); // To determine if form is for 'add' or 'edit'
  const [error, setError] = useState(null); // Store error messages
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image: ''
  });

  // Fetch categories on page load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/categories', {
          headers: { Authorization: `${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error fetching categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  const handleOpenFormDialog = (category = null) => {
    if (category) {
      setFormMode('edit');
      setCategoryForm(category);
    } else {
      setFormMode('add');
      setCategoryForm({
        name: '',
        image: ''
      });
    }
    setOpenFormDialog(true);
  };

  const handleOpenDeleteDialog = (category) => {
    setCurrentCategory(category); // Set category data for delete
    setOpenDeleteDialog(true);
  };

  const handleOpenViewDialog = (category) => {
    setCurrentCategory(category); // Set category data for viewing
    setOpenViewDialog(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/categories/${currentCategory.category_id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setCategories(categories.filter((category) => category.category_id !== currentCategory.category_id));
      setOpenDeleteDialog(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error deleting category. Please try again later.');
    }
  };

  const handleCloseDialog = () => {
    setOpenFormDialog(false);
    setOpenDeleteDialog(false);
    setOpenViewDialog(false); // Close the view dialog
    setCurrentCategory(null);
  };

  const handleFormChange = (e) => {
    setCategoryForm({
      ...categoryForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1]; // Extract base64 data
      setCategoryForm({
        ...categoryForm,
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
        await axios.put(`http://localhost:5000/api/categories/update/${categoryForm.category_id}`, categoryForm, {
          headers: { Authorization: `${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/api/categories', categoryForm, {
          headers: { Authorization: `${token}` },
        });
      }
      setOpenFormDialog(false);
      setCurrentCategory(null);
      // Fetch updated categories list after submitting
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Error saving category. Please try again later.');
    }
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Categories
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenFormDialog()}
        sx={{ marginBottom: 2 }}
      >
        Add Category
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Image</TableCell>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.category_id}>
                <TableCell align="center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={`data:image/png;base64,${category.image}`}
                    alt={`${category.name} image`}
                    style={{
                      width: 96,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: '20%',
                      boxShadow: '0 2px 5px rgba(0.6, 0.2, 0.2, 0.7)' // Add shadow here
                    }}
                  />
                </TableCell>
                <TableCell align="center">{category.name}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenViewDialog(category)} color="primary">
                    <EyeIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenFormDialog(category)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteDialog(category)} color="error">
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openFormDialog} onClose={handleCloseDialog}>
        <DialogTitle>{formMode === 'edit' ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={categoryForm.name}
              onChange={handleFormChange}
              fullWidth
              margin="dense"
              required
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                name="image"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {categoryForm.image && (
              <img
                src={`data:image/png;base64,${categoryForm.image}`}
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

      {/* View Category Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseDialog}>
        <DialogTitle>Category Details</DialogTitle>
        <DialogContent>
          {currentCategory && (
            <div>
              <img
                src={`data:image/png;base64,${currentCategory.image}`}
                alt={`${currentCategory.name} image`}
                style={{ width: '100%', height: 150, objectFit: 'cover' }}
              />
              <Typography variant="h6">{currentCategory.name}</Typography>
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
        <DialogTitle>Are you sure you want to delete this category?</DialogTitle>
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

export default CategoryManagementPage;
