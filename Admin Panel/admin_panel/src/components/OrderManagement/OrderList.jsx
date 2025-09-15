import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, MenuItem, Select, Alert
} from '@mui/material';
import { Edit as EditIcon, Visibility as EyeIcon } from '@mui/icons-material';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // For viewing order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState(''); // For filtering orders by status
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log("Token : ", token);
        const response = await axios.get('http://localhost:5000/api/orders', {
          headers: {
            Authorization: `${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
      }
    };

    fetchOrders();
  }, []);

  // Handle filtering orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus === '') return true;
    return order.order_status === filterStatus;
  });

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setOpenDialog(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { order_status: newStatus },
        {
          headers: { Authorization: `${token}` }
        }
      );
      setOrders(orders.map(order => order.order_id === orderId ? response.data : order));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Error updating order status. Please try again later.');
    }
  };    

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Order Management
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Filter Orders */}
      <Select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        displayEmpty
        sx={{ mb: 2 }}
      >
        <MenuItem value="">All Orders</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="delivered">Delivered</MenuItem>
        <MenuItem value="cancelled  ">Cancelled</MenuItem>
      </Select>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Order ID</TableCell>
              <TableCell align="center">Customer ID</TableCell>
              <TableCell align="center">Restaurant ID</TableCell>
              <TableCell align="center">Rider ID </TableCell> {/* Display the assigned rider */}
              <TableCell align="center">Total Price</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell align="center">{order.order_id}</TableCell>
                <TableCell align="center">{order.customer_id}</TableCell>
                <TableCell align="center">{order.restaurant_id}</TableCell>
                <TableCell align="center">
                  {order.rider_id ? order.rider_id : 'Not Assigned'} {/* Display rider ID */}
                </TableCell>
                <TableCell align="center">$ {order.total_price}</TableCell>
                {/* <TableCell align="center">{order.rider_id}</TableCell> */}
                <TableCell align="center">
                  <Select
                    value={order.order_status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
                
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDialog(order)}>
                    <EyeIcon />
                  </IconButton>
                  {/* <IconButton onClick={() => handleStatusChange(order.order_id, 'delivered')}>
                    <EditIcon />
                  </IconButton> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={openDialog} onClose={handleCloseDialog}   sx={{ '& .MuiDialog-paper': { 
      width: '400px', 
      display: 'flex', 
      justifyContent: 'center', // Centers content horizontally
      alignItems: 'center', // Centers content vertically
      textAlign: 'center', // Ensures the text is centered inside
    } }} // Set the width here
>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            <Typography>Order ID: {selectedOrder.order_id}</Typography>
            <Typography>Customer ID: {selectedOrder.customer_id}</Typography>
            <Typography>Restaurant ID: {selectedOrder.restaurant_id}</Typography>
            <Typography>Rider: {selectedOrder.rider_id || 'Not Assigned'}</Typography>
            <Typography>Total Price: ${selectedOrder.total_price}</Typography>
            <Typography>Order Status: {selectedOrder.order_status}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default OrderManagement;
