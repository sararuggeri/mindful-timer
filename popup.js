let timer;
let timeLeft;
let isRunning = false;
let currentSession = {
  startTime: null,
  duration: 0
};

const timerDisplay = document.querySelector('.timer');
const startButton = document.querySelector('.start');
const resetButton = document.querySelector('.reset');
const timeOptions = document.querySelectorAll('.time-option');
const customTimeInput = document.querySelector('.custom-time input');
const customTimeButton = document.querySelector('.custom-time button');
const themeToggle = document.querySelector('#theme-toggle');
const soundToggle = document.querySelector('#sound-toggle');

// Load saved settings and stats
chrome.storage.local.get(['theme', 'soundEnabled', 'stats'], (result) => {
  if (result.theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
  }
  
  if (result.soundEnabled === false) {
    soundToggle.checked = false;
  }
  
  if (result.stats) {
    updateStatsDisplay(result.stats);
  }
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function playSound() {
  if (soundToggle.checked) {
    const audio = new Audio('notification.mp3');
    audio.play();
  }
}

function updateTimer() {
  if (timeLeft <= 0) {
    clearInterval(timer);
    isRunning = false;
    startButton.textContent = 'Start';
    
    // Update statistics
    chrome.storage.local.get(['stats'], (result) => {
      const stats = result.stats || {
        totalSessions: 0,
        totalMinutes: 0,
        dailySessions: 0,
        lastSessionDate: null,
        streak: 0
      };
      
      const today = new Date().toDateString();
      
      stats.totalSessions++;
      stats.totalMinutes += Math.floor(currentSession.duration / 60);
      
      if (stats.lastSessionDate === today) {
        stats.dailySessions++;
      } else {
        stats.dailySessions = 1;
        if (stats.lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
          stats.streak++;
        } else {
          stats.streak = 1;
        }
      }
      
      stats.lastSessionDate = today;
      
      chrome.storage.local.set({ stats }, () => {
        updateStatsDisplay(stats);
      });
    });
    
    playSound();
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Time\'s up!',
      message: 'Your study session is complete.'
    });
    return;
  }
  
  timeLeft--;
  timerDisplay.textContent = formatTime(timeLeft);
}

function updateStatsDisplay(stats) {
  document.getElementById('total-sessions').textContent = stats.totalSessions || 0;
  document.getElementById('total-minutes').textContent = stats.totalMinutes || 0;
  document.getElementById('daily-sessions').textContent = stats.dailySessions || 0;
  document.getElementById('streak').textContent = stats.streak || 0;
}

startButton.addEventListener('click', () => {
  if (isRunning) {
    clearInterval(timer);
    startButton.textContent = 'Start';
    isRunning = false;
  } else {
    if (!currentSession.startTime) {
      currentSession.startTime = Date.now();
      currentSession.duration = timeLeft;
    }
    timer = setInterval(updateTimer, 1000);
    startButton.textContent = 'Pause';
    isRunning = true;
  }
});

resetButton.addEventListener('click', () => {
  clearInterval(timer);
  const activeTime = document.querySelector('.time-option.active').textContent;
  timeLeft = parseInt(activeTime) * 60;
  timerDisplay.textContent = formatTime(timeLeft);
  startButton.textContent = 'Start';
  isRunning = false;
  currentSession = {
    startTime: null,
    duration: 0
  };
});

timeOptions.forEach(option => {
  option.addEventListener('click', () => {
    timeOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    const minutes = parseInt(option.textContent);
    timeLeft = minutes * 60;
    timerDisplay.textContent = formatTime(timeLeft);
    clearInterval(timer);
    startButton.textContent = 'Start';
    isRunning = false;
    currentSession = {
      startTime: null,
      duration: 0
    };
  });
});

customTimeButton.addEventListener('click', () => {
  const minutes = parseInt(customTimeInput.value);
  if (minutes && minutes > 0 && minutes <= 120) {
    timeLeft = minutes * 60;
    timerDisplay.textContent = formatTime(timeLeft);
    timeOptions.forEach(opt => opt.classList.remove('active'));
    clearInterval(timer);
    startButton.textContent = 'Start';
    isRunning = false;
    currentSession = {
      startTime: null,
      duration: 0
    };
    customTimeInput.value = '';
  }
});

themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    document.body.setAttribute('data-theme', 'dark');
    chrome.storage.local.set({ theme: 'dark' });
  } else {
    document.body.removeAttribute('data-theme');
    chrome.storage.local.set({ theme: 'light' });
  }
});

soundToggle.addEventListener('change', () => {
  chrome.storage.local.set({ soundEnabled: soundToggle.checked });
});

// Initialize timer
timeLeft = 25 * 60;
timerDisplay.textContent = formatTime(timeLeft);