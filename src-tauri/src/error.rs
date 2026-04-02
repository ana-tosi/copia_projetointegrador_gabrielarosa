use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub enum AppError {
    Database(String),
    NotFound(String),
    Validation(String),
    Unauthorized(String),
    Forbidden(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Database(msg) => write!(f, "Erro no banco de dados: {}", msg),
            AppError::NotFound(msg) => write!(f, "Não encontrado: {}", msg),
            AppError::Validation(msg) => write!(f, "Erro de validação: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Não autenticado: {}", msg),
            AppError::Forbidden(msg) => write!(f, "Acesso negado: {}", msg),
        }
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

// Tauri requires errors to be strings or implement Into<InvokeError>
impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}

