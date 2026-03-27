import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Auth from './pages/Auth';
import AddBook from './pages/AddBook';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const LandingPage = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
        <h1 className="auth-title" style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>BCA Marketplace</h1>
        <p className="auth-subtitle" style={{ marginBottom: '2.5rem', lineHeight: '1.6' }}>
          Buy and sell BCA semester books easily with your classmates.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/auth" className="continue-btn" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            Log In
          </Link>
          <Link to="/auth" state={{ isSignUp: true }} className="tab-btn active" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid var(--input-border)', padding: '1.15rem', borderRadius: '9999px' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/add-book" element={<ProtectedRoute><AddBook /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
