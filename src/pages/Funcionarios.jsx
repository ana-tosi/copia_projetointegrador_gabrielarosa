import { useState, useEffect, useCallback } from "react";
import {
  Title,
  Button,
  Table,
  TextInput,
  Modal,
  Group,
  Stack,
  Switch,
  Badge,
  ActionIcon,
  Text,
  Paper,
  Loader,
  Center,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconUsers,
} from "@tabler/icons-react";
import { useTauriCommand } from "../hooks/useTauriCommand";

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const { execute, loading } = useTauriCommand();

  const form = useForm({
    initialValues: {
      nome: "",
      cargo: "",
      telefone: "",
      ativo: true,
    },
    validate: {
      nome: (v) => (v.trim().length === 0 ? "Nome é obrigatório" : null),
    },
  });

  const carregarDados = useCallback(async () => {
    try {
      const dados = busca.trim()
        ? await execute("buscar_funcionarios", { termo: busca })
        : await execute("listar_funcionarios");
      setFuncionarios(dados);
    } catch (err) {
      notifications.show({
        title: "Erro ao carregar",
        message: err,
        color: "red",
      });
    }
  }, [execute, busca]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirNovo = () => {
    setEditando(null);
    form.reset();
    setModalAberto(true);
  };

  const abrirEditar = (func) => {
    setEditando(func);
    form.setValues({
      nome: func.nome,
      cargo: func.cargo || "",
      telefone: func.telefone || "",
      ativo: func.ativo,
    });
    setModalAberto(true);
  };

  const salvar = async (values) => {
    try {
      if (editando) {
        await execute("atualizar_funcionario", {
          data: {
            id: editando.id,
            nome: values.nome,
            cargo: values.cargo || null,
            telefone: values.telefone || null,
            ativo: values.ativo,
          },
        });
        notifications.show({
          title: "Sucesso",
          message: "Funcionário atualizado",
          color: "green",
        });
      } else {
        await execute("criar_funcionario", {
          data: {
            nome: values.nome,
            cargo: values.cargo || null,
            telefone: values.telefone || null,
          },
        });
        notifications.show({
          title: "Sucesso",
          message: "Funcionário cadastrado",
          color: "green",
        });
      }

      setModalAberto(false);
      form.reset();
      carregarDados();
    } catch (err) {
      notifications.show({
        title: "Erro ao salvar",
        message: err,
        color: "red",
      });
    }
  };

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconUsers size={28} stroke={1.5} color="var(--mantine-color-blue-6)" />
          <Title order={2}>Funcionários</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={abrirNovo}>
          Novo Funcionário
        </Button>
      </Group>

      <Paper shadow="xs" p="md" radius="md" mb="md">
        <TextInput
          placeholder="Buscar por nome ou cargo..."
          leftSection={<IconSearch size={16} />}
          value={busca}
          onChange={(e) => setBusca(e.currentTarget.value)}
        />
      </Paper>

      {loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : funcionarios.length === 0 ? (
        <Paper shadow="xs" p="xl" radius="md">
          <Center>
            <Stack align="center" gap="xs">
              <IconUsers size={48} stroke={1} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed">Nenhum funcionário cadastrado</Text>
              <Button variant="light" size="sm" onClick={abrirNovo}>
                Cadastrar primeiro funcionário
              </Button>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Paper shadow="xs" radius="md" style={{ overflow: "hidden" }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
                <Table.Th>Cargo</Table.Th>
                <Table.Th>Telefone</Table.Th>
                <Table.Th>Situação</Table.Th>
                <Table.Th w={60}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {funcionarios.map((func) => (
                <Table.Tr key={func.id} style={{ opacity: func.ativo ? 1 : 0.6 }}>
                  <Table.Td fw={500}>{func.nome}</Table.Td>
                  <Table.Td>{func.cargo || "—"}</Table.Td>
                  <Table.Td>{func.telefone || "—"}</Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={func.ativo ? "green" : "red"}
                      size="sm"
                    >
                      {func.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => abrirEditar(func)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Modal de Cadastro/Edição */}
      <Modal
        opened={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? "Editar Funcionário" : "Novo Funcionário"}
        size="md"
      >
        <form onSubmit={form.onSubmit(salvar)}>
          <Stack gap="sm">
            <TextInput
              label="Nome"
              placeholder="Nome completo"
              required
              {...form.getInputProps("nome")}
            />
            <TextInput
              label="Cargo"
              placeholder="Ex: Mecânico, Eletricista, Pintor"
              {...form.getInputProps("cargo")}
            />
            <TextInput
              label="Telefone"
              placeholder="(11) 99999-9999"
              {...form.getInputProps("telefone")}
            />
            {editando && (
              <Switch
                label="Funcionário ativo"
                description="Funcionários inativos não podem ser atribuídos a novos serviços"
                {...form.getInputProps("ativo", { type: "checkbox" })}
              />
            )}
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                {editando ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

export default Funcionarios;
