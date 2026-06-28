import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 * Wrap any private route with this component in App.jsx.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("upterra_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
