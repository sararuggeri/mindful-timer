chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
      stats: {
        totalSessions: 0,
        totalMinutes: 0,
        dailySessions: 0,
        lastSessionDate: null,
        streak: 0
      },
      theme: 'light',
      soundEnabled: true
    });
  });