import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';
import { api } from '../api/axios';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

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

  // Hide the Navbar entirely on public routes like Login and Landing page
  if (!user || location.pathname === '/auth' || location.pathname === '/') return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        background: 'var(--bg-card)',
        borderRadius: '9999px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        width: '100%',
        maxWidth: '1200px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.4rem', 
          fontWeight: '800',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          BCA Books.
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/home" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem' }}>Dashboard</Link>
          <Link to="/add-book" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem' }}>Sell Book</Link>
          <Link to="/chat" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', fontSize: '1.05rem' }}>Messages</Link>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'var(--input-bg)',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={theme === 'light-theme' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light-theme' ? '🌙' : '☀️'}
          </button>

          {/* Notification Bell */}
          <div ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer' }}>
            <div onClick={() => setShowDropdown(!showDropdown)} style={{ 
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--input-bg)', padding: '0.5rem', borderRadius: '50%',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  background: '#EF4444', color: 'white', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '0.7rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            
            {/* Notifications Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute', right: 0, top: '50px', width: '320px',
                background: 'var(--bg-card)', borderRadius: '24px', 
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                zIndex: 1000, maxHeight: '400px', overflowY: 'auto',
                overflow: 'hidden'
              }}>
                <h4 style={{ margin: 0, padding: '1.25rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '800' }}>Notifications</h4>
                {notifications.length === 0 ? (
                  <p style={{ padding: '2rem 1rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center', fontWeight: '500' }}>No notifications right now.</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => !n.isRead && handleRead(n._id)}
                      style={{
                        padding: '1.25rem', borderBottom: '1px solid var(--border-color)',
                        background: n.isRead ? 'var(--bg-card)' : 'var(--input-bg)',
                        cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: n.isRead ? '500' : '700', lineHeight: '1.4' }}>{n.message}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
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
              width: '44px', 
              height: '44px', 
              borderRadius: '50%', 
              background: 'var(--accent-gradient)', 
              color: '#FFFFFF', 
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '1.2rem',
              boxShadow: 'var(--shadow-colored)',
              transition: 'transform 0.2s',
              marginLeft: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
             {user.name && user.name.charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
