import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Center, Loader } from "@mantine/core";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, isFirstAccess, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para login se não estiver autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isFirstAccess && location.pathname !== "/trocar-senha") {
    // Redireciona para trocar senha se for o primeiro acesso
    return <Navigate to="/trocar-senha" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redireciona para home se tentar acessar rota de admin sem ser admin
    return <Navigate to="/" replace />;
  }

  return children;
}
