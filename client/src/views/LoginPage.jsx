import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { setToken } from '../utils/auth';

const LOGO_URL = 'https://www.greatwebsoft.in/gaonmaza/public/images/white-logo.jpeg';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim() || !password) {
      setError('Phone and password are required');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    setLoading(true);
    authApi
      .login(phone.trim(), password)
      .then((res) => {
        if (res.success) {
          setToken(res.token, res.admin);
          navigate('/', { replace: true });
        } else {
          setError(res.message || 'Login failed');
        }
      })
      .catch((err) => setError(err.message || 'Login failed'))
      .finally(() => setLoading(false));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img src={LOGO_URL} alt="Logo" style={styles.logo} />
        <h1 style={styles.foundationName}>GAON MAJHA UDYOG FOUNDATION</h1>
        <h2 style={styles.title}>Admin Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Phone number</label>
            <input
              type="text"
              inputMode="numeric"
              value={phone ? phone.replace(/(\d{2})(?=\d)/g, '$1-') : ''}
              onChange={handlePhoneChange}
              placeholder="e.g. 9876543210"
              style={styles.input}
              autoComplete="tel"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.input}
              autoComplete="current-password"
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f0f2',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: '2rem',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  logo: {
    display: 'block',
    height: 48,
    width: 'auto',
    maxWidth: 180,
    margin: '0 auto 1.5rem',
    objectFit: 'contain',
  },
  foundationName: {
    margin: '0 0 0.5rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: '0.02em',
    lineHeight: 1.3,
  },
  title: {
    margin: '0 0 1.5rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#555',
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.9rem', fontWeight: 500, color: '#333' },
  input: {
    padding: '0.6rem 0.75rem',
    border: '1px solid #aaa',
    borderRadius: 4,
    fontSize: '1rem',
  },
  error: {
    padding: '0.5rem 0.75rem',
    background: '#fde8e8',
    color: '#8B1538',
    borderRadius: 4,
    fontSize: '0.9rem',
  },
  button: {
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: 4,
    background: '#8B1538',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
