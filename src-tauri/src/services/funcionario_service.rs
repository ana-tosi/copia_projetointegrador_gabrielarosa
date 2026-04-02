use rusqlite::Connection;

use crate::error::AppError;
use crate::models::funcionario::{CreateFuncionario, Funcionario, UpdateFuncionario};
use crate::repositories::funcionario_repository;

/// Service Layer — regras de negócio de Funcionário

pub fn criar(conn: &Connection, data: CreateFuncionario) -> Result<Funcionario, AppError> {
    if data.nome.trim().is_empty() {
        return Err(AppError::Validation("Nome do funcionário é obrigatório".into()));
    }

    funcionario_repository::insert(conn, &data)
}

pub fn atualizar(conn: &Connection, data: UpdateFuncionario) -> Result<Funcionario, AppError> {
    if data.nome.trim().is_empty() {
        return Err(AppError::Validation("Nome do funcionário é obrigatório".into()));
    }

    funcionario_repository::update(conn, &data)
}

pub fn listar(conn: &Connection) -> Result<Vec<Funcionario>, AppError> {
    funcionario_repository::list(conn)
}

pub fn listar_ativos(conn: &Connection) -> Result<Vec<Funcionario>, AppError> {
    funcionario_repository::list_ativos(conn)
}

pub fn buscar(conn: &Connection, termo: String) -> Result<Vec<Funcionario>, AppError> {
    if termo.trim().is_empty() {
        return funcionario_repository::list(conn);
    }
    funcionario_repository::search(conn, &termo)
}
