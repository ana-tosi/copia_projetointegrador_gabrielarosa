use rusqlite::{params, Connection};

use crate::error::AppError;
use crate::models::servico::{CreateServico, Servico, UpdateServicoStatus};

/// Repository responsável pelo acesso a dados de Serviço
/// Nota: nunca deleta serviços fisicamente (INV03)

pub fn insert(conn: &Connection, data: &CreateServico) -> Result<Servico, AppError> {
    conn.execute(
        "INSERT INTO servicos (embarcacao_id, funcionario_id, descricao, data_execucao, observacao)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            data.embarcacao_id,
            data.funcionario_id,
            data.descricao,
            data.data_execucao,
            data.observacao,
        ],
    )?;

    let id = conn.last_insert_rowid();
    find_by_id(conn, id)
}

pub fn update_status(conn: &Connection, data: &UpdateServicoStatus) -> Result<Servico, AppError> {
    let rows = conn.execute(
        "UPDATE servicos SET status = ?1, observacao = ?2,
         updated_at = datetime('now', 'localtime')
         WHERE id = ?3",
        params![data.status, data.observacao, data.id],
    )?;

    if rows == 0 {
        return Err(AppError::NotFound("Serviço não encontrado".into()));
    }

    find_by_id(conn, data.id)
}

pub fn list_all(conn: &Connection) -> Result<Vec<Servico>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT s.id, s.embarcacao_id, s.funcionario_id, s.descricao, s.data_execucao,
                s.status, s.observacao, s.created_at, s.updated_at,
                e.nome as embarcacao_nome, f.nome as funcionario_nome
         FROM servicos s
         INNER JOIN embarcacoes e ON s.embarcacao_id = e.id
         INNER JOIN funcionarios f ON s.funcionario_id = f.id
         ORDER BY s.data_execucao DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Servico {
            id: row.get(0)?,
            embarcacao_id: row.get(1)?,
            funcionario_id: row.get(2)?,
            descricao: row.get(3)?,
            data_execucao: row.get(4)?,
            status: row.get(5)?,
            observacao: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            embarcacao_nome: row.get(9)?,
            funcionario_nome: row.get(10)?,
        })
    })?;

    let mut servicos = Vec::new();
    for row in rows {
        servicos.push(row?);
    }

    Ok(servicos)
}

pub fn list_by_embarcacao(conn: &Connection, embarcacao_id: i64) -> Result<Vec<Servico>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT s.id, s.embarcacao_id, s.funcionario_id, s.descricao, s.data_execucao,
                s.status, s.observacao, s.created_at, s.updated_at,
                e.nome as embarcacao_nome, f.nome as funcionario_nome
         FROM servicos s
         INNER JOIN embarcacoes e ON s.embarcacao_id = e.id
         INNER JOIN funcionarios f ON s.funcionario_id = f.id
         WHERE s.embarcacao_id = ?1
         ORDER BY s.data_execucao DESC"
    )?;

    let rows = stmt.query_map(params![embarcacao_id], |row| {
        Ok(Servico {
            id: row.get(0)?,
            embarcacao_id: row.get(1)?,
            funcionario_id: row.get(2)?,
            descricao: row.get(3)?,
            data_execucao: row.get(4)?,
            status: row.get(5)?,
            observacao: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            embarcacao_nome: row.get(9)?,
            funcionario_nome: row.get(10)?,
        })
    })?;

    let mut servicos = Vec::new();
    for row in rows {
        servicos.push(row?);
    }

    Ok(servicos)
}

pub fn find_by_id(conn: &Connection, id: i64) -> Result<Servico, AppError> {
    conn.query_row(
        "SELECT s.id, s.embarcacao_id, s.funcionario_id, s.descricao, s.data_execucao,
                s.status, s.observacao, s.created_at, s.updated_at,
                e.nome as embarcacao_nome, f.nome as funcionario_nome
         FROM servicos s
         INNER JOIN embarcacoes e ON s.embarcacao_id = e.id
         INNER JOIN funcionarios f ON s.funcionario_id = f.id
         WHERE s.id = ?1",
        params![id],
        |row| {
            Ok(Servico {
                id: row.get(0)?,
                embarcacao_id: row.get(1)?,
                funcionario_id: row.get(2)?,
                descricao: row.get(3)?,
                data_execucao: row.get(4)?,
                status: row.get(5)?,
                observacao: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                embarcacao_nome: row.get(9)?,
                funcionario_nome: row.get(10)?,
            })
        },
    )
    .map_err(|_| AppError::NotFound("Serviço não encontrado".into()))
}
