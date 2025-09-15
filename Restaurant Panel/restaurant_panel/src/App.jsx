import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RestaurantRoutes from './routes/RestaurantRoutes';
// import './styles/tailwind.css'; // Import Tailwind CSS

const App = () => (
  <Router>
    <RestaurantRoutes />
  </Router>
);

export default App;
