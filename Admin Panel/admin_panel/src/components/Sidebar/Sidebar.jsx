import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Restaurant as RestaurantIcon, 
  // Menu as MenuIcon, 
  LocalDining as OrderIcon, 
  Category as CategoryIcon, 
  DeliveryDining as RiderIcon, 
  People as UserIcon,
  Person as PersonIcon 
} from '@mui/icons-material'; // Importing icons for User Management

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>
        <nav>
          <ul>
            <li className="mb-6">
              <Link to="/admin/dashboard" className="flex items-center text-white hover:bg-gray-700 p-2 rounded active:bg-gray-700">
                <HomeIcon className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/admin/restaurants" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <RestaurantIcon className="mr-3" />
                Restaurant Management
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/admin/orders" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <OrderIcon className="mr-3" />
                Order Management
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/admin/categories" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <CategoryIcon className="mr-3" />
                Category Management
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/admin/riders" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <RiderIcon className="mr-3" />
                Rider Management
              </Link>
            </li>
            {/* New User Management Section */}
            <li className="mb-6">
              <Link to="/admin/users" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <UserIcon className="mr-3" />
                User Management
              </Link>
            </li>
            {/* New User Management Section */}
            <li className="mb-6">
              <Link to="/admin/profile" className="flex items-center text-white hover:bg-gray-700 p-2 rounded">
                <PersonIcon className="mr-3" />
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
