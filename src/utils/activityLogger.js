import { addActivity, getActivities, removeActivity } from '../services/activityService';

export const logActivity = (category, action) => addActivity(category, action);

export { getActivities };

export const hideActivity = (id) => removeActivity(id);

