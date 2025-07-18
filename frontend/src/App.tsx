import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchResults from './components/SearchResults';
import MovieDetail from './components/MovieDetail';
import TVDetail from './components/TVDetail';
import LastUpdated from './components/LastUpdated';
import DonatePage from './components/DonatePage';
import VersionPage from './components/VersionPage';
import AdminLogin from './components/AdminLogin';
import CustomCursor from './components/CustomCursor';
import NotFoundPage from './components/NotFoundPage';
import ScrollToTopButton from './components/ScrollToTop';
import Watchlist from './components/Watchlist';
import Vault from './components/Vault'

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is already authenticated
    const isAuthenticated = localStorage.getItem('lunastream-admin-auth') === 'true';
    setIsAdminAuthenticated(isAuthenticated);
  }, []);

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('lunastream-admin-auth');
    setIsAdminAuthenticated(false);
  };

  return (
    <Router>
      {/*<CustomCursor />*/}
      <ScrollToTopButton />
      {/* Define routes for the application */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/v" element={<VersionPage />} />
        <Route path="/last-updated" element={<LastUpdated />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/watchlist" element={<Watchlist />} /> {/* Redirects to /vault */}
        {/*<Route path="*" element={<NotFoundPage />} />*/}
      </Routes>
    </Router>
  );
}

export default App; 