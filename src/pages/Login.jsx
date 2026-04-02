import { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Group,
  Anchor,
  Center,
  ThemeIcon,
  Box,
  Stack
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAnchor, IconLock, IconUser } from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      login: "",
      senha: "",
    },
    validate: {
      login: (value) => (value.length > 0 ? null : "Login é obrigatório"),
      senha: (value) => (value.length > 0 ? null : "Senha é obrigatória"),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.login, values.senha);

      if (response.primeiro_acesso) {
        navigate("/trocar-senha", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--app-bg)",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(34, 139, 230, 0.05) 0%, transparent 50%)"
      }}
    >
      <Container size={420} my={40}>
        <Stack align="center" mb="xl">
          <ThemeIcon size={64} radius={100} variant="gradient" gradient={{ from: "blue.6", to: "cyan.4" }}>
            <IconAnchor size={36} />
          </ThemeIcon>
          <Title align="center" order={2} style={{ fontWeight: 900 }}>
            MarinaFlow
          </Title>
          <Text c="dimmed" size="sm" align="center">
            Sistema de Gerenciamento de Serviços
          </Text>
        </Stack>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Login"
                placeholder="Seu usuário"
                required
                leftSection={<IconUser size={16} />}
                {...form.getInputProps("login")}
              />
              <PasswordInput
                label="Senha"
                placeholder="Sua senha"
                required
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("senha")}
              />

              <Button type="submit" fullWidth mt="xl" loading={loading} radius="md">
                Entrar no Sistema
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text c="dimmed" size="xs" align="center" mt="xl">
          Projeto Integrador — UNIVESP
        </Text>
      </Container>
    </Box>
  );
}
