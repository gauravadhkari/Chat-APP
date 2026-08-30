const rateLimits = new Map();

const socketRateLimiter = (userId,eventName,maxEvents,windowMs) => {
  const key = `${userId} : ${eventName}`;
  const now = Date.now();
  const existing = rateLimits.get(key);
  
  if(!existing){
    rateLimits.set(key, {
      count : 1,
      startTime : now
    });
    return true;
  }

  if(now - existing.startTime > windowMs){
    rateLimits.set(key,{
      count : 1,
      startTime : now,
    })
    return true
  }
  if(existing.count >= maxEvents){
    return false;
  }
  existing.count++;
  return true;
}

module.exports = socketRateLimiter;