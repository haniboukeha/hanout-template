import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Loading from './Loading';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  authOnly?: boolean; // requires auth but not admin
  guestOnly?: boolean; // only for guests (login, signup)
}

const ProtectedRoute = ({ adminOnly = false, authOnly = false, guestOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while checking session (optional)
  if (isLoading) {
    return <Loading text="Checking authentication..." />;
  }

  // Guest only routes: redirect authenticated users away
  if (guestOnly) {
    if (isAuthenticated) {
      const isAdmin = user?.role === 'admin';
      return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
    }
    return <Outlet />;
  }

  // Protected routes
  if ((adminOnly || authOnly) && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
