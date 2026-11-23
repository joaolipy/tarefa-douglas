import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loading } from "./Loading";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loading texto="Verificando sessão..." />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
