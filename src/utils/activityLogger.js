export const logActivity = (category, action) => {
  const historyKey = 'activity_history';
  const savedHistory = localStorage.getItem(historyKey);
  const currentHistory = savedHistory ? JSON.parse(savedHistory) : [];

  const newActivity = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    category,
    action,
    timestamp: Date.now()
  };

  currentHistory.unshift(newActivity);
  
  // Giữ lại 100 hoạt động gần nhất để tránh localStorage quá lớn
  if (currentHistory.length > 100) {
    currentHistory.length = 100;
  }

  localStorage.setItem(historyKey, JSON.stringify(currentHistory));
  
  // Dispatch custom event để các component khác (như History.jsx) có thể update
  window.dispatchEvent(new CustomEvent('activityLogged'));
};

export const getActivities = () => {
  const savedHistory = localStorage.getItem('activity_history');
  return savedHistory ? JSON.parse(savedHistory) : [];
};

export const hideActivity = (id) => {
  const historyKey = 'activity_history';
  const savedHistory = localStorage.getItem(historyKey);
  if (!savedHistory) return;

  const currentHistory = JSON.parse(savedHistory);
  const updatedHistory = currentHistory.filter(activity => activity.id !== id);
  localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  
  window.dispatchEvent(new CustomEvent('activityLogged'));
};

export const clearAllActivities = () => {
  localStorage.removeItem('activity_history');
  window.dispatchEvent(new CustomEvent('activityLogged'));
};
