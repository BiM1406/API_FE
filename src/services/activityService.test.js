import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as activityService from './activityService';

describe('Activity Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should add an activity and read it', () => {
    const activity = activityService.addActivity('Auth', 'Login successfully');
    
    expect(activity.module).toBe('Auth');
    expect(activity.action).toBe('Login successfully');
    expect(activity.id).toMatch(/^activity-/);

    const history = activityService.getActivities();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(activity.id);
  });

  it('should clear activities', () => {
    activityService.addActivity('Auth', 'Login successfully');
    expect(activityService.getActivities().length).toBe(1);

    activityService.clearActivities();
    expect(activityService.getActivities().length).toBe(0);
  });

  it('should delete a specific activity', () => {
    const activity1 = activityService.addActivity('Auth', 'Login 1');
    const activity2 = activityService.addActivity('Auth', 'Login 2');

    expect(activityService.getActivities().length).toBe(2);

    activityService.deleteActivity(activity1.id);
    const history = activityService.getActivities();
    
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(activity2.id);
  });

  it('should filter activities', () => {
    activityService.addActivity('Auth', 'Login');
    activityService.addActivity('Payment', 'Checkout');

    const authActivities = activityService.filterActivities({ module: 'Auth' });
    expect(authActivities.length).toBe(1);
    expect(authActivities[0].module).toBe('Auth');

    const searchActivities = activityService.filterActivities({ keyword: 'Checkout' });
    expect(searchActivities.length).toBe(1);
    expect(searchActivities[0].action).toBe('Checkout');
  });
});
