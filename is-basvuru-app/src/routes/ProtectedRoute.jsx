import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../auth/session";

export default function ProtectedRoute() {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
