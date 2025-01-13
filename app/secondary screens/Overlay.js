import React from 'react';
import './overlayStyles.css';

const Overlay = ({ isOverlayVisible, toggleOverlay, workTimeSegments }) => {
  // const workTimeSegments = [
  //   {"start": 156,"end": 256},
  //   {"start": 356,"end": 456},
  //   {"start": 556,"end": 656},
  //   {"start": 762,"end": 0},
  //   {"start": 1395,"end": 0}
  // ]

  const totalMinutesInDay = 24 * 60;

  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimePosition = (currentMinutes / totalMinutesInDay) * 100;

  const workTimes = workTimeSegments.map(({ start, end }) => { // In case user close the app without 
  // stopping the timer or user is working at the moment
    if (end === 0) {
      const endTime = Math.min(start + 25, currentMinutes);
      return { start, end: endTime };
    }
    return { start, end };
  });

  const totalWorkMinutes = workTimes.reduce((sum, { start, end }) => sum + (end - start), 0);
  const totalWorkHours = Math.floor(totalWorkMinutes / 60);
  const remainingMinutes = totalWorkMinutes % 60;

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
              {Array.from({ length: 25 }, (_, index) => (
                <div key={index} className="timeline-hour-line" style={{ left: `${(index / 24) * 100}%` }}></div>
              ))}
              <div className="current-time-marker" style={{ left: `${currentTimePosition}%` }}></div>
            </div>
            <div className="timeline-hours">
              {Array.from({ length: 25 }, (_, index) => (
                <div key={index} className="timeline-hour">
                  {index}:00
                </div>
              ))}
            </div>
            <div className="total-work-time">
              Total Work Time Today: {totalWorkHours}h {remainingMinutes}m
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Overlay;