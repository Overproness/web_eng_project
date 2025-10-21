import { useState } from 'react';
import './Navbar.css';

function Navbar({ activeTab, onTabChange, onLogout, user }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Layr</h2>
        </div>
        
        <div className="navbar-menu">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => onTabChange('home')}
          >
            Home
          </button>
          <button 
            className={`nav-item ${activeTab === 'build' ? 'active' : ''}`}
            onClick={() => onTabChange('build')}
          >
            Build Models
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onTabChange('settings')}
          >
            User Settings
          </button>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user.name}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
