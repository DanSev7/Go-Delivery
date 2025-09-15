import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OrderList from '../components/OrderManagement/OrderList';

const OrderManagementPage = () => {
  return (
    <Routes>
      <Route path="/" element={<OrderList />} />
    </Routes>


  );
};

export default OrderManagementPage;
