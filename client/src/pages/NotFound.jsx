import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, BookOpen } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 280px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '520px', background: '#FFFFFF', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#D97706' }}>
          <Compass size={36} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Error 404
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)', margin: '0.5rem 0 1rem 0' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page or course resource you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Back to Home
          </Link>
          <Link to="/courses" className="btn btn-primary">
            <BookOpen size={16} /> Explore Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

