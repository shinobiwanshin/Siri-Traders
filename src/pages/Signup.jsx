import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const floatingItems = ['🥬', '🍇', '🥑', '🧈', '🍊', '🥜', '🧄', '🫐', '🍋', '🥭'];

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { level: 2, label: 'Medium', color: '#E9A800' };
    return { level: 3, label: 'Strong', color: '#52B788' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email'); return; }
    if (!phone.trim() || phone.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreeTerms) { setError('Please agree to Terms & Conditions'); return; }

    setLoading(true);
    setTimeout(() => {
      signup({ name, email, phone });
      navigate('/home');
    }, 800);
  };

  return (
    <div className="signup-page">
      <div className="signup-floating" aria-hidden="true">
        {floatingItems.map((item, i) => (
          <span
            key={i}
            className="signup-floating__item"
            style={{
              '--x': `${5 + (i * 9.5) % 85}%`,
              '--y': `${3 + (i * 11) % 85}%`,
              '--delay': `${i * 0.5}s`,
              '--duration': `${5 + (i % 3) * 2}s`,
              '--size': `${22 + (i % 4) * 8}px`,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="signup-card">
        <div className="signup-card__logo">
          <div className="signup-card__logo-circle">🛒</div>
          <h1 className="signup-card__brand">Siri Traders</h1>
        </div>

        <div className="signup-card__header">
          <h2 className="signup-card__title">Create Account</h2>
          <p className="signup-card__subtitle">Join us for quick grocery delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-card__form">
          {error && <div className="signup-card__error">{error}</div>}

          <div className="signup-card__input-wrapper">
            <FiUser className="signup-card__input-icon" />
            <input type="text" placeholder="Full Name" value={name}
              onChange={(e) => setName(e.target.value)} className="signup-card__input" id="signup-name" />
          </div>

          <div className="signup-card__input-wrapper">
            <FiMail className="signup-card__input-icon" />
            <input type="email" placeholder="Email Address" value={email}
              onChange={(e) => setEmail(e.target.value)} className="signup-card__input" id="signup-email" />
          </div>

          <div className="signup-card__input-wrapper">
            <FiPhone className="signup-card__input-icon" />
            <input type="tel" placeholder="Phone Number" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="signup-card__input" id="signup-phone" />
          </div>

          <div>
            <div className="signup-card__input-wrapper">
              <FiLock className="signup-card__input-icon" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="signup-card__input" id="signup-password" />
              <button type="button" className="signup-card__eye-btn"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {password && (
              <div className="signup-card__strength">
                <div className="signup-card__strength-bar">
                  <div className="signup-card__strength-fill"
                    style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                </div>
                <span className="signup-card__strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="signup-card__input-wrapper">
            <FiLock className="signup-card__input-icon" />
            <input type="password" placeholder="Confirm Password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="signup-card__input" id="signup-confirm-password" />
          </div>

          <label className="signup-card__terms">
            <input type="checkbox" checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)} className="signup-card__checkbox" />
            <span className="signup-card__checkbox-custom"></span>
            I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
          </label>

          <button type="submit"
            className={`signup-card__submit ${loading ? 'signup-card__submit--loading' : ''}`}
            disabled={loading} id="signup-submit-btn">
            {loading ? <span className="signup-card__spinner"></span> : 'Create Account'}
          </button>
        </form>

        <p className="signup-card__footer">
          Already have an account? <Link to="/login" className="signup-card__link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
