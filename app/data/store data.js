function getMinutes_fromMidnight() {
  const now = new Date();
  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  return minutesFromMidnight;
}

async function fetch_today_report_data(setActiveTimeSegments) {
  const key = "activeTimeSegments"; // Replace with the actual key or a variable holding the key
  const response = await fetch(`/api/redisClient?key=${key}`);
  const result = await response.json();
  if (result.value) {
    setActiveTimeSegments(result.value);
  }
}

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
    storeData("activeTimeSegments", newTimeSegments); // Store the updated segments in Redis
    return newTimeSegments;
  });
}

function addEndTime(setActiveTimeSegments) {
  setActiveTimeSegments(prevSegments => {
    if (prevSegments.length > 0 && prevSegments[prevSegments.length - 1].end === 0) {
      const minutesFromMidnight = getMinutes_fromMidnight();
      const updatedSegments = [...prevSegments];
      updatedSegments[updatedSegments.length - 1].end = minutesFromMidnight;
      storeData("activeTimeSegments", updatedSegments); // Store the updated segments in Redis
      return updatedSegments;
    }
    return prevSegments || [];
  });
}

export { fetch_today_report_data, addStartTime, addEndTime };