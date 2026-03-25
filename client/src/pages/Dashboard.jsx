import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import '../App.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/api/orders/mine/${user._id}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  if (!user) {
    return <div className="auth-page"><p>Please log in.</p></div>;
  }

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <div className="auth-card home-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Welcome, {user.name}!</h2>
          <button onClick={handleLogout} className="secondary-btn" style={{ padding: '0.4rem 0.8rem', color: '#fca5a5', borderColor: '#fca5a5' }}>
            Log Out
          </button>
        </div>
        
        <h3>Orders Placed</h3>
        <p className="auth-subtitle" style={{ marginBottom: '1rem' }}>Here is a history of the books you have purchased.</p>

        {loading && <p>Loading orders...</p>}
        {error && <p className="auth-error">{error}</p>}
        
        {!loading && orders.length === 0 && (
          <p style={{ color: '#9ca3af' }}>You haven't placed any orders yet.</p>
        )}

        {!loading && orders.length > 0 && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {orders.map((order) => (
              <div key={order._id} style={{ 
                background: '#1f2937', 
                padding: '1.5rem', 
                borderRadius: '0.75rem', 
                border: '1px solid #374151',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#f3f4f6', fontSize: '1.1rem' }}>{order.bookTitle}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#9ca3af', fontSize: '0.9rem' }}>Author: {order.bookAuthor}</p>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Seller Contact: <a href={`mailto:${order.sellerEmail}`} style={{color: '#60a5fa'}}>{order.sellerEmail}</a></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{order.price}</p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
