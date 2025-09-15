// src/components/SidebarItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors duration-200 ${active ? 'bg-gray-300 text-gray-900' : ''}`}
    >
      <div className="mr-3">{icon}</div>
      <span className="text-lg">{label}</span>
    </Link>
  );
};

export default SidebarItem;
