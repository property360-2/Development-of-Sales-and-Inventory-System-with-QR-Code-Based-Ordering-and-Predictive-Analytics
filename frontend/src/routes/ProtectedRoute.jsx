import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>; // optional loader

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
}
