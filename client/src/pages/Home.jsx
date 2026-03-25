import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL, { api } from '../api/axios';
import '../App.css';
import FilterDropdown from '../components/FilterDropdown';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const filteredBooks = books.filter(book => {
    const bookCourse = book.course || 'BCA';
    const matchCourse = selectedCourse ? bookCourse === selectedCourse : true;
    const matchSemester = selectedSemester ? book.semester.toString() === selectedSemester.toString() : true;
    return matchCourse && matchSemester;
  });

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
            <h2>BCA & BBA Books Marketplace</h2>
            <p className="auth-subtitle">
              Browse second-hand course books listed by your classmates.
            </p>
          </div>
          <Link to="/add-book" className="primary-btn">
            Sell a Book
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <FilterDropdown 
            title="Course" 
            options={['BCA', 'BBA']} 
            selected={selectedCourse} 
            onSelect={setSelectedCourse} 
          />
          <FilterDropdown 
            title="Semester" 
            options={['1', '2', '3', '4', '5', '6']} 
            selected={selectedSemester} 
            onSelect={setSelectedSemester} 
          />
        </div>

        {loading && <p className="auth-subtitle">Loading books...</p>}
        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && books.length === 0 && (
          <p className="auth-subtitle">No books listed yet. Be the first to sell a book!</p>
        )}

        {!loading && !error && books.length > 0 && filteredBooks.length === 0 && (
          <p className="auth-subtitle">No books match your selected filters.</p>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book._id} className="book-card">
                {book.imageUrl && (
                  <img 
                    src={`${API_BASE_URL}${book.imageUrl}`} 
                    alt={book.title} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }} 
                  />
                )}
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

