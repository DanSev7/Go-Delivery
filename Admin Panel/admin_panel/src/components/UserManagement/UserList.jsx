import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

function UserList({ users, onEdit, onDelete }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Button onClick={() => onEdit(user)} variant="contained" color="secondary">Edit</Button>
              <Button onClick={() => onDelete(user.id)} variant="contained" color="error" style={{ marginLeft: '10px' }}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default UserList;
