use rusqlite::Connection;

use crate::error::AppError;
use crate::models::servico::{CreateServico, Servico, UpdateServicoStatus};
use crate::repositories::{embarcacao_repository, funcionario_repository, servico_repository};

/// Service Layer — regras de negócio e invariantes de Serviço
/// Aqui ficam todas as invariantes críticas do domínio (INV01, INV02, INV03)

pub fn criar(conn: &Connection, data: CreateServico) -> Result<Servico, AppError> {
    // INV01 — serviço sem embarcação não existe
    embarcacao_repository::find_by_id(conn, data.embarcacao_id)
        .map_err(|_| AppError::Validation("Embarcação selecionada não existe".into()))?;

    // INV02 — serviço sem funcionário não existe
    let funcionario = funcionario_repository::find_by_id(conn, data.funcionario_id)
        .map_err(|_| AppError::Validation("Funcionário selecionado não existe".into()))?;

    // Validação adicional: funcionário deve estar ativo
    if !funcionario.ativo {
        return Err(AppError::Validation("Funcionário selecionado está inativo".into()));
    }

    // Validações de campos obrigatórios
    if data.descricao.trim().is_empty() {
        return Err(AppError::Validation("Descrição do serviço é obrigatória".into()));
    }
    if data.data_execucao.trim().is_empty() {
        return Err(AppError::Validation("Data de execução é obrigatória".into()));
    }

    servico_repository::insert(conn, &data)
}

pub fn atualizar_status(conn: &Connection, data: UpdateServicoStatus) -> Result<Servico, AppError> {
    // Validar status
    let status_validos = ["pendente", "em_execucao", "concluido"];
    if !status_validos.contains(&data.status.as_str()) {
        return Err(AppError::Validation(
            format!("Status inválido. Use: {}", status_validos.join(", "))
        ));
    }

    // INV03 — serviço concluído não pode ser reaberto (proteção extra)
    let servico_atual = servico_repository::find_by_id(conn, data.id)?;
    if servico_atual.status == "concluido" && data.status != "concluido" {
        return Err(AppError::Validation(
            "Serviço concluído não pode ter status alterado".into()
        ));
    }

    servico_repository::update_status(conn, &data)
}

pub fn listar_todos(conn: &Connection) -> Result<Vec<Servico>, AppError> {
    servico_repository::list_all(conn)
}

pub fn listar_por_embarcacao(conn: &Connection, embarcacao_id: i64) -> Result<Vec<Servico>, AppError> {
    // Validar que a embarcação existe
    embarcacao_repository::find_by_id(conn, embarcacao_id)?;
    servico_repository::list_by_embarcacao(conn, embarcacao_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;
    use crate::db::migrations;
    use crate::models::embarcacao::CreateEmbarcacao;
    use crate::models::funcionario::CreateFuncionario;
    use crate::services::{embarcacao_service, funcionario_service};

    fn setup_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        migrations::run(&conn).unwrap();
        conn
    }

    #[test]
    fn test_criar_servico_valida_embarcacao_existente() {
        let conn = setup_db();
        // Não criamos nenhuma embarcação, então o ID 1 não existe
        let data = CreateServico {
            embarcacao_id: 1,
            funcionario_id: 1,
            descricao: "Teste".into(),
            data_execucao: "2024-01-01".into(),
            observacao: None,
        };
        
        let result = criar(&conn, data);
        assert!(matches!(result, Err(AppError::Validation(_))));
    }

    #[test]
    fn test_criar_servico_valida_funcionario_existente() {
        let conn = setup_db();
        // Criar embarcação mas não funcionário
        let emb = embarcacao_service::criar(&conn, CreateEmbarcacao {
            nome: "Veleiro Teste".into(),
            identificacao: "NAV-01".into(),
            modelo: None,
            tipo: None,
            comprimento: None,
            ano_fabricacao: None,
            cliente_responsavel: None,
        }).unwrap();

        let data = CreateServico {
            embarcacao_id: emb.id,
            funcionario_id: 1, // ID não existe
            descricao: "Teste".into(),
            data_execucao: "2024-01-01".into(),
            observacao: None,
        };
        
        let result = criar(&conn, data);
        assert!(matches!(result, Err(AppError::Validation(_))));
    }

    #[test]
    fn test_inv03_impede_reabrir_servico_concluido() {
        let conn = setup_db();
        // Setup: criar embarcação, funcionário e serviço
        let emb = embarcacao_service::criar(&conn, CreateEmbarcacao {
            nome: "EB-1".into(), identificacao: "ID-1".into(),
            modelo: None, tipo: None, comprimento: None, ano_fabricacao: None, cliente_responsavel: None,
        }).unwrap();
        
        let func = funcionario_service::criar(&conn, CreateFuncionario {
            nome: "João".into(), cargo: None, telefone: None,
        }).unwrap();

        let srv = criar(&conn, CreateServico {
            embarcacao_id: emb.id,
            funcionario_id: func.id,
            descricao: "Conserto".into(),
            data_execucao: "2024-01-01".into(),
            observacao: None,
        }).unwrap();

        // Concluir serviço
        let srv = atualizar_status(&conn, UpdateServicoStatus {
            id: srv.id,
            status: "concluido".into(),
            observacao: None,
        }).unwrap();

        // Tentar reabrir para pendente (INV03)
        let result = atualizar_status(&conn, UpdateServicoStatus {
            id: srv.id,
            status: "pendente".into(),
            observacao: None,
        });

        assert!(matches!(result, Err(AppError::Validation(_))));
    }
}
