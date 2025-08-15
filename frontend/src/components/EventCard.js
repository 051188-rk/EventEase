import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
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

  return (
    <div className="event-card">
      {/* Event Image */}
      <div className="event-image">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/default-event.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-border d-flex align-center justify-center">
            <svg
              className="w-16 h-16 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="position-absolute top-3 right-3">
          <span className="bg-primary text-secondary px-3 py-1 rounded-full text-sm text-bold">
            {formatPrice(event.price)}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="event-content">
        <h3 className="event-title">
          {event.title}
        </h3>
        
        <p className="event-description">
          {event.description || 'No description available'}
        </p>

        {/* Event Details */}
        <div className="event-meta">
          <div className="event-meta-item">
            <svg className="event-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          
          {event.location && (
            <div className="event-meta-item">
              <svg className="event-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          )}
          
          {event.capacity && (
            <div className="event-meta-item">
              <svg className="event-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
        </div>

        {/* Organizer Info */}
        {event.createdBy && (
          <div className="d-flex align-center gap-2 mb-4 p-2 bg-surface rounded">
            <img
              src={event.createdBy.profilePic || '/default-avatar.png'}
              alt={event.createdBy.name}
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <span className="text-sm text-secondary">
              by {event.createdBy.name}
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="event-footer">
          <Link
            to={`/events/${event._id}`}
            className="btn btn-primary w-full text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 