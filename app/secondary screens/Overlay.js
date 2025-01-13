import React from 'react';
import './overlayStyles.css'

const Overlay = ({ isOverlayVisible, toggleOverlay }) => {
  const workTimes = [
    { start: 352, end: 359 },
    { start: 456, end: 557 },
    { start: 657, end: 757 },
    { start: 865, end: 965 }
  ];

  const totalMinutesInDay = 24 * 60;

  return (
    isOverlayVisible && (
      <div className="overlay">
        <div className="overlay-content">
          <h2>Report</h2>
          <button className="close-button" onClick={toggleOverlay}>Close</button>
          <div className="timeline-container">
            <div className="timeline">
              {Array.from({ length: totalMinutesInDay }, (_, index) => {
                const isWorkTime = workTimes.some(
                  (workTime) => index >= workTime.start && index <= workTime.end
                );
                return (
                  <div
                    key={index}
                    className={`timeline-segment ${isWorkTime ? 'work' : 'break'}`}
                  ></div>
                );
              })}
              {Array.from({ length: 24 }, (_, index) => (
                <div key={index} className="timeline-hour-line"></div>
              ))}
            </div>
            <div className="timeline-hours">
              {Array.from({ length: 24 }, (_, index) => (
                <div key={index} className="timeline-hour">
                  {index}:00
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Overlay;