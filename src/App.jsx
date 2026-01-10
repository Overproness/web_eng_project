// src/App.jsx

import { useEffect, useState } from "react";
import "./App.css";
import About from "./components/About";
import BuildModels from "./components/BuildModels";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import UserSettings from "./components/UserSettings";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setActiveTab("home");
  };

  const handleTabChange = (tab) => {
    // If trying to access settings without being logged in, show login modal
    if (tab === "settings" && !user) {
      setAuthMode("login");
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleShowLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleShowSignup = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Main application layout - accessible to everyone
  return (
    <>
      <div className="app-wrapper">
        <Navbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          onShowLogin={handleShowLogin}
          onShowSignup={handleShowSignup}
          user={user}
        />
        <main className="main-content">
          {activeTab === "home" && <Home onTabChange={handleTabChange} />}
          {activeTab === "build" && (
            <BuildModels user={user} onShowLogin={handleShowLogin} />
          )}
          {activeTab === "about" && <About onTabChange={handleTabChange} />}
          {activeTab === "settings" && user && <UserSettings user={user} />}
        </main>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={handleCloseAuthModal}>
          <div
            className="auth-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="auth-modal-close" onClick={handleCloseAuthModal}>
              ×
            </button>
            {authMode === "login" ? (
              <Login
                onSwitchToSignup={() => setAuthMode("signup")}
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <Signup
                onSwitchToLogin={() => setAuthMode("login")}
                onSignupSuccess={handleSignupSuccess}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
