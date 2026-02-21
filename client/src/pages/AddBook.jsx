import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    semester: '1',
    condition: 'New',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        price: Number(formData.price),
        semester: Number(formData.semester),
        condition: formData.condition,
      };

      await axios.post('http://localhost:5000/api/books/add', payload);
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
    <div className="auth-page">
      <div className="auth-card">
        <h2>List a Book for Sale</h2>
        <p className="auth-subtitle">Share your BCA books with your juniors and classmates.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Title
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Author
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Price (₹)
            <input
              type="number"
              name="price"
              min="0"
              step="1"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Semester
            <select
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
          </label>

          <label>
            Condition
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="primary-btn full-width">
            {loading ? 'Listing...' : 'List Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;

