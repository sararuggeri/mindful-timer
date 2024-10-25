let timer;
let timeLeft;
let totalTime;
let isRunning = false;
let isBreak = false;

const CIRCLE_RADIUS = 90;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const BREAK_DURATION = 5 * 60; // 5 minutes break

const timerDisplay = document.querySelector('.time-display .time');
const phaseDisplay = document.querySelector('.time-display .phase');
const progressRing = document.querySelector('.progress');
const startButton = document.querySelector('.start');
const resetButton = document.querySelector('.reset');
const timeOptions = document.querySelectorAll('.time-option');
const customTimeInput = document.querySelector('.custom-time input');
const setTimeButton = document.querySelector('.set-time');

progressRing.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
progressRing.style.strokeDashoffset = 0;

// Load stats
chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) {
    updateStatsDisplay(result.stats);
  }
});



function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function setProgress(percent) {
  const offset = CIRCLE_CIRCUMFERENCE - (percent / 100 * CIRCLE_CIRCUMFERENCE);
  progressRing.style.strokeDashoffset = offset;
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

    chrome.storage.local.set({ stats }, () => {
      updateStatsDisplay(stats);
    });
  });
}

function updateStatsDisplay(stats) {
  document.getElementById('total-sessions').textContent = stats.totalSessions || 0;
  document.getElementById('total-minutes').textContent = stats.totalMinutes || 0;
}

function startBreak() {
  isBreak = true;
  timeLeft = BREAK_DURATION;
  totalTime = BREAK_DURATION;
  phaseDisplay.textContent = 'break';
  progressRing.style.stroke = '#94a3b8';
  timerDisplay.textContent = formatTime(timeLeft);
  setProgress(100);
  startTimer();
}

function updateTimer() {
  if (timeLeft <= 0) {
    clearInterval(timer);
    isRunning = false;
    startButton.textContent = 'start';
    
    if (!isBreak) {
      updateStats();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Focus Session Complete',
        message: 'Well done! Time for a short break.'
      });
      startBreak();
    } else {
      isBreak = false;
      phaseDisplay.textContent = 'focus';
      progressRing.style.stroke = '#94a3b8';
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Break Complete',
        message: 'Ready for another focus session?'
      });
    }
    return;
  }
  
  timeLeft--;
  const progressPercent = (timeLeft / totalTime) * 100;
  setProgress(progressPercent);
  timerDisplay.textContent = formatTime(timeLeft);
}

function startTimer() {
  timer = setInterval(updateTimer, 1000);
  startButton.textContent = 'pause';
  isRunning = true;
}

startButton.addEventListener('click', () => {
  if (isRunning) {
    clearInterval(timer);
    startButton.textContent = 'start';
    isRunning = false;
  } else {
    startTimer();
  }
});

resetButton.addEventListener('click', () => {
  clearInterval(timer);
  isBreak = false;
  const activeTime = document.querySelector('.time-option.active').textContent;
  timeLeft = parseInt(activeTime) * 60;
  totalTime = timeLeft;
  timerDisplay.textContent = formatTime(timeLeft);
  phaseDisplay.textContent = 'focus';
  progressRing.style.stroke = '#94a3b8';
  setProgress(100);
  startButton.textContent = 'start';
  isRunning = false;
});

timeOptions.forEach(option => {
  option.addEventListener('click', () => {
    if (!isRunning) {
      timeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      const minutes = parseInt(option.textContent);
      timeLeft = minutes * 60;
      totalTime = timeLeft;
      timerDisplay.textContent = formatTime(timeLeft);
      setProgress(100);
    }
  });
});

setTimeButton.addEventListener('click', () => {
  if (!isRunning) {
    const minutes = parseInt(customTimeInput.value);
    if (minutes && minutes > 0 && minutes <= 120) {
      timeLeft = minutes * 60;
      totalTime = timeLeft;
      timerDisplay.textContent = formatTime(timeLeft);
      setProgress(100);
      timeOptions.forEach(opt => opt.classList.remove('active'));
      customTimeInput.value = '';
    }
  }
});

// Initialize timer
timeLeft = 25 * 60;
totalTime = timeLeft;
timerDisplay.textContent = formatTime(timeLeft);
setProgress(100);