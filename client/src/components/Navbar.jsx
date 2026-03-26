import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { api } from '../api/axios';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = async (userId) => {
    try {
      const res = await api.get(`/api/notifications/mine/${userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchNotifications(parsedUser._id);
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  };

  // Hide the Navbar entirely on public routes like Login and Landing page
  if (!user || location.pathname === '/auth' || location.pathname === '/') return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: '#1f2937',
      borderBottom: '1px solid #374151'
    }}>
      <h2 style={{ color: '#60a5fa', margin: 0, fontSize: '1.5rem' }}>BCA Books</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/home" style={{ color: '#e5e7eb', textDecoration: 'none' }}>Home</Link>
        <Link to="/add-book" style={{ color: '#e5e7eb', textDecoration: 'none' }}>Sell Book</Link>
        
        {/* Notification Bell */}
        <div ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer', marginLeft: '0.5rem' }}>
          <div onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: '#ef4444', color: 'white', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          
          {/* Notifications Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '40px', width: '300px',
              background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
            }}>
              <h4 style={{ margin: 0, padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ padding: '1rem', color: '#6b7280', margin: 0, textAlign: 'center' }}>No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n._id} 
                    onClick={() => !n.isRead && handleRead(n._id)}
                    style={{
                      padding: '1rem', borderBottom: '1px solid #f3f4f6',
                      background: n.isRead ? 'white' : '#eff6ff',
                      cursor: n.isRead ? 'default' : 'pointer'
                    }}
                  >
                    <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem' }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Icon -> Dashboard */}
        <Link 
          to="/dashboard" 
          title="User Dashboard"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: '#3b82f6', 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            marginLeft: '1rem'
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
