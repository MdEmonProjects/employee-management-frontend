import { Navigate } from 'react-router-dom';
import { clearSuperAdminToken, getSuperAdminToken } from '../features/superAdmin/superAdminQuerySlice';

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'super_admin' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function SuperAdminRoute({ children }) {
  const token = getSuperAdminToken();
  if (!token || !isTokenValid(token)) {
    clearSuperAdminToken();
    return <Navigate to="/super-admin/login" replace />;
  }
  return children;
}
