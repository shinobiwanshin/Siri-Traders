import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiAlertTriangle } from 'react-icons/fi';
import { loginAdmin } from '../utils/adminAuth';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    // 1. Verify local admin credentials
    const session = loginAdmin(email, password);
    if (!session) {
      setError('Invalid admin email or password');
      return;
    }

    // 2. Verify Clerk session has admin privileges
    if (!isLoaded) {
      setError('Authentication is still loading — please try again in a moment.');
      return;
    }
    if (!user) {
      setError('You must also be signed in via your Clerk account. Please sign in first, then return here.');
      return;
    }
    if (!user.isAdmin) {
      setError('Your Clerk account does not have admin privileges. Ask the owner to set privateMetadata.isAdmin = true in the Clerk dashboard.');
      return;
    }

    navigate('/admin');
  };

  return (
    <main className="admin-login">
      <section className="admin-login__panel">
        <div className="admin-login__brand">
          <span><img src="/logo-mark.webp" alt="Siri Traders" /></span>
          <div>
            <strong>Siri Traders</strong>
            <small>Admin Control Center</small>
          </div>
        </div>
        <div className="admin-login__copy">
          <h1>Admin Login</h1>
          <p>Sign in to manage inventory, offers, coupons, customers, and site content.</p>
        </div>

        {/* Clerk sign-in status hint */}
        {isLoaded && !user && (
          <div className="admin-login__clerk-hint">
            <FiAlertTriangle />
            <span>
              You are not signed into your customer account.{' '}
              <Link to="/login">Sign in with Clerk</Link> first, then come back here.
            </span>
          </div>
        )}
        {isLoaded && user && !user.isAdmin && (
          <div className="admin-login__clerk-hint admin-login__clerk-hint--warn">
            <FiAlertTriangle />
            <span>Signed in as <strong>{user.email}</strong> — this account does not have admin privileges.</span>
          </div>
        )}
        {isLoaded && user?.isAdmin && (
          <div className="admin-login__clerk-hint admin-login__clerk-hint--ok">
            <span>✓ Clerk admin verified — enter your panel password below.</span>
          </div>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit}>
          {error && <p className="admin-login__error">{error}</p>}
          <label>
            <span>Email</span>
            <div>
              <FiMail />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter admin email" autoComplete="username" required />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div>
              <FiLock />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Enter password" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(prev => !prev)} aria-label="Toggle password">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>
          <button className="admin-login__submit">Login to admin</button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
