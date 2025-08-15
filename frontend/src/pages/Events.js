import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import axios from 'axios';
import './Events.css';

const Events = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || new Date(event.date) >= new Date(filterDate);
    
    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="d-flex flex-column md:flex-row md:align-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="page-title">All Events</h1>
              <p className="page-subtitle">
                Discover amazing events happening around you
              </p>
            </div>
            {isAuthenticated && (
              <Link to="/create-event" className="btn btn-primary">
                Create Event
              </Link>
            )}
          </div>

          {/* Search and Filter */}
          <div className="d-flex flex-column md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="md:w-48">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="form-input"
                min={formatDate(new Date())}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <div className="container">
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-secondary">
              {loading ? 'Loading events...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-3">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">No Events Found</h3>
              <p className="empty-state-text">
                {searchTerm || filterDate 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No events are currently available'
                }
              </p>
              {isAuthenticated && (
                <Link to="/create-event" className="btn btn-primary">
                  Create the First Event
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events; 