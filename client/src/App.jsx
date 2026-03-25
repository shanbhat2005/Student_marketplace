import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Auth from './pages/Auth';
import AddBook from './pages/AddBook';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const LandingPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>BCA Second-Hand Books Marketplace</h1>
        <p className="auth-subtitle">
          Buy and sell BCA semester books easily with your classmates.
        </p>
        <div className="landing-buttons">
          <Link to="/auth" className="primary-btn">
            Login
          </Link>
          <Link to="/auth" state={{ isSignUp: true }} className="secondary-btn">
            Sign Up
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
