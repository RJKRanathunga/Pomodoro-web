function getMinutes_fromMidnight(){
    const now = new Date();
    const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
    return minutesFromMidnight;
  }

  function addStartTime(setActiveTimeSegments) {
    const minutesFromMidnight = getMinutes_fromMidnight();
    setActiveTimeSegments(prevSegments => [...prevSegments, {start: minutesFromMidnight, end: 0}]);
  }

  function addEndTime(setActiveTimeSegments) {
    setActiveTimeSegments(prevSegments => {
      if (prevSegments.length > 0 && prevSegments[prevSegments.length - 1].end === 0) {
        const minutesFromMidnight = getMinutes_fromMidnight();
        const updatedSegments = [...prevSegments];
        updatedSegments[updatedSegments.length - 1].end = minutesFromMidnight;
        return updatedSegments;
      }
      return prevSegments;
    });
  }

  export { getMinutes_fromMidnight, addStartTime, addEndTime };