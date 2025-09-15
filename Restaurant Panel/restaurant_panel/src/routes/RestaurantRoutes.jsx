import React, { useState, useEffect } from 'react';
import { Outlet, Route, Routes, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import RestaurantManagementPage from '../pages/RestaurantManagementPage';
import OrderManagementPage from '../pages/OrderManagementPage';
import MenuManagementPage from '../pages/MenuManagementPage';
import ReviewPage from '../pages/ReviewPage';
import UserManagementPage from '../pages/UserManagementPage';
import Sidebar from '../components/Sidebar';
import SignIn from '../pages/SigninPage';

const RestaurantRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log("Token on the Restaurant Routes is : ", token);
    if (token) {
      // Validate token if needed, e.g., make an API call to verify
      setIsAuthenticated(true);
    }
  }, []);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/sign-in" />;
  };

  return (
    <Routes>
      <Route path='/sign-in' element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/restaurant/*" element={<PrivateRoute element={<div className="flex"><Sidebar /><main className="flex-1 p-6"><Outlet /></main></div>} />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="restaurants" element={<RestaurantManagementPage />} />
        <Route path="orders" element={<OrderManagementPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="users" element={<UserManagementPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/sign-in" />} />
    </Routes>
  );
};

export default RestaurantRoutes;
