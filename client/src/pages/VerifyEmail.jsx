import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmVerification = async () => {
      if (!token) {
        setError('No verification token provided in URL.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.post('/auth/verify-email', { token });
        setMessage(res.data.message || 'Email successfully verified!');
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired verification link.');
      } finally {
        setLoading(false);
      }
    };

    confirmVerification();
  }, [token]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {loading ? (
          <div>
            <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem', margin: '0 auto 1.5rem auto' }}></div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verifying Your Email</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Confirming token credentials with server...</p>
          </div>
        ) : error ? (
          <div>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <AlertCircle size={32} color="var(--color-danger)" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error}</p>
            <Link to="/login" className="btn btn-secondary">
              Back to Login
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={32} color="var(--color-success)" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
              Email Confirmed!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
              {message} Your student account is now fully verified.
            </p>
            <Link to="/courses" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Go to Courses <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

