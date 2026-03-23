import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import '../App.css';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/api/books');
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

  const handleBuyNow = async (bookId, title) => {
    const buyerEmail = window.prompt(`Please enter your email to confirm purchase of "${title}".\n\nThe seller will contact you to arrange payment and delivery!`);
    
    if (!buyerEmail) return;
    if (!buyerEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/api/books/${bookId}/buy`, { buyerEmail });
      alert(res.data.message || 'Purchase successful! Please check your email inbox.');
      
      // Remove the book from the page instantly
      setBooks((prevBooks) => prevBooks.filter((b) => b._id !== bookId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to process purchase. Please try again.');
    } finally {
      setLoading(false);
    }
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
                  onClick={() => handleBuyNow(book._id, book.title)}
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

