import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Settings as SettingsIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapExpanded, setIsMapExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [lastUpdate, setLastUpdate] = React.useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleBuzzer = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(
        'http://localhost:5000/api/devices/buzzer',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Buzzer activated!');
    } catch (error) {
      console.error('Error activating buzzer:', error);
      setError('Failed to activate buzzer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      }).addTo(mapInstanceRef.current);
    }

    const updateLocation = async () => {
      setLoading(true);
      setError('');
      try {
        if (!user?.deviceChannelId || !user?.deviceApiKey) {
          setError('Device not configured. Please check your settings.');
          return;
        }

        const url = `https://api.thingspeak.com/channels/${user.deviceChannelId}/feeds.json?api_key=${user.deviceApiKey}&results=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.feeds && data.feeds.length > 0) {
          const latestEntry = data.feeds[0];
          const lat = parseFloat(latestEntry.field1);
          const lon = parseFloat(latestEntry.field2);

          if (!isNaN(lat) && !isNaN(lon)) {
            mapInstanceRef.current.setView([lat, lon], 15);
            if (markerRef.current) {
              markerRef.current.remove();
            }
            markerRef.current = L.marker([lat, lon])
              .addTo(mapInstanceRef.current)
              .bindPopup("Spectacles Location")
              .openPopup();
            setLastUpdate(new Date().toLocaleTimeString());
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        setError('Failed to update location. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 10000);

    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [token, user]);

  return (
    <div className="dashboard-container">
      <div className="top-nav">
        <h1>Live GPS Location of Spectacles</h1>
        <div className="nav-right">
          <button className="username-btn" onClick={handleSettings}>
            {user?.name || 'User'}
            <SettingsIcon className="settings-icon" />
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className={`map-container ${isMapExpanded ? 'expanded' : ''}`}>
        <div className="map-container-header" onClick={() => setIsMapExpanded(!isMapExpanded)}>
          Location of Spectacles
          <div className="map-info">
            {lastUpdate && <span>Last updated: {lastUpdate}</span>}
            <ExpandMoreIcon className="expand-icon" />
          </div>
        </div>
        <div ref={mapRef} className="map" />
      </div>
      <button 
        className={`find-btn ${loading ? 'loading' : ''}`} 
        onClick={handleBuzzer} 
        disabled={loading}
      >
        {loading ? 'Activating...' : 'Find Spectacles'}
      </button>
    </div>
  );
};

export default Dashboard;
