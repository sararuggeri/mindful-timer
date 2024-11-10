// popup.js
const CIRCLE_RADIUS = 90;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const settingsButton = document.querySelector('.settings-button');
const settingsModal = document.querySelector('.settings-modal');
const closeSettings = document.querySelector('.close-settings');
const timerDisplay = document.querySelector('.time-display .time');
const phaseDisplay = document.querySelector('.time-display .phase');
const progressRing = document.querySelector('.progress');
const startButton = document.querySelector('.start');
const resetButton = document.querySelector('.reset');
const timeOptions = document.querySelectorAll('.time-option');
const customTimeInput = document.querySelector('.custom-time input');
const setTimeButton = document.querySelector('.set');  // Fixed selector to match HTML

progressRing.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
progressRing.style.strokeDashoffset = 0;

let port = chrome.runtime.connect({ name: 'timer-port' });

// Load initial state
port.postMessage({ action: 'GET_STATE' });

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

function updateStatsDisplay(stats) {
  document.getElementById('total-sessions').textContent = stats.totalSessions || 0;
  document.getElementById('total-minutes').textContent = stats.totalMinutes || 0;
}

function updateDisplay(state) {
  timerDisplay.textContent = formatTime(state.timeLeft);
  phaseDisplay.textContent = state.isBreak ? 'break' : 'focus';
  startButton.textContent = state.isRunning ? 'pause' : 'start';
  
  const progressPercent = (state.timeLeft / state.totalTime) * 100;
  setProgress(progressPercent);
  
  progressRing.style.stroke = state.isBreak ? '#94a3b8' : '#94a3b8';
}

// Handle custom time input validation
customTimeInput.addEventListener('input', (e) => {
  const value = parseInt(e.target.value);
  if (value > 120) {
    e.target.value = 120;
  } else if (value < 1) {
    e.target.value = 1;
  }
});

port.onMessage.addListener((msg) => {
  if (msg.type === 'STATE_UPDATE') {
    updateDisplay(msg.state);
  }
});

startButton.addEventListener('click', () => {
  const action = startButton.textContent === 'start' ? 'START' : 'PAUSE';
  port.postMessage({ action });
});

resetButton.addEventListener('click', () => {
  const activeTime = document.querySelector('.time-option.active')?.textContent;
  // Extract only the number from the time option (e.g., "25m" -> 25)
  const duration = parseInt(activeTime) || 25;
  port.postMessage({ action: 'RESET', duration });
});

timeOptions.forEach(option => {
  option.addEventListener('click', () => {
    const isRunning = startButton.textContent === 'pause';
    if (!isRunning) {
      timeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      // Extract only the number from the time option (e.g., "25m" -> 25)
      const duration = parseInt(option.textContent);
      port.postMessage({ action: 'SET_TIME', duration });
    }
  });
});

setTimeButton.addEventListener('click', () => {
  const duration = parseInt(customTimeInput.value);
  const isRunning = startButton.textContent === 'pause';
  
  if (!isRunning && duration && duration > 0 && duration <= 120) {
    port.postMessage({ action: 'SET_TIME', duration });
    timeOptions.forEach(opt => opt.classList.remove('active'));
    customTimeInput.value = '';
  }
});

// Default settings
let settings = {
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundAlerts: true
};

// Load settings from storage
chrome.storage.local.get(['settings'], (result) => {
  if (result.settings) {
      settings = { ...settings, ...result.settings };
      updateSettingsUI();
  }
});

// Update UI to match settings
function updateSettingsUI() {
  document.getElementById('shortBreak').value = settings.shortBreak;
  document.getElementById('longBreak').value = settings.longBreak;
  document.getElementById('autoStartBreaks').checked = settings.autoStartBreaks;
  document.getElementById('autoStartFocus').checked = settings.autoStartFocus;
  document.getElementById('soundAlerts').checked = settings.soundAlerts;
}

// Save settings
function saveSettings() {
  settings = {
      shortBreak: parseInt(document.getElementById('shortBreak').value),
      longBreak: parseInt(document.getElementById('longBreak').value),
      autoStartBreaks: document.getElementById('autoStartBreaks').checked,
      autoStartFocus: document.getElementById('autoStartFocus').checked,
      soundAlerts: document.getElementById('soundAlerts').checked
  };
  
  chrome.storage.local.set({ settings }, () => {
      // Notify background script of settings change
      port.postMessage({ action: 'UPDATE_SETTINGS', settings });
  });
}

// Settings modal event listeners
settingsButton.addEventListener('click', () => {
  settingsModal.style.display = 'block';
});

closeSettings.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

// Save settings when inputs change
document.querySelectorAll('.setting-item input').forEach(input => {
  input.addEventListener('change', saveSettings);
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
  }
});