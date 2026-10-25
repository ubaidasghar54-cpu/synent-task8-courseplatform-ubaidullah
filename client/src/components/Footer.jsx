import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, ShieldCheck, Sparkles, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--color-dark)', color: '#94A3B8', borderTop: '1px solid #1E293B', marginTop: 'auto', paddingTop: '3rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Col */}
          <div>
            <Link to="/" className="nav-brand" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <BookOpen size={24} color="#FBBF24" />
              <span>Learn</span>Hub
            </Link>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '1rem' }}>
              Full-Stack Online Course Platform engineered with React, Express, MongoDB, JWT authentication, and Razorpay test payments.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#1E293B', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>
              <Sparkles size={13} /> Synent Technologies Web Development Task 8
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to="/my-courses" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Stack */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Security & Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>HMAC SHA-256 Verified Transactions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>Bcrypt Salting & JWT Bearer Guards</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} color="var(--color-primary)" />
                <span>Node.js, Express & MongoDB Atlas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            &copy; {new Date().getFullYear()} LearnHub. Built by Ubaidullah for Synent Technologies Web Development Internship.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B' }}>
            Educational Project <Heart size={14} color="#EF4444" fill="#EF4444" /> Advanced Level
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

