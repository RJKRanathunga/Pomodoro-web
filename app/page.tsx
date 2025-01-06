"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from "react";

export default function Home() {
  const [minutes, setMinutes] = useState(25); // Pomodoro session starts with 25 minutes
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false); // Toggle between work and break
  const [completedPomodoros, setCompletedPomodoros] = useState(0); // Track completed Pomodoros
  const [completedBreaks, setCompletedBreaks] = useState(0); // Track completed Breaks

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Toggle between work and break
            if (isBreak) {
              setCompletedPomodoros((prev) => prev + 1); // Increment Pomodoro counter
            } else {
              setCompletedBreaks((prev) => prev + 1); // Increment Break counter
            }
            setIsBreak(!isBreak);
            setMinutes(isBreak ? 25 : 5); // 25 minutes for work, 5 for break
            setSeconds(0);
            setIsActive(false); // Stop the timer
          } else {
            setMinutes((prev) => prev - 1); // Decrease minutes
            setSeconds(59); // Reset seconds
          }
        } else {
          setSeconds((prev) => prev - 1); // Decrease seconds
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval); // Stop the timer when not active
    }

    return () => {
      if (interval) clearInterval(interval); // Cleanup on component unmount
    };
  }, [isActive, seconds, minutes, isBreak]);

  const startTimer = () => setIsActive(true);
  const stopTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25); // Reset to work or break session
    setSeconds(0);
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time); // Format time for display

  return (
    <div className="container">
      <div className="timer">
        <h1>{isBreak ? "Break" : "Pomodoro Timer"}</h1>
        <div className="time-display">
          <h2>
            {formatTime(minutes)}:{formatTime(seconds)}
          </h2>
        </div>
        <div className="controls">
          <button className="button" onClick={startTimer} disabled={isActive}>
            Start
          </button>
          <button className="button" onClick={stopTimer} disabled={!isActive}>
            Stop
          </button>
          <button className="button" onClick={resetTimer}>
            Reset
          </button>
        </div>
      </div>

      <div className="statistics">
        <h3>Statistics</h3>
        <p>Completed Pomodoros: {completedPomodoros}</p>
        <p>Completed Breaks: {completedBreaks}</p>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f4f4f9;
          flex-direction: column;
        }

        .timer {
          text-align: center;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
          margin-bottom: 20px;
        }

        h1 {
          font-size: 2rem;
          color: #333;
        }

        .time-display h2 {
          font-size: 3rem;
          font-weight: bold;
          margin: 20px 0;
          color: #2f80ed;
        }

        .controls {
          display: flex;
          justify-content: space-around;
        }

        .button {
          padding: 10px 20px;
          font-size: 1rem;
          color: #fff;
          background-color: #2f80ed;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .button:disabled {
          background-color: #ddd;
        }

        .button:hover:not(:disabled) {
          background-color: #1c6ed1;
        }

        .statistics {
          text-align: center;
          padding: 10px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .statistics h3 {
          margin-bottom: 10px;
          color: #333;
        }

        .statistics p {
          margin: 5px 0;
          font-size: 1.2rem;
          color: #333;
        }
      `}</style>
    </div>
  );
}
