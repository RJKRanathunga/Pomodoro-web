import React,{useState, useEffect, useRef} from 'react';
import './overlayStyles.css';
import { fetchLast7DaysData } from '../../data/store data';
import { GrClose } from 'react-icons/gr';
import { Line } from 'react-chartjs-2';
import {Filler, Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


const Overlay = ({ isOverlayVisible, toggleOverlay }) => {
  // Outside click handler
  const overlayRef = useRef(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState('report');

  useEffect(() => {
    const lastActiveTab = localStorage.getItem('lastActiveTab');
    if (lastActiveTab) {
      setActiveTab(lastActiveTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lastActiveTab', activeTab);
  }, [activeTab]);

  const handleClickOutside = (event) => {
    if (overlayRef.current && !overlayRef.current.contains(event.target)) {
      toggleOverlay();
    }
  };
  // Tabs --

  useEffect(() => {
    if (isOverlayVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOverlayVisible]);
  // Outside click handler - end
  
  const [workTimeSegments_for7days, setWorkTimeSegments_for7days] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOverlayVisible) {
      setIsLoading(true);
      fetchLast7DaysData().then((data) => {
        setWorkTimeSegments_for7days(data);
        setIsLoading(false);
      });
    }
  }, [isOverlayVisible]);

  // const workTimeSegments_for7days = {
  //   dayReport_20250114: null,
  //   dayReport_20250113: [
  //   {"start": 156,"end": 256},
  //   {"start": 356,"end": 456}
  // ],
  //   dayReport_20250112: null,
  // ...
  // }

  const totalMinutesInDay = 24 * 60;

  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimePosition = (currentMinutes / totalMinutesInDay) * 100;

  function getDate_byKey(key) {
    const datePart = key.split('_')[1];
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  const [summery_FullWorkHours, setSummery_FullWorkHours] = useState(0);
  const [summery_remainingMinutes, setSummery_remainingMinutes] = useState(0);
  const [chartData, setChartData] = useState({});
  
  const calculateTotalWorkTime = () => {
    let totalWorkMinutes = 0;
    const dailyWorkMinutes = {};
  
    Object.keys(workTimeSegments_for7days).forEach((key) => {
      const reportDay = key.split('_')[1];
      const todayDay = currentTime.toISOString().split('T')[0].split('-').join('');
      const workTimeSegments = workTimeSegments_for7days[key];
      const workTimes = workTimeSegments ? workTimeSegments.map(({ start, end }) => {
        if (end === 0) {
          const endTime = reportDay === todayDay ? (currentMinutes < start + 25 ? currentMinutes : start) : start;
          return { start, end: endTime };
        }
        return { start, end };
      }) : [];
  
      const dayTotalWorkMinutes = workTimes.reduce((sum, { start, end }) => sum + (end - start), 0);
      totalWorkMinutes += dayTotalWorkMinutes;
      dailyWorkMinutes[key] = dayTotalWorkMinutes;
    });
  
    return { totalWorkMinutes, dailyWorkMinutes };
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  useEffect(() => {
    const { totalWorkMinutes, dailyWorkMinutes } = calculateTotalWorkTime();
    console.log('dailyWorkMinutes:', dailyWorkMinutes);
    console.log('totalWorkMinutes:', totalWorkMinutes);
    setSummery_FullWorkHours(Math.floor(totalWorkMinutes / 60));
    setSummery_remainingMinutes(totalWorkMinutes % 60);

    const data = {
      labels: Object.keys(dailyWorkMinutes).map(key => {
        const dateString = key.split('_')[1];
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6) - 1; // Months are 0-based in JavaScript Date
        const day = dateString.substring(6, 8);
        return new Date(year, month, day).toLocaleDateString();
    }),
      datasets: [
        {
          label: 'Total Work Time (Hours: Minutes)',
          data: Object.values(dailyWorkMinutes),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
    setChartData(data);
  }, [workTimeSegments_for7days]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Work Time for Each Day',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const minutes = context.raw;
            return formatTime(minutes);
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total Work Time (minutes)',
        },
        ticks: {
          callback: function (value) {
            return formatTime(value);
          },
        },
        beginAtZero: true,
      },
    },
  };
  
  return (
    isOverlayVisible && (
      <div className="overlay">
        <div className="overlay-content" ref={overlayRef}>
        {isLoading?(
          <div className="loading">Loading...</div>
        ):(
        <div>
          <div className="tabs">
              <button className={`tab-button ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>Report</button>
              <button className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
            <GrClose className="report-close-icon" onClick={toggleOverlay} />
          </div>
          <hr className="report-divider" />
          {activeTab === 'report' && (
            <div className="timeline-container">
              {Object.keys(workTimeSegments_for7days).map((key) => {

                const reportDay = key.split('_')[1];
                const todayDay = currentTime.toISOString().split('T')[0].split('-').join('');
                const workTimeSegments = workTimeSegments_for7days[key];
                const workTimes = workTimeSegments ? workTimeSegments.map(({ start, end }) => {
                  if (end === 0) {
                    const endTime =reportDay===todayDay ? ( currentMinutes < start + 25 ? currentMinutes:start )  : start;
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
          )}
          {activeTab === 'summary' && (
              <div className="summary-container">
                <div className="summary-box">
                  <div className="summary-time">
                    <h1>{summery_FullWorkHours.toString().padStart(2, '0')} : {summery_remainingMinutes.toString().padStart(2, '0')}</h1>
                  </div>
                  <div className="summary-text">
                    <h4>Total work in last week</h4>
                  </div>
                </div>
                <Line data={chartData} options={options} />
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default Overlay;