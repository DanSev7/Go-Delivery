import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Restaurant as RestaurantIcon, LocalDining as OrderIcon, Menu as MenuIcon, RateReview as ReviewIcon, Person as UserIcon } from '@mui/icons-material';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-10">Restaurant Panel</h1>
        <nav>
          <ul>
            <li className="mb-6">
              <Link to="/restaurant/dashboard" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <HomeIcon className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/restaurant/restaurants" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <RestaurantIcon className="mr-3" />
                Restaurant Management
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/restaurant/orders" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <OrderIcon className="mr-3" />
                Order Management
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/restaurant/menu" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <MenuIcon className="mr-3" />
                Menu Management
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/restaurant/reviews" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <ReviewIcon className="mr-3" />
                Review
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/restaurant/users" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <UserIcon className="mr-3" />
                Profile Management
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
