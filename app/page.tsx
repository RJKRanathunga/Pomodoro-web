"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from "react";
import "./styles.css";

export default function Home() {
  // Variables
  const [minutes, setMinutes] = useState(25); // Pomodoro session starts with 25 minutes
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [type, setType] = useState("Pomodoro");
  const [cycleWithinBatch, setCycleWithinBatch] = useState(0);


  // UseEffects
  useEffect(() => {
    const endTime = localStorage.getItem("endTime");
    const remainingTime = localStorage.getItem("remainingTime");
    const prevType = localStorage.getItem("type");
    const lastInteraction = localStorage.getItem("lastInteraction");
    setType(prevType || "Pomodoro");
   
    if (lastInteraction) {
      const lastInteractionTime = new Date(lastInteraction).getTime();
      const currentTime = new Date().getTime();
      const duration = currentTime - lastInteractionTime;
      if (duration > 5*60*1000) {
        resetType("Pomodoro");
      } else if (duration > 25*60*1000) {
        resetType("Pomodoro");
        setCycleWithinBatch(0);
      }
    }  else if (remainingTime) {
      const time = parseInt(remainingTime);
      setMinutes(Math.floor(time / 60000));
      setSeconds(Math.floor((time % 60000) / 1000));
    }else if (endTime) {
      const remainingTime = Math.max(0, new Date(endTime).getTime() - new Date().getTime());
      if (remainingTime > 0) {
        setIsActive(true);
        setMinutes(Math.floor(remainingTime / 60000));
        setSeconds(Math.floor((remainingTime % 60000) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive) {
      const endTime = new Date().getTime() + minutes * 60000 + seconds * 1000;
      localStorage.setItem("endTime", new Date(endTime).toISOString());

      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer ends (Pomodoro or Break)
            gotoNextType();
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
  }, [isActive, seconds, minutes]);

  // Functions
  const startTimer = () => {
    setIsActive(true)
    const endTime = new Date().getTime() + minutes * 60000 + seconds * 1000;
    localStorage.setItem("endTime", new Date(endTime).toISOString());
    localStorage.setItem("lastInteraction", new Date().toISOString());
  };
  const pauseTimer = () => {
    localStorage.setItem("remainingTime", (minutes * 60000 + seconds * 1000).toString());
    setIsActive(false);
    localStorage.setItem("lastInteraction", new Date().toISOString());
  };
  const resetTimer = () => {
    resetType(type);
  };

  const formatTime = (time: number) => (time < 10 ? `0${time}` : time); // Format time for display

  const gotoNextType = () => {
    if (type === "Pomodoro") {
      setCycleWithinBatch((prev) => {
        const newCycle = prev + 1;
        if (newCycle === 4) {
          resetType("Long break");
          return 0;
        }
        resetType("Short break");
        return newCycle;
      });
    } else {
      resetType("Pomodoro");
    }
    localStorage.removeItem("lastInteraction");
  }

  const resetType = (newType:string) => {
    localStorage.setItem("type", newType);
    localStorage.removeItem("endTime");
    localStorage.removeItem("remainingTime");
    setType(newType);
    if (newType === "Pomodoro") {
      setMinutes(25);
    } else if (newType === "Short break") {
      setMinutes(5);
    } else {
      setMinutes(15);
    }
    setSeconds(0);
    setIsActive(false); // Stop the timer
  }

  const getBackgroundColor = () => {
    if (type === "Pomodoro") {
      return "#ba4949";
    } else if (type === "Short break") {
      return "#38858a";
    } else {
      return "#397097";
    }
  }

  return (
    <div className="container" style={{backgroundColor: getBackgroundColor()}}>
      <div className="header">
        <div className="box" onClick={()=>resetType("Pomodoro")}>
          <h3>Pomodoro</h3>
        </div>
        <div className="box" onClick={()=>resetType("Short break")}>
          <h3>Short break</h3>
        </div>
        <div className="box" onClick={()=>resetType("Long break")}>
          <h3>Long break</h3>
        </div>
      </div>
      <div className="timer">
        <h1>{type}</h1>
        <div className="time-display">
          <h2>
            {formatTime(minutes)}:{formatTime(seconds)}
          </h2>
        </div>
        <div className="controls">
          <button className="button" onClick={startTimer} disabled={isActive}>
            Start
          </button>
          <button className="button" onClick={pauseTimer} disabled={!isActive}>
            Pause
          </button>
          <button className="button" onClick={resetTimer}>
            Reset
          </button>
        </div>
      </div>

      <div className="statistics">
        <h2>Statistics</h2>
        <div className="statistics-box">
          <h3>Cycles within batch: {cycleWithinBatch}</h3>
        </div>
      </div>
    </div>
  );
}

