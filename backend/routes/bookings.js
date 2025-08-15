import express from 'express';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendBookingConfirmationEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Create booking (protected)
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.userId;
    console.log('📌 Create booking request from userId:', userId, 'body:', req.body);

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ event: eventId, user: userId });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event' });
    }

    // Check if event is full (if capacity is set)
    if (event.capacity) {
      const bookedCount = await Booking.countDocuments({ event: eventId });
      if (bookedCount >= event.capacity) {
        return res.status(400).json({ message: 'Event is full' });
      }
    }

    // Generate a unique ticket ID
    const ticketId = 'EVT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create booking with ticketId and user ID
    const booking = await Booking.create({
      event: eventId,
      user: userId,
      dateBooked: new Date(),
      status: 'confirmed',
      ticketId
    });

    // Populate booking with event and user details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('event')
      .populate('user', 'name email');

    // Send confirmation email (don't fail if email fails)
    try {
      const bookingUser = await User.findById(userId).select('name email');
      await sendBookingConfirmationEmail(
        bookingUser.email,
        bookingUser.name,
        event.title,
        event.date,
        event.location,
        ticketId
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings (protected)
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.userId;
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name username profilePic' }
      })
      .populate('user', 'name email')
      .sort({ dateBooked: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (protected)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.userId;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name username profilePic' }
      })
      .populate('user', 'name email');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.userId;
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name username profilePic' }
      })
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for events created by the current user
router.get('/creator/bookings', protect, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.userId;
    const events = await Event.find({ createdBy: userId }).select('_id');
    const eventIds = events.map(event => event._id);

    const bookings = await Booking.find({ event: { $in: eventIds } })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name username profilePic' }
      })
      .populate('user', 'name email profilePic')
      .sort({ dateBooked: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get creator bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
