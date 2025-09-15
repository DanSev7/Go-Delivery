import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RestaurantManagementPage from './pages/RestaurantManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import RiderManagementPage from './pages/RiderManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage'
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token if needed, e.g., make an API call to verify
      setIsAuthenticated(true);
    }
  }, []);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/sign-in" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/admin/*" element={<PrivateRoute element={<div className="flex"><Sidebar /><main className="flex-1 p-6"><Outlet /></main></div>} />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="restaurants" element={<RestaurantManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="riders" element={<RiderManagementPage />} />
          <Route path='users' element={<UserManagementPage/>}></Route>
          <Route path='profile' element={<ProfilePage/>}></Route>
        </Route>
        <Route path="/" element={<Navigate to="/sign-in" />} />
      </Routes>
    </Router>
  );
};

export default App;
