import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/books');
        setBooks(res.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBuyNow = (title) => {
    alert(`Buy flow coming soon for "${title}"`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card home-card">
        <div className="home-header">
          <div>
            <h2>BCA Books Marketplace</h2>
            <p className="auth-subtitle">
              Browse second-hand BCA books listed by your classmates.
            </p>
          </div>
          <Link to="/add-book" className="primary-btn">
            Sell a Book
          </Link>
        </div>

        {loading && <p className="auth-subtitle">Loading books...</p>}
        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="auth-subtitle">No books listed yet. Be the first to sell a book!</p>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book._id} className="book-card">
                <h3>{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-meta">
                  Semester: <span>{book.semester}</span>
                </p>
                <p className="book-price">₹ {book.price}</p>
                <button
                  type="button"
                  className="primary-btn full-width"
                  onClick={() => handleBuyNow(book.title)}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

