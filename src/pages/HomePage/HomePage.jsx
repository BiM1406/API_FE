import { useMemo } from 'react';
import { isAuthenticated } from '../../services/authService';
import PublicLandingPage from './PublicLandingPage';
import AuthenticatedHome from './AuthenticatedHome';

/**
 * HomePage Component
 * 
 * Routes to different home views based on authentication status:
 * - If user is NOT authenticated: Show PublicLandingPage (intro, features, pricing)
 * - If user IS authenticated: Show AuthenticatedHome (dashboard, quick actions, stats)
 * 
 * Checks auth status using authService.isAuthenticated()
 * Does NOT logout user or clear localStorage
 */
export default function HomePage() {
  // Check authentication status once and memoize to avoid re-renders
  const userIsAuthenticated = useMemo(() => isAuthenticated(), []);

  // Render appropriate home view based on auth status
  if (userIsAuthenticated) {
    return <AuthenticatedHome />;
  }

  return <PublicLandingPage />;
}
