// Navbar.jsx
import './Navbar.css';

function Navbar({ activeTab, onTabChange, onLogout, user }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>DL Model Builder</h2>
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

          {/* New About Button Added Here */}
          <button 
            className={`nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => onTabChange('about')}
          >
            About
          </button>

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onTabChange('settings')}
          >
            User Settings
          </button>
        </div>

        <div className="navbar-user">
          {/* Added safety check for user name */}
          <span className="user-name">{user?.name || 'User'}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;