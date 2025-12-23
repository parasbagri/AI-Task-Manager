"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import '../auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        router.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'rgba(100, 120, 150, 0.2)',
          borderRadius: '8px',
          borderLeft: '4px solid #6366f1'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#a0aec0' }}>
            💡 Test Credentials
          </p>
          <div style={{ fontSize: '13px', color: '#cbd5e0', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Email:</strong> pa3@gmail.com
            </p>
            <p style={{ margin: '0' }}>
              <strong>Password:</strong> pass@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
