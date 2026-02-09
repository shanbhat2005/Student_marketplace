import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';

const LandingPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>BCA Second-Hand Books Marketplace</h1>
        <p className="auth-subtitle">
          Buy and sell BCA semester books easily with your classmates.
        </p>
        <div className="landing-buttons">
          <Link to="/login" className="primary-btn">
            Login
          </Link>
          <Link to="/signup" className="secondary-btn">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome to BCA Books Home</h2>
        <p className="auth-subtitle">
          You are logged in. Next, we can list and manage your books here.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
