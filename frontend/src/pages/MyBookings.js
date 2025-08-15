import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DecorativeModal from '../components/DecorativeModal';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ open: false, ticketId: '', eventTitle: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
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

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    if (status === 'confirmed') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (status === 'cancelled') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

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

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Bookings</h1>
          <p className="text-text-secondary">
            Manage your event bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No bookings yet</h3>
            <p className="text-text-secondary mb-6">
              You haven't booked any events yet. Start exploring events to make your first booking!
            </p>
            <Link to="/events" className="btn">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 md:grid-2 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  {booking.event.image ? (
                    <img
                      src={booking.event.image}
                      alt={booking.event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-event.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                      <svg className="w-16 h-16 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-accent text-bg-primary px-3 py-1 rounded-full text-sm font-medium">
                      {formatPrice(booking.event.price)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {booking.event.title}
                  </h3>
                  {booking.ticketId && (
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 font-mono rounded px-2 py-1 text-xs">
                        Ticket ID: {booking.ticketId}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(booking.event.date)}</span>
                    </div>
                    {booking.event.location && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{booking.event.location}</span>
                      </div>
                    )}
                  </div>
                  {booking.event.createdBy && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-bg-secondary rounded-lg">
                      <img
                        src={booking.event.createdBy.profilePic || '/default-avatar.png'}
                        alt={booking.event.createdBy.name}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <span className="text-sm text-text-secondary">
                        by {booking.event.createdBy.name}
                      </span>
                    </div>
                  )}
                  <div className="mb-4 p-2 bg-bg-secondary rounded-lg">
                    <p className="text-sm text-text-secondary">
                      Booked on: {formatDate(booking.dateBooked)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/events/${booking.event._id}`}
                      className="btn btn-outline flex-1"
                    >
                      View Event
                    </Link>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className={`btn btn-secondary flex-1 ${cancellingId === booking._id ? 'loading' : ''}`}
                      >
                        {cancellingId === booking._id ? (
                          <>
                            <div className="spinner mr-2"></div>
                            Cancelling...
                          </>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Confirmation Modal */}
        <DecorativeModal
          isOpen={confirmationModal.open}
          onClose={() => setConfirmationModal({ open: false, ticketId: '', eventTitle: '' })}
          title="Booking Confirmed!"
          icon={<span role="img" aria-label="ticket">🎟️</span>}
          message={
            <div>
              <p>Your booking for <b>{confirmationModal.eventTitle}</b> is confirmed!</p>
              <p>Your Ticket ID:</p>
              <div className="font-mono text-lg bg-gray-100 rounded px-3 py-2 inline-block mt-2 mb-2">
                {confirmationModal.ticketId}
              </div>
              <p>Check your email for more details.</p>
            </div>
          }
          buttonText="Close"
        />
      </div>
    </div>
  );
};

export default MyBookings;
