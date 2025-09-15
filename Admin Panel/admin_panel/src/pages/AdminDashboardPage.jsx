import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import api, { endpoints } from '../config/api';
import { CircularProgress, Alert, Box } from '@mui/material';

// Registering Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRestaurants: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch statistics from backend
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoints.admin.stats);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Failed to load dashboard statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const orderData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Orders',
        data: [12, 19, 3, 5, 2, 3, 7], // Example data
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const userData = {
    labels: ['Admin', 'Customer', 'Restaurant Manager', 'Rider'],
    datasets: [
      {
        data: [5, 50, 10, 8], // Example data
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow-md rounded p-6 text-center">
              <h2 className="text-xl font-semibold">Total Orders</h2>
              <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-white shadow-md rounded p-6 text-center">
              <h2 className="text-xl font-semibold">Total Users</h2>
              <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white shadow-md rounded p-6 text-center">
              <h2 className="text-xl font-semibold">Total Restaurants</h2>
              <p className="text-2xl font-bold mt-2">{stats.totalRestaurants}</p>
            </div>
            <div className="bg-white shadow-md rounded p-6 text-center">
              <h2 className="text-xl font-semibold">Total Categories</h2>
              <p className="text-2xl font-bold mt-2">{stats.totalCategories}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded p-6">
              <h2 className="text-xl font-semibold mb-4">Orders Over Time</h2>
              <Line data={orderData} options={{ responsive: true }} />
            </div>
            <div className="bg-white shadow-md rounded p-6">
              <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
              <Doughnut data={userData} options={{ responsive: true }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
