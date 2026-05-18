import { logActivity, getActivities, hideActivity } from '../utils/activityLogger';

export function addActivity(categoryOrActivity, action) {
  if (typeof categoryOrActivity === 'object' && categoryOrActivity !== null) {
    const activity = categoryOrActivity;
    logActivity(activity.type || activity.category || 'system', {
      title: activity.title,
      description: activity.description,
      status: activity.status || 'success'
    });
    return;
  }

  logActivity(categoryOrActivity, action);
}

export function readActivities() {
  return getActivities();
}

export function removeActivity(id) {
  hideActivity(id);
}

export function clearActivities() {
  localStorage.removeItem('activity_history');
  window.dispatchEvent(new CustomEvent('activityLogged'));
}

export function filterActivities(category) {
  const activities = getActivities();
  return category ? activities.filter((activity) => activity.category === category) : activities;
}
