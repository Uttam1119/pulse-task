import { Navigate } from "react-router-dom";

export default function RequireRole({ roles, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || !user.role) return <Navigate to="/login" />;

  if (roles.includes(user.role)) return children;

  return (
    <div className="p-6 text-red-600 text-xl">
      Access Denied — insufficient role.
    </div>
  );
}
