import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Rules from './pages/Rules';
import HowItWorks from './pages/HowItWorks';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#0b0a08', color: '#fff' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;