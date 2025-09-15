// import React, { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
// } from '@mui/material';
// import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

// const CategoryList = ({ categories, onEdit, onDelete, onView }) => {
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
//   const [categoryToDelete, setCategoryToDelete] = useState(null);

//   const handleDeleteClick = (category) => {
//     setCategoryToDelete(category);
//     setOpenConfirmDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (categoryToDelete) {
//       await onDelete(categoryToDelete.category_id);
//       setCategoryToDelete(null);
//       setOpenConfirmDialog(false);
//     }
//   };

//   const handleCancelDelete = () => {
//     setCategoryToDelete(null);
//     setOpenConfirmDialog(false);
//   };

//   const getImageSrc = (image) => {
//     if (!image) return ''; // Return empty string if no image
//     if (image.startsWith('data:image')) {
//       return image;
//     }
//     return `data:image/jpeg;base64,${image}`;
//   };

//   return (
//     <>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell align="center">Image</TableCell>
//               <TableCell align="center">Name</TableCell>
//               <TableCell align="center">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {categories.map((category) => (
//               <TableRow key={category.category_id}>
//                 <TableCell
//                   align="center"
//                   style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
//                 >
//                   <img
//                     src={getImageSrc(category.image)}
//                     alt={category.name}
//                     style={{
//                       width: 96,
//                       height: 72,
//                       objectFit: 'cover',
//                       borderRadius: '20%',
//                       boxShadow: '0 2px 5px rgba(0.6, 0.2, 0.2, 0.7)',
//                     }}
//                   />
//                 </TableCell>
//                 <TableCell align="center">{category.name}</TableCell>
//                 <TableCell align="center">
//                   <IconButton onClick={() => onView(category)} color="default">
//                     <VisibilityIcon />
//                   </IconButton>
//                   <IconButton onClick={() => onEdit(category)} color="primary">
//                     <EditIcon />
//                   </IconButton>
//                   <IconButton onClick={() => handleDeleteClick(category)} color="error">
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Confirmation Dialog */}
//       <Dialog open={openConfirmDialog} onClose={handleCancelDelete} fullWidth maxWidth="xs">
//         <DialogTitle>Confirm Deletion</DialogTitle>
//         <DialogContent>
//           <Typography variant="body1">
//             Are you sure you want to delete this category?
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCancelDelete} color="primary">
//             No
//           </Button>
//           <Button onClick={handleConfirmDelete} color="error">
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default CategoryList;
