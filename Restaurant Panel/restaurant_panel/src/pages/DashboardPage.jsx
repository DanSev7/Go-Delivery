import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoints.restaurants.dashboard);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Alert severity="error" sx={{ m: 3 }}>
      {error}
    </Alert>
  );

  // Handle new manager without restaurant
  if (dashboardData?.isNewManager) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome!</h1>
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome to the Restaurant Management Panel! Please create your restaurant profile to get started.
        </Alert>
        <div className="bg-white shadow-md rounded p-6">
          <p>You haven't set up your restaurant yet. Please go to Restaurant Management to create your restaurant profile.</p>
        </div>
      </div>
    );
  }

  const totalRevenue = parseFloat(dashboardData.totalRevenue) || 0;

  const ordersByMonthData = {
    labels: dashboardData.ordersByMonth.map((order) => order.day),
    datasets: [
      {
        label: 'Orders',
        data: dashboardData.ordersByMonth.map((order) => order.total_orders),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const popularFoodData = {
    labels: dashboardData.popularFood.map((item) => item.name),
    datasets: [
      {
        data: dashboardData.popularFood.map((item) => item.value),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Orders */}
        <div className="bg-white shadow-md rounded p-6 text-center">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold mt-2">{dashboardData.totalOrders}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white shadow-md rounded p-6 text-center">
          <h2 className="text-xl font-semibold">Pending Orders</h2>
          <p className="text-2xl font-bold mt-2">{dashboardData.pendingOrders}</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white shadow-md rounded p-6 text-center">
          <h2 className="text-xl font-semibold">Completed Orders</h2>
          <p className="text-2xl font-bold mt-2">{dashboardData.completedOrders}</p>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white shadow-md rounded p-6 text-center">
          <h2 className="text-xl font-semibold">Cancelled Orders</h2>
          <p className="text-2xl font-bold mt-2">{dashboardData.cancelledOrders}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white shadow-md rounded p-6 text-center">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Orders Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Orders Over Time</h2>
          <Line data={ordersByMonthData} options={{ responsive: true }} />
        </div>

        {/* User Distribution */}
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Food</h2>
          <Doughnut data={popularFoodData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
