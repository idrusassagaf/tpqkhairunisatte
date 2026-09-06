import { Navigate, useLocation } from "react-router-dom";

export default function RoleRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // Belum login
  if (!token || !userData) {
    return <Navigate to="/web/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    console.error("Data user tidak valid:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/web/login" replace />;
  }

  // Cek role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
