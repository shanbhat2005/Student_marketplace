import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import '../App.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    semester: '1',
    condition: 'New',
    course: 'BCA',
    contactEmail: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      if (currentUser) {
        payload.append('owner', currentUser._id);
        
        // Use provided contactEmail, fallback to user's registered email
        const finalEmail = formData.contactEmail.trim() || currentUser.email;
        payload.append('contactEmail', finalEmail);
      }

      payload.append('title', formData.title);
      payload.append('author', formData.author);
      payload.append('price', Number(formData.price));
      payload.append('semester', Number(formData.semester));
      payload.append('condition', formData.condition);
      payload.append('course', formData.course);
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      await api.post('/api/books/add', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Book Listed Successfully!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to list book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem 2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.8rem' }}>List a Book</h2>
        <p className="text-muted" style={{ margin: '0 0 2rem 0' }}>Share your course books with classmates.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              name="title"
              placeholder="e.g. Data Structures in C"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Author</label>
            <input
              className="form-input"
              type="text"
              name="author"
              placeholder="e.g. Reema Thareja"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Course</label>
              <select
                className="form-select"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Semester</label>
              <select
                className="form-select"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Price (₹)</label>
              <input
                className="form-input"
                type="number"
                name="price"
                min="0"
                step="1"
                placeholder="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email (Optional)</label>
            <input
              className="form-input"
              type="email"
              name="contactEmail"
              placeholder="Leave blank to use your account email"
              value={formData.contactEmail}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Book Image (Optional)</label>
            <input
              className="form-input"
              type="file"
              name="image"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ padding: '0.65rem', cursor: 'pointer' }}
            />
          </div>

          {error && <p style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginTop: '1rem' }}>{error}</p>}

          <button type="submit" disabled={loading} className="primary-btn full-width" style={{ marginTop: '1.5rem', padding: '1rem' }}>
            {loading ? 'Listing Book...' : 'List Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
