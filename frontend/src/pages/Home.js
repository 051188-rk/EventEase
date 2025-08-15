import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import axios from 'axios';

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
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="container">
            <h1 className="hero-title">
              DISCOVER AMAZING
              <span className="d-block">EVENTS</span>
            </h1>
            <p className="hero-subtitle">
              Join the most exciting events in your area. From concerts to workshops, 
              find and book events that match your interests.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/events" className="btn btn-primary btn-lg">
                    Browse Events
                  </Link>
                  <Link to="/create-event" className="btn btn-secondary btn-lg">
                    Create Event
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/events" className="btn btn-secondary btn-lg">
                    Browse Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-surface">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose EventEase?</h2>
            <p>Experience the best event management platform with powerful features</p>
          </div>
          <div className="grid grid-3">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full d-flex align-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl text-bold text-primary mb-2">Easy Booking</h3>
              <p className="text-secondary">
                Book events with just a few clicks. Get instant confirmations and reminders.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full d-flex align-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl text-bold text-primary mb-2">Local Events</h3>
              <p className="text-secondary">
                Discover events happening in your area. Never miss out on local happenings.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full d-flex align-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl text-bold text-primary mb-2">Secure & Reliable</h3>
              <p className="text-secondary">
                Your data is safe with us. Secure payments and reliable event management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="section">
        <div className="container">
          <div className="d-flex align-center justify-between mb-8">
            <h2 className="text-3xl text-bold text-primary">
              Featured Events
            </h2>
            <Link to="/events" className="btn btn-ghost">
              View All Events
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-3">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3 className="empty-state-title">No Events Available</h3>
              <p className="empty-state-text">
                No events are currently available at the moment.
              </p>
              {isAuthenticated && (
                <Link to="/create-event" className="btn btn-primary">
                  Create the First Event
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary">
        <div className="container">
          <div className="text-center container-sm">
            <h2 className="text-3xl text-bold text-secondary mb-6">
              Ready to Start Your Event Journey?
            </h2>
            <p className="text-lg text-secondary mb-8 opacity-90">
              Join thousands of users who are already discovering and creating amazing events.
            </p>
            {!isAuthenticated && (
              <div className="hero-buttons">
                <Link to="/signup" className="btn btn-secondary btn-lg">
                  Sign Up Now
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg text-secondary">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 