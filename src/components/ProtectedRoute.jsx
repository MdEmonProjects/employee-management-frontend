import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

function isTokenExpired(token) {
  try {
    const encodedPayload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const token = localStorage.getItem('token');
  const hasValidToken = Boolean(token) && !isTokenExpired(token);

  useEffect(() => {
    if (!hasValidToken) {
      dispatch(logout());
    }
  }, [dispatch, hasValidToken]);

  if (!isAuthenticated || !hasValidToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
