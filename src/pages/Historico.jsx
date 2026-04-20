import { useState, useEffect } from "react";
import {
  Title,
  Select,
  Table,
  Badge,
  Group,
  Stack,
  Paper,
  Text,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Menu,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconHistory,
  IconDotsVertical,
  IconPlayerPlay,
  IconCheck,
  IconShip,
} from "@tabler/icons-react";
import { useTauriCommand } from "../hooks/useTauriCommand";
import { useAuth } from "../contexts/AuthContext";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "yellow" },
  em_execucao: { label: "Em Execução", color: "blue" },
  concluido: { label: "Concluído", color: "green" },
};

function Historico() {
  const [embarcacoes, setEmbarcacoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [embarcacaoSelecionada, setEmbarcacaoSelecionada] = useState(null);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const { execute, loading } = useTauriCommand();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const carregarEmbarcacoes = async () => {
      try {
        const embs = await execute("listar_embarcacoes");
        setEmbarcacoes(embs);
      } catch (err) {
        notifications.show({
          title: "Erro",
          message: err,
          color: "red",
        });
      }
    };
    carregarEmbarcacoes();
  }, [execute]);

  useEffect(() => {
    const carregarServicos = async () => {
      if (!embarcacaoSelecionada) {
        // Carregar todos os serviços se nenhuma embarcação selecionada
        setCarregandoServicos(true);
        try {
          const dados = await execute("listar_servicos");
          setServicos(dados);
        } catch (err) {
          notifications.show({
            title: "Erro",
            message: err,
            color: "red",
          });
        } finally {
          setCarregandoServicos(false);
        }
        return;
      }

      setCarregandoServicos(true);
      try {
        const dados = await execute("listar_servicos_por_embarcacao", {
          embarcacaoId: Number(embarcacaoSelecionada),
        });
        setServicos(dados);
      } catch (err) {
        notifications.show({
          title: "Erro",
          message: err,
          color: "red",
        });
      } finally {
        setCarregandoServicos(false);
      }
    };
    carregarServicos();
  }, [embarcacaoSelecionada, execute]);

  const atualizarStatus = async (servicoId, novoStatus) => {
    try {
      await execute("atualizar_status_servico", {
        data: {
          id: servicoId,
          status: novoStatus,
          observacao: null,
        },
      });

      notifications.show({
        title: "Status atualizado",
        message: `Serviço marcado como ${STATUS_CONFIG[novoStatus]?.label || novoStatus}`,
        color: "green",
      });

      // Recarregar lista
      const dados = embarcacaoSelecionada
        ? await execute("listar_servicos_por_embarcacao", {
            embarcacaoId: Number(embarcacaoSelecionada),
          })
        : await execute("listar_servicos");
      setServicos(dados);
    } catch (err) {
      notifications.show({
        title: "Erro ao atualizar",
        message: err,
        color: "red",
      });
    }
  };

  const embarcacaoOptions = embarcacoes.map((e) => ({
    value: String(e.id),
    label: `${e.nome} — ${e.identificacao}`,
  }));

  const formatarData = (dataStr) => {
    if (!dataStr) return "—";
    try {
      const [ano, mes, dia] = dataStr.split("-");
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataStr;
    }
  };

  const podeIniciarExecucao = (status) => status === "pendente";
  const podeConcluirServico = (status) =>
    isAdmin && (status === "pendente" || status === "em_execucao");
  const podeAlterarStatus = (status) =>
    status !== "concluido" && (podeIniciarExecucao(status) || podeConcluirServico(status));

  return (
    <>
      <Group gap="sm" mb="lg">
        <IconHistory size={28} stroke={1.5} color="var(--mantine-color-blue-6)" />
        <Title order={2}>Histórico de Serviços</Title>
      </Group>

      <Paper shadow="xs" p="md" radius="md" mb="md">
        <Select
          label="Filtrar por Embarcação"
          placeholder="Todas as embarcações"
          data={embarcacaoOptions}
          searchable
          clearable
          nothingFoundMessage="Nenhuma embarcação encontrada"
          leftSection={<IconShip size={16} />}
          value={embarcacaoSelecionada}
          onChange={setEmbarcacaoSelecionada}
        />
      </Paper>

      {carregandoServicos || loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : servicos.length === 0 ? (
        <Paper shadow="xs" p="xl" radius="md">
          <Center>
            <Stack align="center" gap="xs">
              <IconHistory size={48} stroke={1} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed">
                {embarcacaoSelecionada
                  ? "Nenhum serviço registrado para esta embarcação"
                  : "Nenhum serviço registrado"}
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Paper shadow="xs" radius="md" style={{ overflow: "hidden" }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Data</Table.Th>
                <Table.Th>Embarcação</Table.Th>
                <Table.Th>Funcionário</Table.Th>
                <Table.Th>Serviços Realizados</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th w={60}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {servicos.map((srv) => {
                const statusConf = STATUS_CONFIG[srv.status] || {
                  label: srv.status,
                  color: "gray",
                };

                return (
                  <Table.Tr key={srv.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {formatarData(srv.data_execucao)}
                      </Text>
                    </Table.Td>
                    <Table.Td>{srv.embarcacao_nome || "—"}</Table.Td>
                    <Table.Td>{srv.funcionario_nome || "—"}</Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2}>
                        {srv.descricao}
                      </Text>
                      {srv.observacao && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          Obs: {srv.observacao}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={statusConf.color} size="sm">
                        {statusConf.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {podeAlterarStatus(srv.status) && (
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <Tooltip label="Alterar status">
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>Alterar Status</Menu.Label>
                            {podeIniciarExecucao(srv.status) && (
                              <Menu.Item
                                leftSection={<IconPlayerPlay size={14} />}
                                onClick={() =>
                                  atualizarStatus(srv.id, "em_execucao")
                                }
                              >
                                Iniciar Execução
                              </Menu.Item>
                            )}
                            {podeConcluirServico(srv.status) && (
                              <Menu.Item
                                leftSection={<IconCheck size={14} />}
                                color="green"
                                onClick={() =>
                                  atualizarStatus(srv.id, "concluido")
                                }
                              >
                                Marcar como Concluído
                              </Menu.Item>
                            )}
                          </Menu.Dropdown>
                        </Menu>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {servicos.length > 0 && (
        <Text size="sm" c="dimmed" mt="sm" ta="right">
          {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} encontrado
          {servicos.length !== 1 ? "s" : ""}
        </Text>
      )}
    </>
  );
}

export default Historico;
