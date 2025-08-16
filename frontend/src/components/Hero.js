import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';
import mas2Image from '../assets/mas2.png';
import './Hero.css';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-image-left-container">
            <img src={heroImage} alt="Event illustration" className="hero-image hero-image-left" />
          </div>
          <div className="hero-content">
            <p className="hero-subtitle">
              Your next great experience is just a click away. Find and create unforgettable events with ease.
            </p>
            <div className="hero-buttons">
              <Link to={isAuthenticated ? "/events" : "/signup"} className="btn btn-bw btn-lg">
                {isAuthenticated ? "Explore Events" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-image-right-container">
            <img src={mas2Image} alt="Event attendees" className="hero-image hero-image-right" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
