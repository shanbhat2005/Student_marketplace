import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import '../App.css';

const Admin = () => {
  const [secret, setSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit State
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    price: '',
    semester: '',
    course: '',
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleEditClick = (book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      semester: book.semester,
      course: book.course || 'BCA',
    });
    setEditImageFile(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('adminSecret', secret);
      payload.append('title', editFormData.title);
      payload.append('author', editFormData.author);
      payload.append('price', Number(editFormData.price));
      payload.append('semester', Number(editFormData.semester));
      payload.append('course', editFormData.course);
      
      if (editImageFile) {
        payload.append('image', editImageFile);
      }

      const res = await api.put(`/api/books/admin/${editingBook._id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Book updated successfully!');
      setBooks((prev) => prev.map((b) => b._id === editingBook._id ? res.data.book : b));
      setEditingBook(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update book.');
    } finally {
      setIsSaving(false);
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
        <p className="auth-subtitle">Manage, edit, and delete marketplace listings.</p>
        
        {loading && <p>Loading...</p>}
        {error && <p className="auth-error">{error}</p>}

        {/* EDIT MODAL/VIEW */}
        {editingBook && (
          <div style={{
            background: '#1f2937', padding: '1.5rem', borderRadius: '1rem',
            marginBottom: '2rem', border: '1px solid #374151'
          }}>
            <h3>Edit Book Listing</h3>
            <form onSubmit={handleEditSubmit} className="auth-form" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label>Title
                  <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required />
                </label>
                <label>Author
                  <input type="text" name="author" value={editFormData.author} onChange={handleEditChange} required />
                </label>
                <label>Price
                  <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} required />
                </label>
                <label>Course
                  <select name="course" value={editFormData.course} onChange={handleEditChange} required>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                  </select>
                </label>
                <label>Semester
                  <select name="semester" value={editFormData.semester} onChange={handleEditChange} required>
                    {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </label>
                <label>Update Image
                  <input type="file" accept="image/*" onChange={handleEditFileChange} style={{ padding: '0.5rem' }} />
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={isSaving} className="primary-btn">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingBook(null)} className="secondary-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!loading && books.length === 0 && <p>No books available.</p>}

        {!loading && books.length > 0 && !editingBook && (
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
                    <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleEditClick(book)}
                        className="secondary-btn"
                        style={{ padding: '0.4rem 0.8rem', color: '#60a5fa', borderColor: '#60a5fa' }}
                      >
                        Edit
                      </button>
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
