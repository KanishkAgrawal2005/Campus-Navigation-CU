import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AdminPanel from './components/AdminPanel'
import MapPage from './components/MapPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">Campus Navigation</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Map</Link>
              <Link to="/admin" className="nav-link">Admin Panel</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

