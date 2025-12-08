import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const userRole = localStorage.getItem("userRole");

  if (!userRole) {
    return <Navigate to="/public" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    if (userRole === "admin-upt")
      return <Navigate to="/dashboard/home" replace />;
    if (userRole === "koperasi")
      return <Navigate to="/dashboard/home" replace />;
  }

  return element;
};

export default ProtectedRoute;
