

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import UserDashboard from './components/UserDashboard';
import DashboardPage from './components/DashboardPage';
import MapPage from './components/map/map';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  );
}

export default App;
