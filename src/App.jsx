import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  NavLink,
  Group,
  Title,
  Text,
  ThemeIcon,
  Box,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconShip,
  IconUsers,
  IconTool,
  IconHistory,
  IconAnchor,
  IconLogout,
  IconShieldLock,
} from "@tabler/icons-react";

import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Embarcacoes from "./pages/Embarcacoes";
import Funcionarios from "./pages/Funcionarios";
import RegistrarServico from "./pages/RegistrarServico";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import TrocarSenha from "./pages/TrocarSenha";
import Usuarios from "./pages/Usuarios";

function App() {
  const { isAuthenticated, logout, isAdmin, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Se não estiver autenticado e não estiver na tela de login, o ProtectedRoute cuidará
  // mas aqui definimos as rotas básicas que não usam o AppShell (login, trocar senha)
  if (!isAuthenticated && location.pathname === "/login") {
    return <Login />;
  }

  if (isAuthenticated && location.pathname === "/trocar-senha") {
    return <TrocarSenha />;
  }

  const navItems = [
    { label: "Embarcações", icon: IconShip, path: "/embarcacoes", description: "Cadastro e gestão" },
    { label: "Funcionários", icon: IconUsers, path: "/funcionarios", description: "Equipe e cargos" },
    { label: "Registrar Serviço", icon: IconTool, path: "/servicos/novo", description: "Novo registro" },
    { label: "Histórico", icon: IconHistory, path: "/historico", description: "Consulta de serviços" },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm" }}
      padding="lg"
    >
      {/* Header */}
      <AppShell.Header
        style={{
          borderBottom: "1px solid var(--header-border)",
          backgroundColor: "var(--header-bg)",
        }}
      >
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: "blue.6", to: "cyan.4" }}>
              <IconAnchor size={22} />
            </ThemeIcon>
            <Box>
              <Title order={4} style={{ lineHeight: 1.2 }}>
                MarinaFlow
              </Title>
              <Text size="xs" c="dimmed">
                Sistema de Gerenciamento de Serviços
              </Text>
            </Box>
          </Group>

          {isAuthenticated && (
            <Group gap="md">
              <Box ta="right" visibleFrom="xs">
                <Text size="sm" fw={600}>{user?.login}</Text>
                <Text size="xs" c="dimmed">{user?.role === "Admin" ? "Administrador" : "Funcionário"}</Text>
              </Box>
              <Tooltip label="Sair do sistema">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  radius="md"
                >
                  <IconLogout size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar p="md" style={{ borderRight: "1px solid var(--sidebar-border)", backgroundColor: "var(--sidebar-bg)" }}>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="sm" px="sm">
          Menu Principal
        </Text>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            description={item.description}
            leftSection={<item.icon size={20} stroke={1.5} />}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            variant="light"
            style={{ borderRadius: "var(--mantine-radius-md)", marginBottom: 4 }}
          />
        ))}

        {isAdmin && (
          <>
            <Divider my="sm" label="Administração" labelPosition="center" />
            <NavLink
              label="Usuários"
              description="Gestão de acessos"
              leftSection={<IconShieldLock size={20} stroke={1.5} />}
              active={location.pathname === "/usuarios"}
              onClick={() => navigate("/usuarios")}
              variant="light"
              style={{ borderRadius: "var(--mantine-radius-md)", marginBottom: 4 }}
            />
          </>
        )}

        <Box style={{ marginTop: "auto" }}>
          <Divider my="sm" />
          <Text size="xs" c="dimmed" px="sm" ta="center">
            Projeto Integrador — UNIVESP
          </Text>
        </Box>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main style={{ backgroundColor: "var(--app-bg)" }}>
        <div className="page-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/trocar-senha" element={<TrocarSenha />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/embarcacoes" replace />
              </ProtectedRoute>
            } />

            <Route path="/embarcacoes" element={
              <ProtectedRoute>
                <Embarcacoes />
              </ProtectedRoute>
            } />

            <Route path="/funcionarios" element={
              <ProtectedRoute>
                <Funcionarios />
              </ProtectedRoute>
            } />

            <Route path="/servicos/novo" element={
              <ProtectedRoute>
                <RegistrarServico />
              </ProtectedRoute>
            } />

            <Route path="/historico" element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            } />

            <Route path="/usuarios" element={
              <ProtectedRoute adminOnly>
                <Usuarios />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;

