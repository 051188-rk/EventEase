import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';
import upload from '../utils/uploadImage.js';

const router = express.Router();

// Debug endpoint to list all events with full details
router.get('/debug/all', async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('createdBy', 'name username email')
      .lean();
      
    // Convert all ObjectIds to strings for better readability
    const eventsWithStrings = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      createdBy: event.createdBy ? {
        ...event.createdBy,
        _id: event.createdBy._id.toString()
      } : null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    
    res.json({
      count: eventsWithStrings.length,
      events: eventsWithStrings
    });
  } catch (error) {
    console.error('Debug get all events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name username profilePic');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (protected)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, location, price, capacity } = req.body;

    const eventData = {
      title,
      description,
      date,
      location,
      price: price ? Number(price) : null,
      capacity: capacity ? Number(capacity) : null,
      createdBy: req.user._id
    };

    // Add image URL if uploaded
    if (req.file) {
      eventData.image = req.file.path;
    }

    const event = await Event.create(eventData);
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name username profilePic');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (protected, owner only)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, description, date, location, price, capacity } = req.body;

    const updateData = {
      title,
      description,
      date,
      location,
      price: price ? Number(price) : null,
      capacity: capacity ? Number(capacity) : null
    };

    // Add image URL if new image uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name username profilePic');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (protected, owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events by user (protected)
router.get('/user/my-events', protect, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .populate('createdBy', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 