import { Navigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { ReactElement } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};
