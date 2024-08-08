import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  // Implement your authentication logic here
  return localStorage.getItem('token');
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
