import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api/axios';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [listedBooks, setListedBooks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 'orders' | 'wishlist' | 'listings'
  const [activeTab, setActiveTab] = useState('orders');
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, wishlistRes, listRes] = await Promise.all([
          api.get(`/api/orders/mine/${user._id}`),
          api.get(`/api/auth/wishlist/${user._id}`),
          api.get(`/api/books/mine/${user._id}`) // Requires backend endpoint!
        ]);
        setOrders(ordersRes.data || []);
        // Server returns populated books for wishlist
        setWishlist(wishlistRes.data || []);
        setListedBooks(listRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?._id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const removeWishlist = async (bookId) => {
    try {
      await api.delete(`/api/auth/wishlist/remove/${bookId}`, { data: { userId: user._id } });
      setWishlist(prev => prev.filter(b => b._id !== bookId));
    } catch(err) { alert('Failed to remove'); }
  };

  const initiateChat = async (sellerObj, bookObj, bookTitle) => {
    try {
      const sellerId = typeof sellerObj === 'object' ? sellerObj._id : sellerObj;
      const bookId = typeof bookObj === 'object' ? bookObj._id : bookObj;
      
      const res = await api.post('/api/messages/conversation', {
        buyerId: user._id,
        sellerId: sellerId,
        bookId: bookId
      });
      navigate('/chat', { state: { conversation: res.data } });
    } catch (err) {
      console.error(err);
      alert('Could not initiate chat.');
    }
  };

  if (!user) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p className="text-muted">Please log in to view dashboard.</p>
      </div>
    );
  }

  const renderTabButton = (key, label) => (
    <button 
      onClick={() => setActiveTab(key)}
      style={{
        flex: 1, padding: '1rem', border: 'none', background: 'transparent',
        borderBottom: activeTab === key ? '3px solid var(--accent-primary)' : '3px solid transparent',
        color: activeTab === key ? 'var(--accent-primary)' : 'var(--text-muted)',
        fontWeight: activeTab === key ? '700' : '500', 
        fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '900px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)', fontWeight: '800' }}>Dashboard</h2>
            <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Welcome back, {user.name}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="secondary-btn" 
            style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
          >
            Log Out
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
          {renderTabButton('orders', 'My Orders')}
          {renderTabButton('wishlist', 'My Wishlist')}
          {renderTabButton('listings', 'My Listed Books')}
        </div>

        {loading && <p className="text-muted">Loading your dashboard...</p>}
        {error && <p style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '1rem', borderRadius: '8px' }}>{error}</p>}
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && !loading && (
          <div>
            {orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>You haven't purchased any books yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                  <div key={order._id} style={{ 
                    background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', 
                    border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>{order.bookTitle}</h4>
                      <p className="text-muted" style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem' }}>Author: <span style={{ color: 'var(--text-main)' }}>{order.bookAuthor}</span></p>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        Seller Contact: <a href={`mailto:${order.sellerEmail}`} style={{color: 'var(--accent-primary)', fontWeight: '500'}}>{order.sellerEmail}</a>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <p style={{ margin: 0, color: '#10B981', fontWeight: '700', fontSize: '1.4rem' }}>₹{order.price}</p>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Purchased on {new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.seller && order.book && (
                        <button 
                          onClick={() => initiateChat(order.seller, order.book, order.bookTitle)}
                          className="primary-btn" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                        >
                          Message Seller
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && !loading && (
          <div>
            {wishlist.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>Your wishlist is empty. Go heart some books!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {wishlist.map((book) => (
                  book && book._id && (
                  <div key={book._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
                     {book.imageUrl ? (
                        <img src={`${API_BASE_URL}${book.imageUrl}`} alt={book.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.5rem' }} />
                      ) : (
                        <div style={{ width: '100%', height: '180px', backgroundColor: 'var(--border-color)', borderRadius: '12px', marginBottom: '0.5rem' }} />
                      )}
                      <h3 style={{ margin: '0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700' }}>{book.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#10B981', fontWeight: 'bold' }}>₹{book.price}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                        <Link to={`/home`} className="primary-btn" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>Buy</Link>
                        <button className="secondary-btn" onClick={() => removeWishlist(book._id)} style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#EF4444', borderColor: '#FCA5A5' }}>Remove</button>
                      </div>
                  </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && !loading && (
          <div>
            {listedBooks.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>You haven't listed any books for sale.</p>
                <Link to="/add-book" className="primary-btn" style={{ marginTop: '1rem' }}>Sell a Book</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {listedBooks.map((book) => (
                  <div key={book._id} style={{ 
                    background: 'var(--input-bg)', padding: '1.25rem', borderRadius: '12px', 
                    border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>{book.title}</h4>
                      <p className="text-muted" style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem' }}>Status: <span style={{ color: book.isSold ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>{book.isSold ? 'Sold' : 'Active'}</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontWeight: '700', fontSize: '1.2rem' }}>₹{book.price}</p>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Listed {new Date(book.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
