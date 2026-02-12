import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

export default function AdminRoute({ children }) {
  const { isAuth } = useAuth();
  const { user, loading } = useUser();

  // still loading user
  if (loading) {
    return <p style={{ padding: 40 }}>Checking permissions...</p>;
  }

  // not logged in
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // not admin
  if (!user || Number(user.isadmin) !== 1) {
    return <Navigate to="/" replace />;
  }

  // allowed
  return children;
}
