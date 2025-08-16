import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="EventEase Logo" className="navbar-logo" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-nav">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/events" className="nav-link">
              Events
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/create-event" className="nav-link">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="nav-link">
                  My Bookings
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right side - Theme toggle and user menu */}
        <div className="d-flex align-center gap-4">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="navbar-user modern-navbar-user" tabIndex={0}>
              <button
                className="avatar-btn"
                onClick={toggleMenu}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                tabIndex={0}
                style={{ background: 'none', border: 'none', padding: 0, marginRight: 8 }}
              >
                <img
                  src={user?.profilePic || 'https://ui-avatars.com/api/?name=User&background=eee&color=888&size=128'}
                  alt={user?.name || 'Profile'}
                  className="user-avatar navbar-avatar-large"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                  style={{ width: 48, height: 48, border: '2px solid #e0e0e0', boxShadow: '0 1px 6px rgba(0,0,0,0.10)' }}
                />
              </button>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">User</span>
              </div>
              {/* Dropdown Menu */}
              <div className="profile-dropdown-anchor">
                <div
                  ref={dropdownRef}
                  className={`profile-dropdown-menu ${isMenuOpen ? 'open' : ''}`}
                  tabIndex={-1}
                  style={{ minWidth: 180, right: 0, top: 60, position: 'absolute', background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #eee', zIndex: 999, opacity: isMenuOpen ? 1 : 0, pointerEvents: isMenuOpen ? 'auto' : 'none', transform: isMenuOpen ? 'translateY(0)' : 'translateY(-8px)', transition: 'opacity 0.2s, transform 0.2s' }}
                  onKeyDown={e => { if (e.key === 'Escape') setIsMenuOpen(false); }}
                  onBlur={() => setIsMenuOpen(false)}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      console.log('Dropdown: navigating to /profile');
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <svg width="18" height="18" style={{ marginRight: 8, verticalAlign: 'middle' }} fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
                    Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      console.log('Dropdown: navigating to /my-events');
                      navigate('/my-events');
                      setIsMenuOpen(false);
                    }}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <svg width="18" height="18" style={{ marginRight: 8, verticalAlign: 'middle' }} fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
                    My Events
                  </button>
                  <hr style={{ margin: '8px 0', borderColor: '#eee' }} />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                    style={{ color: '#e74c3c', fontWeight: 700 }}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    <svg width="18" height="18" style={{ marginRight: 8, verticalAlign: 'middle' }} fill="none" stroke="#e74c3c" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"/><rect x="3" y="5" width="4" height="14" rx="2"/></svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link
                to="/login"
                className="btn btn-ghost"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="navbar-mobile-toggle"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`navbar-mobile ${isMenuOpen ? 'active' : ''}`}>
        <div className="navbar-mobile-header">
          <Link to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
            EventEase
          </Link>
          <button
            onClick={toggleMenu}
            className="navbar-mobile-close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <ul className="navbar-mobile-nav">
          <li>
            <Link
              to="/"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/events"
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link
                  to="/create-event"
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="nav-link w-full text-left"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>

        {!isAuthenticated && (
          <div className="navbar-mobile-user">
            <div className="navbar-auth">
              <Link
                to="/login"
                className="btn btn-ghost w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 