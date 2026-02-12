import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

export default function AdminRoute({ children }) {
  const { isAuth } = useAuth();
  const { user, loading } = useUser();

  if (loading) return <p style={{ padding: 40 }}>Checking permissions...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;

  const isAdmin =
    user?.is_admin === true ||
    Number(user?.is_admin) === 1 ||
    user?.isadmin === true ||
    Number(user?.isadmin) === 1;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
