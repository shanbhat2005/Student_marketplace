import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/axios';
import '../App.css';
import './Auth.css';
import Loader from '../components/Loader';

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
     <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.82 3.59-.8 1.54.05 2.8.69 3.55 1.83-3.1 1.83-2.61 6.1 0 7.4-1.12 2.9-2.34 4.54-3.5 4.54zm-2.18-18.04c.88-1.07 1.48-2.58 1.28-4.04-1.25.06-3.01.88-3.9 1.95-.77.92-1.46 2.45-1.23 3.86 1.4.11 2.95-.7 3.85-1.77z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M22.67 0H1.33C.6 0 0 .6 0 1.33v21.34C0 23.4.6 24 1.33 24h11.49v-9.28H9.68v-3.62h3.14V8.41c0-3.1 1.89-4.79 4.66-4.79 1.33 0 2.46.1 2.79.14v3.24h-1.92c-1.5 0-1.79.71-1.79 1.76v2.3h3.58l-.47 3.62h-3.1V24h6.11c.73 0 1.33-.6 1.33-1.33V1.33C24 .6 23.4 0 22.67 0z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
    <path d="M2 4l10 8 10-8"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#10B981">
    <circle cx="12" cy="12" r="10" />
    <path fill="white" d="M10 15.5l-3.5-3.5 1.41-1.41L10 12.67l6.59-6.59L18 7.5z"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.isSignUp ? 'signup' : 'signin');

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
      const res = await api.post('/api/auth/login', loginData);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/home');
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
      const res = await api.post('/api/auth/signup', signupData);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Welcome Back, Please enter Your details</p>
        </div>

        <div className="tabs-container">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); }}
          >
            Signup
          </button>
        </div>

        {activeTab === 'signin' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <div className="icon-container"><MailIcon /></div>
              <div className="input-divider"></div>
              <div className="input-content">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="ialirezamp@gmail.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              {loginData.email.length > 5 && loginData.email.includes('@') && (
                <div className="valid-icon"><CheckIcon /></div>
              )}
            </div>

            <div className="input-group">
              <div className="icon-container"><LockIcon /></div>
              <div className="input-divider"></div>
              <div className="input-content">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              {loginData.password.length > 5 && (
                <div className="valid-icon"><CheckIcon /></div>
              )}
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="continue-btn full-width">
              Continue
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            <div className="input-group">
              <div className="icon-container"><UserIcon /></div>
              <div className="input-divider"></div>
              <div className="input-content">
                <label className="input-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              {signupData.name.length > 2 && (
                <div className="valid-icon"><CheckIcon /></div>
              )}
            </div>

            <div className="input-group">
              <div className="icon-container"><MailIcon /></div>
              <div className="input-divider"></div>
              <div className="input-content">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="ialirezamp@gmail.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              {signupData.email.length > 5 && signupData.email.includes('@') && (
                <div className="valid-icon"><CheckIcon /></div>
              )}
            </div>

            <div className="input-group">
              <div className="icon-container"><LockIcon /></div>
              <div className="input-divider"></div>
              <div className="input-content">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              {signupData.password.length > 5 && (
                <div className="valid-icon"><CheckIcon /></div>
              )}
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="continue-btn full-width">
              Sign Up
            </button>
          </form>
        )}


      </div>
    </div>
  );
};

export default Auth;
