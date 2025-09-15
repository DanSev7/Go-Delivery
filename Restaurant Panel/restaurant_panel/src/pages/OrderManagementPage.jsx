import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  IconButton,
  Grid,
  Typography,
  Tooltip,
  DialogContentText
} from '@mui/material';
import axios from 'axios';
import { Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrderDetails, setViewOrderDetails] = useState(null);

  const token = localStorage.getItem('authToken');

  // Fetch Orders from API
  const fetchOrders = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurantId');
      console.log("Restaurant Id : ", restaurantId);
      const response = await axios.get(`http://localhost:5000/api/orders/restaurant/${restaurantId}`, {
        headers: { Authorization: `${token}` }
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, paymentFilter]);

  const filterOrders = () => {
    let filtered = [...orders];
    if (statusFilter) {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }
    if (paymentFilter) {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }
    setFilteredOrders(filtered);
  };

  const handleViewOrderClick = (order) => {
    setViewOrderDetails(order);
  };

  const handleDeleteOrderClick = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setViewOrderDetails(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { order_status: newStatus }, 
        {
          headers: { Authorization: `${token}` }
        }
      );  
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${selectedOrder.id}`, {
        headers: { Authorization: `${token}` }
      });
      handleDialogClose();
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <Grid container spacing={3} sx={{ padding: 4 }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Order Management
        </Typography>
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              label="Filter by Order Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="on_the_way">On The Way</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              label="Filter by Payment Status"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer ID</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>Order Status</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell>{order.order_id}</TableCell>
                    <TableCell>{order.customer_id}</TableCell>
                    <TableCell>{order.total_price}</TableCell>
                    <TableCell>
                      <Select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        // fullWidth
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{order.payment_status}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewOrderClick(order)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Order">
                        <IconButton onClick={() => handleDeleteOrderClick(order)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* View Order Details Dialog */}
      <Dialog open={!!viewOrderDetails} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {viewOrderDetails && (
            <>
              <Typography variant="h6">Order ID: {viewOrderDetails.order_id}</Typography>
              <Typography>Customer ID: {viewOrderDetails.customer_id}</Typography>
              <Typography>Total Price: ${viewOrderDetails.total_price}</Typography>
              <Typography>Order Status: {viewOrderDetails.order_status}</Typography>
              <Typography>Payment Status: {viewOrderDetails.payment_status}</Typography>
              <Typography>Delivery Address: {viewOrderDetails.delivery_address}</Typography>
              <Typography>Delivery Fee: ${viewOrderDetails.delivery_fee}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteOrder} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default OrderManagementPage;
