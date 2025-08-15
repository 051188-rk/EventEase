import React from 'react';
import './DecorativeModal.css';

const DecorativeModal = ({ isOpen, onClose, title, message, icon, buttonText = 'OK', onButtonClick }) => {
  if (!isOpen) return null;

  return (
    <div className="decorative-modal-overlay">
      <div className="decorative-modal">
        <div className="decorative-modal-header">
          {icon && <span className="decorative-modal-icon">{icon}</span>}
          <h2>{title}</h2>
        </div>
        <div className="decorative-modal-body">
          <p>{message}</p>
        </div>
        <div className="decorative-modal-footer">
          <button
            className="decorative-modal-btn"
            onClick={() => {
              if (onButtonClick) onButtonClick();
              onClose();
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecorativeModal;
