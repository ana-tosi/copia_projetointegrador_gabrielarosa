use serde::{Deserialize, Serialize};

/// Entidade Serviço — registro operacional principal
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Servico {
    pub id: i64,
    pub embarcacao_id: i64,
    pub funcionario_id: i64,
    pub descricao: String,
    pub data_execucao: String,
    pub status: String,
    pub observacao: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    // Campos joined para exibição
    pub embarcacao_nome: Option<String>,
    pub funcionario_nome: Option<String>,
}

/// DTO para criação de serviço
#[derive(Debug, Deserialize)]
pub struct CreateServico {
    pub embarcacao_id: i64,
    pub funcionario_id: i64,
    pub descricao: String,
    pub data_execucao: String,
    pub observacao: Option<String>,
}

/// DTO para atualização de status do serviço
#[derive(Debug, Deserialize)]
pub struct UpdateServicoStatus {
    pub id: i64,
    pub status: String,
    pub observacao: Option<String>,
}
