import { useState } from "react";
import { 
  Paper, 
  PasswordInput, 
  Button, 
  Title, 
  Text, 
  Container, 
  Stack, 
  Center,
  Alert
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconLock, IconShieldLock } from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TrocarSenha() {
  const { trocarSenha, isFirstAccess } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
    validate: {
      senhaAtual: (value) => (value.length > 0 ? null : "Senha atual é obrigatória"),
      novaSenha: (value) => (value.length >= 4 ? null : "Nova senha deve ter no mínimo 4 caracteres"),
      confirmarSenha: (value, values) => (value === values.novaSenha ? null : "Senhas não conferem"),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await trocarSenha(values.senhaAtual, values.novaSenha);
      navigate("/", { replace: true });
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
      }}
    >
      <Container size={420} my={40}>
        <Stack align="center" mb="xl">
          <Center>
            <IconShieldLock size={48} color="var(--mantine-color-blue-6)" />
          </Center>
          <Title align="center" order={2}>
            Alterar Senha
          </Title>
          <Text c="dimmed" size="sm" align="center">
            {isFirstAccess 
              ? "Este é seu primeiro acesso. Por segurança, você deve alterar sua senha inicial."
              : "Defina uma nova senha para sua conta."
            }
          </Text>
        </Stack>

        {isFirstAccess && (
          <Alert icon={<IconAlertCircle size={16} />} title="Atenção" color="blue" mb="lg" radius="md">
            Você só terá acesso ao sistema após completar esta etapa.
          </Alert>
        )}

        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <PasswordInput 
                label="Senha Atual" 
                placeholder="Informe sua senha atual" 
                required 
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("senhaAtual")} 
              />
              <PasswordInput 
                label="Nova Senha" 
                placeholder="Mínimo 4 caracteres" 
                required 
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("novaSenha")} 
              />
              <PasswordInput 
                label="Confirmar Nova Senha" 
                placeholder="Repita a nova senha" 
                required 
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("confirmarSenha")} 
              />
              
              <Button type="submit" fullWidth mt="xl" loading={loading} radius="md">
                Atualizar Senha e Entrar
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

import { Box } from "@mantine/core";
