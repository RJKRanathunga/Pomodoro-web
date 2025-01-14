// Util functions
function getMinutes_fromMidnight() {
  const now = new Date();
  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  return minutesFromMidnight;
}

function get_todayKey() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();
  const dynamicKey = `dayReport_${year}${month}${day}`;
  return dynamicKey;
}

function getLast7DaysKeys() {
  const keys = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const key = `dayReport_${year}${month}${day}`;
    keys.push(key);
  }
  return keys;
}

// Fetch data functions
async function fetch_today_report_data(setActiveTimeSegments) {
  const key = get_todayKey(); // Replace with the actual key or a variable holding the key
  const response = await fetch(`/api/redisClient?key=${key}`);
  const result = await response.json();
  if (result.value) {
    setActiveTimeSegments(result.value);
  }
}

async function fetchLast7DaysData() {
  const keys = getLast7DaysKeys();
  const data = {};

  for (const key of keys) {
    const response = await fetch(`/api/redisClient?key=${key}`);
    const result = await response.json();
    if (result.value) {
      data[key] = result.value;
    } else {
      data[key] = null; // or handle the case where there's no data for the key
    }
  }

  return data;
}

// Store data function
async function storeData(key, value) {
  try {
    const response = await fetch('/api/redisClient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error storing data:', error);
  }
}

function addStartTime(setActiveTimeSegments) {
  const minutesFromMidnight = getMinutes_fromMidnight();
  setActiveTimeSegments(prevSegments => {
    const newTimeSegments = [...(Array.isArray(prevSegments) ? prevSegments : []), { start: minutesFromMidnight, end: 0 }];
    const key = get_todayKey();
    storeData(key, newTimeSegments); // Store the updated segments in Redis
    return newTimeSegments;
  });
}

function addEndTime(setActiveTimeSegments) {
  setActiveTimeSegments(prevSegments => {
    if (prevSegments.length > 0 && prevSegments[prevSegments.length - 1].end === 0) {
      const minutesFromMidnight = getMinutes_fromMidnight();
      const updatedSegments = [...prevSegments];
      updatedSegments[updatedSegments.length - 1].end = minutesFromMidnight;
      const key = get_todayKey();
      storeData(key, updatedSegments); // Store the updated segments in Redis
      return updatedSegments;
    }
    return prevSegments || [];
  });
}

export { fetch_today_report_data, addStartTime, addEndTime, fetchLast7DaysData };