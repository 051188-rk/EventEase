import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Event not found or has been removed');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);
      setSuccessMessage('');

      await axios.post('/api/bookings', { eventId: id });
      
      setSuccessMessage('Booking successful! Check your email for confirmation.');
      
      // Refresh event data to update booking status
      fetchEvent();
    } catch (error) {
      const message = error.response?.data?.message || 'Booking failed. Please try again.';
      setError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `$${price}`;
  };

  const isEventOwner = event?.createdBy?._id === user?._id;
  const isEventPast = event && new Date(event.date) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary py-8">
        <div className="container">
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-bg-secondary py-8">
        <div className="container">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Event Not Found</h1>
            <p className="text-text-secondary mb-6">{error || 'The event you are looking for does not exist.'}</p>
            <Link to="/events" className="btn">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/events" className="text-accent hover:underline">
            ← Back to Events
          </Link>
        </nav>

        <div className="grid grid-1 lg:grid-2 gap-8">
          {/* Event Image */}
          <div className="lg:order-1">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/default-event.jpg';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="lg:order-2">
            <div className="card">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-text-primary">{event.title}</h1>
                  <span className="bg-accent text-bg-primary px-4 py-2 rounded-full text-lg font-semibold">
                    {formatPrice(event.price)}
                  </span>
                </div>
                
                {isEventOwner && (
                  <div className="mb-4 p-3 bg-bg-secondary rounded-lg">
                    <p className="text-text-secondary text-sm">
                      You are the organizer of this event
                    </p>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="error mb-4">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="success mb-4">
                  {successMessage}
                </div>
              )}

              {/* Event Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-text-primary font-medium">{formatDate(event.date)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-text-primary">{event.location}</span>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-text-primary">Capacity: {event.capacity} people</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">About this event</h3>
                  <p className="text-text-secondary leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Organizer */}
              {event.createdBy && (
                <div className="mb-6 p-4 bg-bg-secondary rounded-lg">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Organizer</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={event.createdBy.profilePic || '/default-avatar.png'}
                      alt={event.createdBy.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <p className="font-medium text-text-primary">{event.createdBy.name}</p>
                      <p className="text-sm text-text-secondary">@{event.createdBy.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Button */}
              {!isEventOwner && !isEventPast && (
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className={`btn w-full ${bookingLoading ? 'loading' : ''}`}
                >
                  {bookingLoading ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    `Book Event - ${formatPrice(event.price)}`
                  )}
                </button>
              )}

              {isEventPast && (
                <div className="p-4 bg-bg-secondary rounded-lg text-center">
                  <p className="text-text-secondary">This event has already passed</p>
                </div>
              )}

              {isEventOwner && (
                <div className="flex gap-3">
                  <Link to={`/events/${event._id}/edit`} className="btn btn-outline flex-1">
                    Edit Event
                  </Link>
                  <button className="btn btn-secondary flex-1">
                    View Bookings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 