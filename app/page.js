"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from "react";
import "./styles.css";
import "./Advance styles/animations.css"
import { sendMessageToApp,showNotification } from "./utils/output Methods";
import { GrPowerReset } from "react-icons/gr";
import { addStartTime,addEndTime,fetch_today_report_data } from "./data/store data";
import Overlay from "./secondary screens/Report/Overlay";
import SettingsOverlay from "./secondary screens/Settings/SettingsOverlay"

export default function Home() {
  // Variables
  const [type, setType] = useState("Pomodoro"); // Pomodoro, Short break, Long break
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState(0);

  const [minutes, setMinutes] = useState(25); // Pomodoro session starts with 25 minutes
  const [seconds, setSeconds] = useState(0);

  const [cycleWithinBatch, setCycleWithinBatch] = useState(0);
  const [, setActiveTimeSegments] = useState([]); // activeTimeSegments is used to store the start and end time of each session. It is not used in the UI but is required for the data store

  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // State for overlay visibility
  const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State for loading spinner

  const getInitialSettings = () => {
    if (typeof window !== 'undefined') {
      return {
        pomodoroTime: localStorage.getItem('pomodoroTime') || 25,
        shortBreakTime: localStorage.getItem('shortBreakTime') || 5,
        longBreakTime: localStorage.getItem('longBreakTime') || 15,
        autoStartBreaks: localStorage.getItem('autoStartBreaks') === 'true',
        autoStartPomodoros: localStorage.getItem('autoStartPomodoros') === 'true',
      };
    }
    return {
      pomodoroTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
    };
  };
  
  const [settings, setSettings] = useState(getInitialSettings());

  // UseEffects
  useEffect(() => {
    // Request notification permission on initial render
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => { // Implement all necessary data to current session
    fetch_today_report_data(setActiveTimeSegments).then(()=>setIsLoading(false)); // Fetch data from Redis

    const prevType = localStorage.getItem("type"); // Set type for current session
    setType(prevType || "Pomodoro");
    
    const minutes_value = prevType === "Pomodoro" ? settings.pomodoroTime : prevType === "Short break" ? settings.shortBreakTime : settings.longBreakTime;
    setMinutes(minutes_value);

    const storedEndTime = localStorage.getItem("endTime");
    setEndTime(storedEndTime ? new Date(storedEndTime).getTime() : 0);

    const prevCycleWithinBatch = localStorage.getItem("cycleWithinBatch");
    setCycleWithinBatch(prevCycleWithinBatch ? parseInt(prevCycleWithinBatch) : 0);

    const remainingTime = localStorage.getItem("remainingTime"); // If this is available, the user has paused the timer
    const endTime = storedEndTime ? new Date(storedEndTime).getTime() : 0; // setEndTime does not update the state immediately
    let duration = 0;
    if (remainingTime) { // User has paused the timer; the only place where remainingTime is required
      // lastInteraction = endTime - remainingTime
      const lastInteractionTime = endTime- parseInt(remainingTime);
      const currentTime = Date.now();
      duration = currentTime - lastInteractionTime;
      if (duration >= 25*60*1000) { // TODO: this should update for also if the user has ended a pomodoro session but return after long break
        resetType("Pomodoro");
        localStorage.setItem("cycleWithinBatch", "0");
        setCycleWithinBatch(0);
      } else if (duration >= 5*60*1000) {
        resetType("Pomodoro");
      } else { // Set the timer to the remaining time
        setMinutes(Math.floor(parseInt(remainingTime) / 60000));
        setSeconds(Math.floor((parseInt(remainingTime) % 60000) / 1000));
        setIsActive(false);
      }
    } else{ // User has not paused the timer but refreshed or closed the page
      if (endTime > Date.now()) { // Timer is still active
        const remainingTime = Math.max(0,endTime - Date.now());
        setMinutes(Math.floor(remainingTime / 60000));
        setSeconds(Math.floor((remainingTime % 60000) / 1000));
        setIsActive(true);
      }
    }
  }, []);

  useEffect(() => {
    const button = document.getElementById('startButton');
  
    // Example: Toggle the `data-active` attribute on click
    if (button) {
      button.addEventListener('click', () => {
        button.setAttribute('data-active', (!isActive).toString());
      });
    }
  
    // Cleanup function to remove the event listener
    return () => {
      if (button) {
        button.removeEventListener('click', () => {
          button.setAttribute('data-active', (!isActive).toString());
        });
      }
    };
  }, [isActive]);
  
  // Reset the button's UI when the timer is reset
  useEffect(() => {
    const button = document.getElementById('startButton');
    if (button && !isActive) {
      button.removeAttribute('data-active');
    }
  }, [isActive]);

  useEffect(() => { // Timer logic
    let interval;
  
    if (isActive) {
      interval = window.setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = Math.max(0, endTime - currentTime); // Calculate remaining time
  
        const remainingMinutes = Math.floor(remainingTime / 60000); // Convert to minutes
        const remainingSeconds = Math.floor((remainingTime % 60000) / 1000); // Convert to seconds
  
        setMinutes(remainingMinutes);
        setSeconds(remainingSeconds);
  
        if (remainingTime <= 0) {
          clearInterval(interval);
          gotoNextType(); // Timer ends
        }
      }, 1000);
    } else {
      if (interval !== undefined) clearInterval(interval); // Stop the timer when not active
    }
  
    return () => {
      if (interval !== undefined) clearInterval(interval); // Cleanup on component unmount
    };
  }, [isActive, endTime]);

  // Functions
  const startTimer = () => {
    setIsActive(true)
    const newEndTime = Date.now() + minutes * 60000 + seconds * 1000;
    setEndTime(newEndTime);
    localStorage.setItem("endTime", new Date(newEndTime).toISOString());
    localStorage.removeItem("remainingTime");
    if (type === "Pomodoro"){
      addStartTime(setActiveTimeSegments);
    }
  };
  const pauseTimer = () => {
    localStorage.setItem("remainingTime", (minutes * 60000 + seconds * 1000).toString());
    setIsActive(false);
    if (type === "Pomodoro"){
      addEndTime(setActiveTimeSegments);
    }
  };
  const resetTimer = () => {
    resetType(type);
    localStorage.removeItem("remainingTime"); // remainingTime will only available the last interaction was a pause
  };

  const formatTime = (time) => (time < 10 ? `0${time}` : time); // Format time for display

  const gotoNextType = () => {
    if (type === "Pomodoro") {
      setCycleWithinBatch((prev) => {
        const newCycle = prev + 1;
        if (newCycle === 4) {
          resetType("Long break");
          showNotification("Time for a long break!");
          sendMessageToApp({ type: "Long break" });
          localStorage.setItem("cycleWithinBatch", "0");
          setCycleWithinBatch(0);
          return 0;
        }
        resetType("Short break");
        showNotification("Time for a quick break!");
        sendMessageToApp({ type: "Short break" });
        localStorage.setItem("cycleWithinBatch", newCycle.toString());
        setCycleWithinBatch(newCycle);
        return newCycle;
      });
    } else {
      resetType("Pomodoro");
      showNotification("Time to work!");
    }
  }

  const resetType = (newType) => {
    localStorage.setItem("type", newType);
    localStorage.removeItem("endTime");
    localStorage.removeItem("remainingTime"); // In case the user has paused the timer and came after 5 minutes
    setType((prevType) => {
      if (prevType === "Pomodoro" && isActive) {
        addEndTime(setActiveTimeSegments);
        setIsActive(false); // Stop the timer
      } else if (isActive){
        setIsActive(false);
      }
      return newType;
    });
    if (newType === "Pomodoro") {
      setMinutes(settings.pomodoroTime);
    } else if (newType === "Short break") {
      setMinutes(settings.shortBreakTime);
    } else {
      setMinutes(settings.longBreakTime);
    }
    setSeconds(0);
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

  const toggleOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible);
  }

  const toggleSettingsOverlay = () => {
    setIsSettingsOverlayVisible(!isSettingsOverlayVisible);
  };

  return (
    <div className="container" style={{backgroundColor: getBackgroundColor()}}>
      {isLoading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) :(
      <>
      <div className="options">
        <button className="options-button" onClick={toggleOverlay}>Report</button>
        <button className="options-button" onClick={toggleSettingsOverlay}>Settings</button>
      </div>
      <div className="main-container">
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
            <button id="startButton" className="start-button" data-active="false" onClick={isActive? pauseTimer : startTimer}>
              {!isActive? "Start":"Pause"}
            </button>
            <GrPowerReset className="reset-button" onClick={resetTimer} size={50}/>
          </div>
        </div>

        <div className="statistics">
          <h2>Statistics</h2>
          <p>Cycles within batch: {cycleWithinBatch}</p>
        </div>
      </div>
      </>)
}
      <Overlay isOverlayVisible={isOverlayVisible} toggleOverlay={toggleOverlay} />
      <SettingsOverlay isVisible={isSettingsOverlayVisible} toggleOverlay={toggleSettingsOverlay}
      settings={settings} setSettings={setSettings}/>
    </div>
  );
}

