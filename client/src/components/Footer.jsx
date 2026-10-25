import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, ShieldCheck, CheckCircle2, Code2 } from 'lucide-react';

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
              Online course platform built with React, Node.js, Express, MongoDB, and Razorpay test payments.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#1E293B', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              Synent Technologies Internship &bull; Task 8
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/my-courses" style={{ color: '#94A3B8', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#FFFFFF'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>
                  My Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Features / Tech */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Highlights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>Razorpay Test Integration</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>JWT Authentication & Protected Routes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} color="var(--color-primary)" />
                <span>React, Express & MongoDB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            &copy; {new Date().getFullYear()} LearnHub &bull; Created by Ubaidullah
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B' }}>
            Internship Project <Heart size={14} color="#EF4444" fill="#EF4444" /> Advanced Level
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
