import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token'); // Check for token

  // If token exists, render the child components; otherwise, navigate to login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
