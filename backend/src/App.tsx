import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel'

function App() {

  return (
    <Router>
      <Routes>
        <Route 
          path="/"
          element={
              <AdminPanel />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App; 