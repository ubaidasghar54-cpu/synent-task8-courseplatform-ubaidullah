import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setMessage(res.data.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send you a secure reset link</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={32} color="var(--color-success)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.75rem' }}>
              Check Your Inbox
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {message} Please follow the instructions in the email to set your new password.
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
              <ArrowLeft size={16} /> Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Registered Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Mail size={18} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className="form-footer" style={{ marginTop: '1.5rem' }}>
              Remembered your password? <Link to="/login">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

