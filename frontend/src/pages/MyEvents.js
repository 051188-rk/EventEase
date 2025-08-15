import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import DecorativeModal from "../components/DecorativeModal";
import axios from "axios";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [bookingsByEvent, setBookingsByEvent] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch my events on load
  useEffect(() => {
    fetchMyEvents();
    fetchCreatorBookings();
  }, []);

  const fetchCreatorBookings = async () => {
    try {
      const res = await axios.get("/api/bookings/creator/bookings");
      const grouped = {};
      res.data.forEach((booking) => {
        const eid = booking.event._id;
        if (!grouped[eid]) grouped[eid] = [];
        grouped[eid].push(booking);
      });
      setBookingsByEvent(grouped);
    } catch (err) {
      console.error("Error fetching creator bookings:", err);
    }
  };

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/events/user/my-events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(eventId);
      await axios.delete(`/api/events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setDeletingId(null);
    }
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                My Events
              </h1>
              <p className="text-text-secondary">
                Manage the events you've created
              </p>
            </div>
            <Link to="/create-event" className="btn">
              Create New Event
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-text-secondary"
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
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No events created yet
            </h3>
            <p className="text-text-secondary mb-6">
              You haven't created any events yet. Start by creating your first
              event!
            </p>
            <Link to="/create-event" className="btn">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="relative group">
                <EventCard event={event} />

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <div className="flex gap-3">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn btn-outline border-white text-white hover:bg-white hover:text-black"
                    >
                      View
                    </Link>
                    <Link
                      to={`/events/${event._id}/edit`}
                      className="btn btn-outline border-white text-white hover:bg-white hover:text-black"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      disabled={deletingId === event._id}
                      className={`btn bg-red-600 border-red-600 text-white hover:bg-red-700 ${
                        deletingId === event._id ? "loading" : ""
                      }`}
                    >
                      {deletingId === event._id ? (
                        <>
                          <div className="spinner mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </button>
                    <button
                      className="btn btn-accent border-accent text-white hover:bg-accent-dark"
                      onClick={() => {
                        setSelectedEvent(event);
                        setModalOpen(true);
                      }}
                    >
                      View Bookings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Modal */}
      {selectedEvent && (
        <DecorativeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Bookings for ${selectedEvent.title}`}
          icon={
            <svg
              className="w-8 h-8 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2a4 4 0 018 0v2m-4-4a4 4 0 100-8 4 4 0 000 8zm6 4v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2a2 2 0 012-2h10a2 2 0 012 2z"
              />
            </svg>
          }
          message={(() => {
            const bookings = bookingsByEvent[selectedEvent._id] || [];
            if (bookings.length === 0)
              return "No bookings yet for this event.";
            return (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Ticket ID</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-b">
                        <td className="py-2 px-3">{b.user?.name}</td>
                        <td className="py-2 px-3">{b.user?.email}</td>
                        <td className="py-2 px-3 font-mono">{b.ticketId}</td>
                        <td className="py-2 px-3">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
          buttonText="Close"
        />
      )}
    </div>
  );
};

export default MyEvents;
