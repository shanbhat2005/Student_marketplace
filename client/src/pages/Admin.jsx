import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import '../App.css';

const Admin = () => {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (secret.trim()) {
      setIsAuthenticated(true);
      fetchBooks();
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/books');
      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await api.delete(`/api/books/admin/${id}`, {
        data: { adminSecret: secret }
      });
      alert('Book deleted successfully');
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Admin Dashboard</h2>
          <p className="auth-subtitle">Enter the Admin Secret to access.</p>
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="password"
              placeholder="Admin Secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
            <button type="submit" className="primary-btn full-width">
              Enter Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <div className="auth-card home-card" style={{ maxWidth: '1000px' }}>
        <h2>Admin Dashboard</h2>
        <p className="auth-subtitle">Manage and delete marketplace listings.</p>
        
        {loading && <p>Loading...</p>}
        {error && <p className="auth-error">{error}</p>}

        {!loading && books.length === 0 && <p>No books available.</p>}

        {!loading && books.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: '0.75rem' }}>Title</th>
                  <th style={{ padding: '0.75rem' }}>Author</th>
                  <th style={{ padding: '0.75rem' }}>Course / Sem</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.75rem' }}>{book.title}</td>
                    <td style={{ padding: '0.75rem' }}>{book.author}</td>
                    <td style={{ padding: '0.75rem' }}>{book.course || 'BCA'} - Sem {book.semester}</td>
                    <td style={{ padding: '0.75rem' }}>₹{book.price}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button 
                        onClick={() => handleDelete(book._id)}
                        className="secondary-btn"
                        style={{ padding: '0.4rem 0.8rem', color: '#fca5a5', borderColor: '#fca5a5' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
