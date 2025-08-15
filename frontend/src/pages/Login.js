import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '', // can be email or username
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, googleLogin, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    clearError();
  }, [clearError]);

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
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.identifier, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="page bg-surface">
      <div className="container-sm">
        <div className="d-flex align-center justify-center min-h-screen py-12">
          <div className="card w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-bold text-primary mb-2">Welcome Back</h1>
              <p className="text-secondary">
                Sign in to your EventEase account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="form-error mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email/Username Field */}
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  Email or Username
                </label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className={`form-input ${errors.identifier ? 'is-invalid' : ''}`}
                  placeholder="Enter your email or username"
                  disabled={isSubmitting}
                />
                {errors.identifier && (
                  <div className="form-error">{errors.identifier}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <div className="form-error">{errors.password}</div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 d-flex align-center">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-secondary text-sm">or</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            {/* Google Login */}
            <div className="mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                size="large"
                width="100%"
                text="continue_with"
              />
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-secondary">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 