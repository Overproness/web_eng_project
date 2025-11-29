// src/App.jsx

import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Navbar from './components/Navbar'
import Home from './components/Home'
import BuildModels from './components/BuildModels'
import UserSettings from './components/UserSettings'
import About from './components/About' // 1. Imported the new About page
import './App.css'


function App() {
  const [showLogin, setShowLogin] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('home') // Initial active tab

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setActiveTab('home')
  }

  const handleSignupSuccess = (userData) => {
    setUser(userData)
    setActiveTab('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setActiveTab('home')
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // --- RENDERING LOGIC ---

  // Renders the main application if the user is logged in
  if (user) {
    return (
      <div className="app-wrapper">
        <Navbar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onLogout={handleLogout}
          user={user}
        />
        <main className="main-content">
          {/* Renders the component based on the activeTab state */}
          {activeTab === 'home' && <Home />}
          {activeTab === 'build' && <BuildModels />}
          {activeTab === 'about' && <About />} {/* 2. Added the About page rendering */}
          {activeTab === 'settings' && <UserSettings user={user} />}
        </main>
      </div>
    )
  }

  // Renders the Login or Signup forms if the user is NOT logged in
  return (
    <>
      {showLogin ? (
        <Login
          onSwitchToSignup={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Signup
          onSwitchToLogin={() => setShowLogin(true)}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
    </>
  )
}

export default App