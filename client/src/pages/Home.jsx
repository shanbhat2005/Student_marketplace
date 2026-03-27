import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL, { api } from '../api/axios';
import '../App.css';
import FilterDropdown from '../components/FilterDropdown';
import ConfirmModal from '../components/ConfirmModal';
import SkeletonCard from '../components/SkeletonCard';

const HeartIcon = ({ filled, onClick }) => (
  <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} style={{
    position: 'absolute', top: '10px', right: '10px', 
    background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)',
    borderRadius: '50%', width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.15s ease'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke={filled ? "#EF4444" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  </div>
);

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, bookId: null, title: '' });

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Wishlist
  const fetchWishlist = async () => {
    if (!currentUser) return;
    try {
      const res = await api.get(`/api/auth/wishlist/${currentUser._id}`);
      // Assuming res.data is array of populated books or just ObjectIDs. We extract IDs.
      const ids = res.data.map(item => typeof item === 'object' ? item._id : item);
      setWishlist(ids);
    } catch (err) { console.error("Could not fetch wishlist", err); }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchBooks = async () => {
      setLoading(true);
      try {
        let queryUrl = `/api/books?`;
        if (debouncedSearch) queryUrl += `search=${encodeURIComponent(debouncedSearch)}&`;
        if (selectedCondition) queryUrl += `condition=${encodeURIComponent(selectedCondition)}&`;

        const res = await api.get(queryUrl);
        if (isActive) {
          setBooks(res.data || []);
          setError('');
        }
      } catch (err) {
        if (isActive) setError('Failed to load books. Please try again.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, selectedCondition]); // re-fetch when these change

  const filteredBooks = books.filter(book => {
    const bookCourse = book.course || 'BCA';
    const matchCourse = selectedCourse ? bookCourse === selectedCourse : true;
    const matchSemester = selectedSemester ? book.semester.toString() === selectedSemester.toString() : true;
    return matchCourse && matchSemester;
  });

  const toggleWishlist = async (bookId) => {
    if (!currentUser) {
      alert("Please log in to add to wishlist.");
      window.location.href = '/auth';
      return;
    }
    try {
      const isSaved = wishlist.includes(bookId);
      if (isSaved) {
        await api.delete(`/api/auth/wishlist/remove/${bookId}`, { data: { userId: currentUser._id } });
        setWishlist(prev => prev.filter(id => id !== bookId));
      } else {
        await api.post(`/api/auth/wishlist/add/${bookId}`, { userId: currentUser._id });
        setWishlist(prev => [...prev, bookId]);
      }
    } catch (err) {
      console.error(err);
      alert("Could not update wishlist");
    }
  };

  const navigate = useNavigate();

  const initiateChat = async (book) => {
    if (!currentUser) {
      alert("Please log in to chat.");
      window.location.href = '/auth';
      return;
    }
    if (book.owner === currentUser._id || (book.owner && book.owner._id === currentUser._id)) {
      alert("You cannot message yourself.");
      return;
    }
    try {
      const sellerId = typeof book.owner === 'object' ? book.owner._id : book.owner;
      const res = await api.post('/api/messages/conversation', {
        buyerId: currentUser._id,
        sellerId: sellerId,
        bookId: book._id
      });
      navigate('/chat', { state: { conversation: res.data } });
    } catch (err) {
      console.error(err);
      alert('Could not initiate chat.');
    }
  };

  const handleBuyNowClick = (bookId, title) => {
    if (!currentUser) {
      alert("Session expired. Please log in again.");
      window.location.href = '/auth';
      return;
    }
    setConfirmModal({ isOpen: true, bookId, title });
  };

  const confirmPurchase = async (contactEmail) => {
    const { bookId, title } = confirmModal;
    setConfirmModal({ isOpen: false, bookId: null, title: '' });
    
    if (!currentUser) return;

    try {
      setLoading(true);
      const res = await api.post(`/api/books/${bookId}/buy`, { buyerEmail: contactEmail, buyerId: currentUser._id });
      alert(res.data.message || 'Purchase successful! Check your notifications.');
      setBooks((prevBooks) => prevBooks.filter((b) => b._id !== bookId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process purchase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '2.2rem', fontWeight: '800' }}>Marketplace</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '1.05rem' }}>
            Discover and purchase second-hand course books securely.
          </p>
        </div>
        <Link to="/add-book" className="primary-btn">
          + Sell a Book
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', position: 'relative', zIndex: 100 }}>
        <input 
          type="text"
          className="form-input"
          placeholder="Search by book title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', fontSize: '1.05rem' }}
        />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
          <FilterDropdown 
            title="Condition" 
            options={['New', 'Used']} 
            selected={selectedCondition} 
            onSelect={setSelectedCondition} 
          />
        </div>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>No books listed matching your search.</p>
        </div>
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredBooks.map((book) => (
            <div key={book._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem', position: 'relative' }}>
              
              <HeartIcon 
                filled={wishlist.includes(book._id)} 
                onClick={() => toggleWishlist(book._id)}
              />

              {book.imageUrl ? (
                <img 
                  src={`${API_BASE_URL}${book.imageUrl}`} 
                  alt={book.title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.5rem' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '220px', backgroundColor: 'var(--border-color)', borderRadius: '12px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-muted" style={{ fontWeight: '500' }}>No Image Included</span>
                </div>
              )}
              
              <h3 style={{ margin: '0', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '700', lineHeight: '1.3' }}>{book.title}</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>by {book.author}</p>
              
              <div style={{ margin: '0.75rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {book.course || 'BCA'} {book.semester}
                </span>
                <span style={{ backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {book.condition || 'Used'}
                </span>
                <span style={{ marginLeft: 'auto', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800' }}>
                  ₹{book.price}
                </span>
              </div>
              
              <div style={{ flexGrow: 1 }}></div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => initiateChat(book)}
                  style={{ flex: '1', padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}
                >
                  Message
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => handleBuyNowClick(book._id, book.title)}
                  style={{ flex: '1.5', padding: '0.85rem 0.5rem', fontSize: '0.9rem' }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        title="Confirm Purchase" 
        message={`Are you sure you want to buy "${confirmModal.title}"?`}
        onConfirm={confirmPurchase}
        onCancel={() => setConfirmModal({ isOpen: false, bookId: null, title: '' })}
      />
    </div>
  );
};

export default Home;
