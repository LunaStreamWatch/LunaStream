import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to Vault since we've combined them
const Watchlist: React.FC = () => {
  return <Navigate to="/vault" replace />;
};

export default Watchlist;
