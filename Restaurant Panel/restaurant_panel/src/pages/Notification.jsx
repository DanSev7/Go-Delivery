import React from 'react';

const Notification = ({ message, type }) => {
  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white'
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded shadow-md ${styles[type]}`}
      style={{ display: message ? 'block' : 'none' }}
    >
      {message}
    </div>
  );
};

export default Notification;
