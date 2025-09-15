// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   IconButton,
//   Typography,
// } from '@mui/material';
// import { Close as CloseIcon } from '@mui/icons-material';
// import axios from 'axios';

// const CategoryDialog = ({ open, onClose, dialogType, category, onCategoryUpdated }) => {
//   const [name, setName] = useState('');
//   const [image, setImage] = useState(null);
//   const [imageFile, setImageFile] = useState(null); // Store the file to send to the server

//   useEffect(() => {
//     if (dialogType === 'update' && category) {
//       setName(category.name);
//       setImage(category.image);
//     } else if (dialogType === 'view' && category) {
//       setName(category.name);
//       setImage(category.image);
//     } else {
//       setName('');
//       setImage(null);
//     }
//   }, [dialogType, category]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file); // Save the file for upload

//       // Read the image file as Base64
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const base64Image = reader.result; // Full Base64 string including metadata
//         setImage(base64Image); // Set base64Image to render it instantly
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async () => {
//     const categoryData = { name, image };
//     try {
//       let response;

//       if (dialogType === 'create') {
//         // Create new category
//         const formData = new FormData();
//         formData.append('name', name);
//         console.log("Name  : ", name);
//         if (imageFile) {
//           formData.append('image', imageFile); // Send file as multipart/form-data
//         }
//         response = await axios.post('http://localhost:5000/api/categories', formData);
//       } else if (dialogType === 'update') {
//         // Update existing category
//         const formData = new FormData();
//         formData.append('name', name);
//         if (imageFile) {
//           formData.append('image', imageFile);
//         }
//         response = await axios.put(
//           `http://localhost:5000/api/categories/update/${category.category_id}`,formData);
//       }

//       onCategoryUpdated(response.data); // Immediately add the updated/created category to the list
//     } catch (error) {
//       console.error('Error saving category:', error);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle sx={{ textAlign: 'center' }}>
//         {dialogType === 'create'
//           ? 'Create Category'
//           : dialogType === 'update'
//           ? 'Update Category'
//           : 'View Category'}
//         <IconButton
//           edge="end"
//           color="inherit"
//           onClick={onClose}
//           aria-label="close"
//           sx={{ position: 'absolute', right: 8, top: 8 }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
//       <DialogContent sx={{ textAlign: 'center', paddingBottom: 0 }}>
//         {dialogType === 'view' && (
//           <>
//             <Typography variant="h6" sx={{ marginBottom: 2 }}>
//               {name}
//             </Typography>
//             {image && (
//               <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
//                 <img
//                   src={image} // Use the locally processed base64 image
//                   alt={name}
//                   style={{ width: '40%', height: 'auto', objectFit: 'cover' }}
//                 />
//               </div>
//             )}
//           </>
//         )}
//         {dialogType !== 'view' && (
//           <>
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Category Name"
//               type="text"
//               fullWidth
//               variant="outlined"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               disabled={dialogType === 'view'}
//             />
//             <input
//               accept="image/*"
//               id="image-upload"
//               type="file"
//               style={{ display: 'none' }}
//               onChange={handleImageChange}
//               disabled={dialogType === 'view'}
//             />
//             <label htmlFor="image-upload">
//               <Button
//                 variant="contained"
//                 color="primary"
//                 component="span"
//                 disabled={dialogType === 'view'}
//               >
//                 Upload Image
//               </Button>
//             </label>
//             {image && (
//               <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
//                 <img
//                   src={image} // Display the uploaded image
//                   alt="Category"
//                   style={{ width: '100%', height: 'auto' }}
//                 />
//               </div>
//             )}
//           </>
//         )}
//       </DialogContent>
//       {dialogType !== 'view' && (
//         <DialogActions>
//           <Button onClick={onClose} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} color="primary">
//             {dialogType === 'create' ? 'Create' : 'Update'}
//           </Button>
//         </DialogActions>
//       )}
//     </Dialog>
//   );
// };

// export default CategoryDialog;
