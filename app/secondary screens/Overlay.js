import React from 'react';
import './overlayStyles.css'

const Overlay = ({ isOverlayVisible, toggleOverlay }) => {
  const timelineData = [
    { time: '09:00', type: 'work' },
    { time: '09:25', type: 'break' },
    { time: '09:30', type: 'work' },
    { time: '09:55', type: 'break' },
    // Add more data as needed
  ];

  return (
    isOverlayVisible && (
      <div className="overlay">
        <div className="overlay-content">
          <h2>Report</h2>
          <button className="close-button" onClick={toggleOverlay}>Close</button>
          <div className="timeline">
            {timelineData.map((entry, index) => (
              <div key={index} className={`timeline-entry ${entry.type}`}>
                <span className="timeline-time">{entry.time}</span>
                <span className="timeline-type">{entry.type === 'work' ? 'Work' : 'Break'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Overlay;