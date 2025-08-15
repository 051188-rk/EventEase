import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    capacity: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files[0]) {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(`${formData.date}T${formData.time || '00:00'}`);
      if (selectedDate < new Date()) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }
    
    if (formData.price && isNaN(formData.price)) {
      newErrors.price = 'Price must be a valid number';
    }
    
    if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 1)) {
      newErrors.capacity = 'Capacity must be a valid number greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const eventData = new FormData();
      eventData.append('title', formData.title.trim());
      eventData.append('description', formData.description.trim());
      eventData.append('date', `${formData.date}T${formData.time}`);
      eventData.append('location', formData.location.trim());
      eventData.append('price', formData.price || '0');
      eventData.append('capacity', formData.capacity || '');
      
      if (formData.image) {
        eventData.append('image', formData.image);
      }
      
      const response = await axios.post('/api/events', eventData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate(`/events/${response.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary py-8">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Event</h1>
            <p className="text-text-secondary">
              Share your event with the world
            </p>
          </div>

          <div className="card">
            {errors.submit && (
              <div className="error mb-6">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter event title"
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="Describe your event..."
                  disabled={isSubmitting}
                  rows="4"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`form-input ${errors.date ? 'border-red-500' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isSubmitting}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`form-input ${errors.time ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter event location"
                  disabled={isSubmitting}
                />
              </div>

              {/* Price and Capacity */}
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="0 (Free)"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="capacity" className="form-label">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`form-input ${errors.capacity ? 'border-red-500' : ''}`}
                    placeholder="No limit"
                    min="1"
                    disabled={isSubmitting}
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  Event Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleChange}
                  className="form-input"
                  accept="image/*"
                  disabled={isSubmitting}
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`btn flex-1 ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Creating Event...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="btn btn-secondary flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 