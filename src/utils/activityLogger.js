import { addActivity, getActivities, removeActivity, clearActivities } from '../services/activityService';

export const logActivity = (category, action) => addActivity(category, action);

export { getActivities };

export const hideActivity = (id) => removeActivity(id);

export const clearAllActivities = () => clearActivities();

