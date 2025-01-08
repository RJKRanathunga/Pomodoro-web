"use client"; // Ensure this file is treated as a client component

import { useState, useEffect } from "react";
import "./styles.css";

// Message the Android app
async function fetchTokens(): Promise<string[]> {
  const response = await fetch('/api/saveToken', { method: 'GET' });
  let tokens: string[] = [];
  if (!response.ok) {
    // throw new Error('Failed to fetch tokens');
    const storedTokens = localStorage.getItem('tokens');
    if (storedTokens) {
      tokens = JSON.parse(storedTokens);
    } else {
      throw new Error('Failed to fetch tokens');
    }
  } else {
    tokens = await response.json();
  }
  return tokens;
}

async function sendMessageToApp(data: { [key: string]: string }) {
  try {
    // Fetch the token from your Android app's API endpoint
    const tokens = await fetchTokens();

    if (!tokens || tokens.length === 0) {
      throw new Error('Token not found');
    }
    
    // Use the first token for demonstration purposes
    const token = tokens[0];

    const response = await fetch('/api/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        data: data,
      }),
    });

    const result = await response.json();
    console.log(result);

    if (result.success) {
      alert('Message sent successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send message.');
  }
}

// Main component
export default function Home() {
  // Variables
  const [minutes, setMinutes] = useState(25); // Pomodoro session starts with 25 minutes
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [type, setType] = useState("Pomodoro");
  const [cycleWithinBatch, setCycleWithinBatch] = useState(0);


  // UseEffects
  useEffect(() => {
    // Request notification permission on initial render
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const endTime = localStorage.getItem("endTime");
    const remainingTime = localStorage.getItem("remainingTime");
    const prevType = localStorage.getItem("type");
    const lastInteraction = localStorage.getItem("lastInteraction");
    setType(prevType || "Pomodoro");
   
    let duration = 0;
    if (lastInteraction) {
      const lastInteractionTime = new Date(lastInteraction).getTime();
      const currentTime = new Date().getTime();
      duration = currentTime - lastInteractionTime;
      if (duration >= 5*60*1000) {
        resetType("Pomodoro");
      } else if (duration >= 25*60*1000) {
        resetType("Pomodoro");
        setCycleWithinBatch(0);
      }
      localStorage.removeItem("lastInteraction");
    }

    if (remainingTime && duration < 5*60*1000) {
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
          showNotification("Time for a long break!");
          return 0;
        }
        resetType("Short break");
        showNotification("Time for a quick break!");
        return newCycle;
      });
    } else {
      resetType("Pomodoro");
      showNotification("Time to work!");
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

  const showNotification = (message: string) => {
    if (Notification.permission === "granted") {
      try {
        new Notification("Pomodoro Timer", {
          body: message,
          // icon: "icon.png", // Ensure this path is correct
          requireInteraction: true, // Key option for persistent notifications
        });
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    }
  };

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
          <button className="button" onClick={()=>sendMessageToApp({ type: "Pomodoro" })}>
            Pomodoro
          </button>
          <button className="button" onClick={()=>sendMessageToApp({ type: "Short break" })}>
            Short break
          </button>
          <button className="button" onClick={()=>sendMessageToApp({ type: "Long break" })}>
            Long break
          </button>
        </div>
      </div>
    </div>
  );
}

