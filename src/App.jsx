import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Navbar from './components/Navbar'
import Home from './components/Home'
import BuildModels from './components/BuildModels'
import UserSettings from './components/UserSettings'
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    // Check if user is already logged in
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
          {activeTab === 'home' && <Home />}
          {activeTab === 'build' && <BuildModels />}
          {activeTab === 'settings' && <UserSettings user={user} />}
        </main>
      </div>
    )
  }

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
