import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import axios from 'axios';
import './Home.css'; // <-- Add this import

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        // Get the latest 6 events as featured
        setFeaturedEvents(response.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Connect, Experience, Celebrate</h1>
          <p className="hero-subtitle">
            Find and create unforgettable events. Your next great experience is just a click away.
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/events" className="btn btn-primary btn-lg">
                Explore Events
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Us?</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Discover Events</h3>
              <p>Effortlessly find local and online events that match your interests.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <h3>Seamless Booking</h3>
              <p>Secure your spot in seconds with our easy-to-use booking system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h3>Create & Host</h3>
              <p>Organize and manage your own events with our powerful hosting tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Events</h2>
            <Link to="/events" className="btn-view-all">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-spinner"></div>
          ) : featuredEvents.length > 0 ? (
            <div className="events-grid">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Featured Events</h3>
              <p>Check back soon for exciting new events!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;