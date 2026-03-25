import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  };

  if (!user) return null;

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
