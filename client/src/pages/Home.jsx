import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, PlayCircle } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(251, 191, 36, 0.15)', color: 'var(--color-accent)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          <Sparkles size={14} /> Master Modern Tech Skills
        </div>
        <h1>
          Supercharge Your Career with <span>Industry-Grade</span> Courses
        </h1>
        <p>
          High-impact video modules, real-world projects, instant enrollment with Razorpay test payments, and hands-on progress tracking.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/courses" className="btn btn-accent" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
            Explore All Courses <ArrowRight size={18} />
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline-light" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            <PlayCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Structured Video Lessons</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Watch curated YouTube modules sequentially. Track lesson completion in real-time.
          </p>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '1rem' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Secure Razorpay Checkout</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Safe test mode payments backed by server-side HMAC SHA-256 cryptographic signature verification.
          </p>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', marginBottom: '1rem' }}>
            <CheckCircle2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Progress Tracking</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Mark completed lessons, calculate completion percentages, and retain persistent enrollment state.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
