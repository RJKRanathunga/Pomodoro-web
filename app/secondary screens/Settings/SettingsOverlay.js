import React from 'react';
import './settingsStyles.css';

const SettingsOverlay = ({ isVisible, toggleOverlay,settings, setSettings }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: newValue,
    }));

    switch (name) {
      case 'pomodoroTime':
        localStorage.setItem('pomodoroTime', newValue);
        break;
      case 'shortBreakTime':
        localStorage.setItem('shortBreakTime', newValue);
        break;
      case 'longBreakTime':
        localStorage.setItem('longBreakTime', newValue);
        break;
      case 'autoStartBreaks':
        localStorage.setItem('autoStartBreaks', newValue);
        break;
      case 'autoStartPomodoros':
        localStorage.setItem('autoStartPomodoros', newValue);
        break;
      default:
        break;
    }
  };

  return (
    isVisible && (
      <div className="settings-overlay">
        <div className="settings-overlay-content">
          <h2>Settings</h2>
          <button className="settings-close-button" onClick={toggleOverlay}>Close</button>
          <div className="settings-form">
            <label>
              Pomodoro Time (minutes):
              <input
                type="number"
                name="pomodoroTime"
                value={settings.pomodoroTime}
                onChange={handleChange}
              />
            </label>
            <label>
              Short Break Time (minutes):
              <input
                type="number"
                name="shortBreakTime"
                value={settings.shortBreakTime}
                onChange={handleChange}
              />
            </label>
            <label>
              Long Break Time (minutes):
              <input
                type="number"
                name="longBreakTime"
                value={settings.longBreakTime}
                onChange={handleChange}
              />
            </label>
            <label>
              Auto Start Breaks:
              <input
                type="checkbox"
                name="autoStartBreaks"
                checked={settings.autoStartBreaks}
                onChange={handleChange}
              />
            </label>
            <label>
              Auto Start Pomodoros:
              <input
                type="checkbox"
                name="autoStartPomodoros"
                checked={settings.autoStartPomodoros}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      </div>
    )
  );
};

export default SettingsOverlay;