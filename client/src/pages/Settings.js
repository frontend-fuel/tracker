import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    deviceId: '',
    channelId: '',
    apiKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user data
    const loadUserData = async () => {
      setLoading(true);
      try {
        await updateUser();
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [token, navigate, updateUser]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        email: user.email || '',
        deviceId: user.deviceName || '',
        channelId: user.deviceChannelId || '',
        apiKey: user.deviceApiKey || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setSuccess('Settings saved successfully!');
        await updateUser(); // Refresh user data
      } else {
        setError(result.error || 'Failed to save changes');
      }
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={handleBack} disabled={loading}>
          Back to Dashboard
        </button>
        <h1>User Settings</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <h2>User Information</h2>
          <div className="form-field">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled={true}
            />
          </div>
        </div>

        <div className="form-group">
          <h2>Device Settings</h2>
          <div className="form-field">
            <label>Device ID</label>
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              placeholder="Enter device ID"
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label>ThingSpeak Channel ID</label>
            <input
              type="text"
              name="channelId"
              value={formData.channelId}
              onChange={handleChange}
              placeholder="Enter ThingSpeak channel ID"
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label>ThingSpeak API Key</label>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Enter ThingSpeak API key"
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className={`save-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
