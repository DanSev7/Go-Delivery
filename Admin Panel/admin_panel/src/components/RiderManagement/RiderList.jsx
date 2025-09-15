import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

function RiderList({ riders, onEdit, onDelete, onView }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Rider ID</TableCell>
          <TableCell>Vehicle Type</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Location</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {riders.map((rider) => (
          <TableRow key={rider.rider_id}>
            <TableCell>{rider.rider_id}</TableCell>
            <TableCell>{rider.vehicle_type}</TableCell>
            <TableCell>{rider.status}</TableCell>
            <TableCell>{rider.location}</TableCell>
            <TableCell align="center">
              <IconButton onClick={() => onView(rider)} color="primary">
                <VisibilityIcon />
              </IconButton>
              <IconButton onClick={() => onEdit(rider)} color="secondary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(rider.rider_id)} color="error">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default RiderList;
