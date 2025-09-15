import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Paper } from '@mui/material';
import RiderList from '../components/RiderManagement/RiderList';
import RiderDialog from '../components/RiderManagement/RiderDialog';
import RiderDetail from '../components/RiderManagement/RiderDetail'; // Import the RiderDetail component

function RiderManagementPage() {
  const [riders, setRiders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'create' or 'update'
  const [selectedRider, setSelectedRider] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false); // New state for detail dialog
  
  const token = localStorage.getItem('authToken');

  // Fetch all riders on load
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/riders/all-riders', {
          headers: {
            Authorization: `${token}`,
          },
        });
        setRiders(response.data);
      } catch (error) {
        console.error('Error fetching riders:', error);
      }
    };

    fetchRiders();
  }, [token]);

  const handleOpenDialog = (type, rider) => {
    setDialogType(type);
    setSelectedRider(rider);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRider(null);
  };

  const handleRiderUpdated = (updatedRider) => {
    if (dialogType === 'create') {
      setRiders([...riders, updatedRider]);
    } else if (dialogType === 'update') {
      setRiders(riders.map(r => r.rider_id === updatedRider.rider_id ? updatedRider : r));
    }
    handleCloseDialog();
  };

  const handleDeleteRider = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/riders/${id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setRiders(riders.filter(r => r.rider_id !== id));
    } catch (error) {
      console.error('Error deleting rider:', error);
    }
  };

  const handleViewRider = (rider) => {
    setSelectedRider(rider);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedRider(null);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Rider Management</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog('create')}
      >
        Register New Rider
      </Button>
      <Paper style={{ padding: 16, marginTop: 16 }}>
        <RiderList
          riders={riders}
          onEdit={(rider) => handleOpenDialog('update', rider)}
          onDelete={handleDeleteRider}
          onView={handleViewRider} // Pass onView prop
        />
      </Paper>
      <RiderDialog
        open={openDialog}
        onClose={handleCloseDialog}
        dialogType={dialogType}
        rider={selectedRider}
        onRiderUpdated={handleRiderUpdated}
      />
      <RiderDetail
        riderId={selectedRider ? selectedRider.rider_id : null}
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
      />
    </Container>
  );
}

export default RiderManagementPage;
