// background.js
let timer;
let timeLeft;
let totalTime;
let isRunning = false;
let isBreak = false;
let ports = [];

const BREAK_DURATION = 5 * 60; // 5 minutes break

chrome.runtime.onConnect.addListener((port) => {
  ports.push(port);
  
  port.onDisconnect.addListener(() => {
    ports = ports.filter(p => p !== port);
  });

  port.onMessage.addListener((msg) => {
    switch (msg.action) {
      case 'START':
        if (!isRunning) {
          startTimer();
        }
        break;
      case 'PAUSE':
        if (isRunning) {
          pauseTimer();
        }
        break;
      case 'RESET':
        resetTimer(msg.duration);
        break;
      case 'SET_TIME':
        setTime(msg.duration);
        break;
      case 'GET_STATE':
        port.postMessage({
          type: 'STATE_UPDATE',
          state: {
            timeLeft,
            totalTime,
            isRunning,
            isBreak
          }
        });
        break;
    }
  });
});

function startTimer() {
  isRunning = true;
  timer = setInterval(() => {
    timeLeft--;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      
      if (!isBreak) {
        updateStats();
        notifySessionComplete();
        startBreak();
      } else {
        isBreak = false;
        notifyBreakComplete();
      }
    }
    
    broadcastState();
  }, 1000);
  
  broadcastState();
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  broadcastState();
}

function resetTimer(duration) {
  clearInterval(timer);
  isBreak = false;
  timeLeft = duration * 60;
  totalTime = timeLeft;
  isRunning = false;
  broadcastState();
}

function setTime(duration) {
  if (!isRunning) {
    timeLeft = duration * 60;
    totalTime = timeLeft;
    broadcastState();
  }
}

function startBreak() {
  isBreak = true;
  timeLeft = BREAK_DURATION;
  totalTime = BREAK_DURATION;
  startTimer();
}

function broadcastState() {
  const state = {
    timeLeft,
    totalTime,
    isRunning,
    isBreak
  };
  
  ports.forEach(port => {
    port.postMessage({
      type: 'STATE_UPDATE',
      state
    });
  });
}

function updateStats() {
  chrome.storage.local.get(['stats'], (result) => {
    const today = new Date().toDateString();
    const stats = result.stats || {
      totalSessions: 0,
      totalMinutes: 0,
      lastDate: null
    };

    if (stats.lastDate !== today) {
      stats.totalSessions = 0;
      stats.totalMinutes = 0;
      stats.lastDate = today;
    }

    stats.totalSessions++;
    stats.totalMinutes += Math.floor(totalTime / 60);

    chrome.storage.local.set({ stats });
  });
}

function notifySessionComplete() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title: 'Focus Session Complete',
    message: 'Well done! Time for a short break.'
  });
}

function notifyBreakComplete() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title: 'Break Complete',
    message: 'Ready for another focus session?'
  });
}

// Initialize timer with default values
timeLeft = 25 * 60;
totalTime = timeLeft;