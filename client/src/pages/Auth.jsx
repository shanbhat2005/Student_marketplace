import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import '../App.css';
import './Auth.css';
import Loader from '../components/Loader';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/login', loginData);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/signup', signupData);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="wrapper">
      <div className="switch">
        <input
          type="checkbox"
          className="toggle"
          id="card-toggle"
          checked={isSignUp}
          onChange={(e) => {
            setIsSignUp(e.target.checked);
            setError('');
          }}
        />
        <label htmlFor="card-toggle" className="slider"></label>
        <nav className="card-side"></nav>
        <div className="flip-card__inner">
          <div className="flip-card__front">
            <div className="title">Log in</div>
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="primary-btn full-width">
                Login
              </button>
            </form>
          </div>
          <div className="flip-card__back">
            <div className="title">Sign up</div>
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="primary-btn full-width">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
