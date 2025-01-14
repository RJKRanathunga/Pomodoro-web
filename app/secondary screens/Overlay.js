import React from 'react';
import './overlayStyles.css';
import { fetchLast7DaysData } from '../data/store data';

const Overlay = ({ isOverlayVisible, toggleOverlay }) => {

  // workTimeSegments = [
  //   {"start": 156,"end": 256},
  //   {"start": 356,"end": 456},
  //   {"start": 556,"end": 656},
  //   {"start": 762,"end": 0},
  //   {"start": 1395,"end": 0}
  // ]

  const workTimeSegments_for7days = fetchLast7DaysData();
  // const workTimeSegments_for7days = {
  //   dayReport_20250114: null,
  //   dayReport_20250113: [
  //   {"start": 156,"end": 256},
  //   {"start": 356,"end": 456},
  //   {"start": 556,"end": 656},
  //   {"start": 762,"end": 0},
  //   {"start": 1395,"end": 0}
  // ],
  //   dayReport_20250112: null,
  //   dayReport_20250111: null,
  //   dayReport_20250110: null,
  //   dayReport_20250109: null,
  //   dayReport_20250108: null
  // }

  const totalMinutesInDay = 24 * 60;

  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimePosition = (currentMinutes / totalMinutesInDay) * 100;

  // const workTimes = workTimeSegments.map(({ start, end }) => { // In case user close the app without 
  // // stopping the timer or user is working at the moment
  //   if (end === 0) {
  //     const endTime = Math.min(start + 25, currentMinutes);
  //     return { start, end: endTime };
  //   }
  //   return { start, end };
  // });



  function getDate_byKey(key) {
    const datePart = key.split('_')[1];
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  return (
    isOverlayVisible && (
      <div className="overlay">
        <div className="overlay-content">
          <h2>Report</h2>
          <button className="close-button" onClick={toggleOverlay}>Close</button>
          <div className="timeline-container">
            {Object.keys(workTimeSegments_for7days).map((key) => {

              const reportDay = key.split('_')[1];
              const todayDay = currentTime.toISOString().split('T')[0].split('-').join('');
              const workTimeSegments = workTimeSegments_for7days[key];
              const workTimes = workTimeSegments ? workTimeSegments.map(({ start, end }) => {
                if (end === 0) {
                  const endTime =reportDay===todayDay ? Math.min(start + 25, currentMinutes) : Math.min(start+25, totalMinutesInDay);
                  return { start, end: endTime };
                }
                return { start, end };
              }) : [];

              const totalWorkMinutes = workTimes.reduce((sum, { start, end }) => sum + (end - start), 0);
              const totalWorkHours = Math.floor(totalWorkMinutes / 60);
              const remainingMinutes = totalWorkMinutes % 60;

              return(
                <div key={key} className='day-report'>
                  <h3>{getDate_byKey(key)}</h3>
                  {workTimeSegments ? (
                    <div>
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
                      {reportDay === todayDay && <div className="current-time-marker" style={{ left: `${currentTimePosition}%` }}></div>}
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
                  ):(
                    <h3>No data</h3>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  );
};

export default Overlay;