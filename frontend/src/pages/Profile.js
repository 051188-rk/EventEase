import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.put('/api/auth/profile', {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null
      }, { withCredentials: true });

      if (response.data.success) {
        setUser(response.data.user);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage(error.response?.data?.error || 'Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await axios.put('/api/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setMessage('Profile picture updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage(error.response?.data?.error || 'Failed to upload image');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">
            Manage your account settings and profile information
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <div className="container">
          <div className="layout-sidebar">
            {/* Sidebar */}
            <div className="sidebar">
              <h3 className="sidebar-title">Profile Picture</h3>
              <div className="text-center">
                <div className="position-relative d-inline-block">
                  <img
                    src={user?.profilePic || '/default-avatar.png'}
                    alt={user?.name}
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  {isUploading && (
                    <div className="position-absolute inset-0 d-flex align-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <label htmlFor="profilePic" className="form-file">
                    <input
                      type="file"
                      id="profilePic"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="d-none"
                    />
                    <div className="form-file-label">
                      {isUploading ? 'Uploading...' : 'Change Picture'}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Profile Information</h2>
                  <p className="card-subtitle">
                    Update your personal information and account details
                  </p>
                </div>

                <div className="card-body">
                  {/* Success/Error Message */}
                  {message && (
                    <div className={`mb-6 p-4 rounded ${message.includes('successfully') ? 'bg-success text-white' : 'bg-error text-white'}`}>
                      {message}
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                            placeholder="Enter your full name"
                            disabled={isSubmitting}
                          />
                          {errors.name && (
                            <div className="form-error">{errors.name}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${errors.username ? 'is-invalid' : ''}`}
                            placeholder="Choose a username"
                            disabled={isSubmitting}
                          />
                          {errors.username && (
                            <div className="form-error">{errors.username}</div>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter your email"
                            disabled={isSubmitting}
                          />
                          {errors.email && (
                            <div className="form-error">{errors.email}</div>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="Enter your phone number"
                            disabled={isSubmitting}
                          />
                          {errors.phone && (
                            <div className="form-error">{errors.phone}</div>
                          )}
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn btn-ghost"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="grid grid-2 gap-6">
                        <div>
                          <label className="form-label">Full Name</label>
                          <p className="text-lg text-primary">{user?.name}</p>
                        </div>
                        <div>
                          <label className="form-label">Username</label>
                          <p className="text-lg text-primary">@{user?.username}</p>
                        </div>
                        <div>
                          <label className="form-label">Email</label>
                          <p className="text-lg text-primary">{user?.email}</p>
                        </div>
                        <div>
                          <label className="form-label">Phone Number</label>
                          <p className="text-lg text-primary">{user?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn btn-primary"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;