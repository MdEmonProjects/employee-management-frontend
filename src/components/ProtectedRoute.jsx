import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('token'));

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
