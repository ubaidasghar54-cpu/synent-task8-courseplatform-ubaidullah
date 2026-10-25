import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <BookOpen size={26} color="#FBBF24" />
          <span>Learn</span>Hub
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links (Desktop + Mobile Dropdown) */}
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/courses" className="nav-link" onClick={closeMenu}>Browse Courses</Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-courses" className="nav-link" onClick={closeMenu}>My Courses</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link" onClick={closeMenu} style={{ color: 'var(--color-accent)' }}>
                  <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Admin
                </Link>
              )}
              
              <div className="user-badge">
                <UserIcon size={14} />
                <span>{user?.name}</span>
                {isAdmin && <span className="role-pill">Admin</span>}
              </div>

              <button onClick={handleLogout} className="btn btn-outline-light" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light" onClick={closeMenu} style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-accent" onClick={closeMenu} style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
