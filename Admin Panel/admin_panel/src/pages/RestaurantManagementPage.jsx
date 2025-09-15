import React from 'react';
import RestaurantList from '../components/RestaurantManagement/RestauranList';
import { Route, Routes } from 'react-router-dom';

const RestaurantManagementPage = () => {
  return (
    <Routes>
      <Route path="/" element={<RestaurantList />} />
    </Routes>


  );
};

export default RestaurantManagementPage;
