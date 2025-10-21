import { useState } from 'react';
import './UserSettings.css';

function UserSettings({ user }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add update logic here
    console.log('Update settings:', formData);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>User Settings</h1>
        <p>Manage your account preferences and security</p>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h2>Profile Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group-settings">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group-settings">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="divider-settings"></div>

            <h3>Change Password</h3>

            <div className="form-group-settings">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group-settings">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group-settings">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className="save-button">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
