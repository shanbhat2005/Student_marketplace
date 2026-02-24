import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Auth from './pages/Auth';
import AddBook from './pages/AddBook';
import Home from './pages/Home';

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
          <Link to="/auth" className="secondary-btn">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/add-book" element={<AddBook />} />
    </Routes>
  );
}

export default App;
