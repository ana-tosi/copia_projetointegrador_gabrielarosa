use rusqlite::{params, Connection};

use crate::error::AppError;
use crate::models::embarcacao::{CreateEmbarcacao, Embarcacao, UpdateEmbarcacao};

/// Repository responsável pelo acesso a dados de Embarcação
/// Princípio: Single Responsibility — apenas SQL, sem lógica de negócio

pub fn insert(conn: &Connection, data: &CreateEmbarcacao) -> Result<Embarcacao, AppError> {
    conn.execute(
        "INSERT INTO embarcacoes (nome, identificacao, modelo, tipo, comprimento, ano_fabricacao, cliente_responsavel)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            data.nome,
            data.identificacao,
            data.modelo,
            data.tipo,
            data.comprimento,
            data.ano_fabricacao,
            data.cliente_responsavel,
        ],
    )?;

    let id = conn.last_insert_rowid();
    find_by_id(conn, id)
}

pub fn update(conn: &Connection, data: &UpdateEmbarcacao) -> Result<Embarcacao, AppError> {
    let rows = conn.execute(
        "UPDATE embarcacoes SET nome = ?1, identificacao = ?2, modelo = ?3, tipo = ?4,
         comprimento = ?5, ano_fabricacao = ?6, cliente_responsavel = ?7, status = ?8,
         updated_at = datetime('now', 'localtime')
         WHERE id = ?9",
        params![
            data.nome,
            data.identificacao,
            data.modelo,
            data.tipo,
            data.comprimento,
            data.ano_fabricacao,
            data.cliente_responsavel,
            data.status,
            data.id,
        ],
    )?;

    if rows == 0 {
        return Err(AppError::NotFound("Embarcação não encontrada".into()));
    }

    find_by_id(conn, data.id)
}

pub fn list(conn: &Connection) -> Result<Vec<Embarcacao>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nome, identificacao, modelo, tipo, comprimento, ano_fabricacao,
                cliente_responsavel, status, created_at, updated_at
         FROM embarcacoes ORDER BY nome ASC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Embarcacao {
            id: row.get(0)?,
            nome: row.get(1)?,
            identificacao: row.get(2)?,
            modelo: row.get(3)?,
            tipo: row.get(4)?,
            comprimento: row.get(5)?,
            ano_fabricacao: row.get(6)?,
            cliente_responsavel: row.get(7)?,
            status: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    let mut embarcacoes = Vec::new();
    for row in rows {
        embarcacoes.push(row?);
    }

    Ok(embarcacoes)
}

pub fn find_by_id(conn: &Connection, id: i64) -> Result<Embarcacao, AppError> {
    conn.query_row(
        "SELECT id, nome, identificacao, modelo, tipo, comprimento, ano_fabricacao,
                cliente_responsavel, status, created_at, updated_at
         FROM embarcacoes WHERE id = ?1",
        params![id],
        |row| {
            Ok(Embarcacao {
                id: row.get(0)?,
                nome: row.get(1)?,
                identificacao: row.get(2)?,
                modelo: row.get(3)?,
                tipo: row.get(4)?,
                comprimento: row.get(5)?,
                ano_fabricacao: row.get(6)?,
                cliente_responsavel: row.get(7)?,
                status: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        },
    )
    .map_err(|_| AppError::NotFound("Embarcação não encontrada".into()))
}

pub fn search(conn: &Connection, termo: &str) -> Result<Vec<Embarcacao>, AppError> {
    let termo_like = format!("%{}%", termo);
    let mut stmt = conn.prepare(
        "SELECT id, nome, identificacao, modelo, tipo, comprimento, ano_fabricacao,
                cliente_responsavel, status, created_at, updated_at
         FROM embarcacoes
         WHERE nome LIKE ?1 OR identificacao LIKE ?1 OR cliente_responsavel LIKE ?1
         ORDER BY nome ASC"
    )?;

    let rows = stmt.query_map(params![termo_like], |row| {
        Ok(Embarcacao {
            id: row.get(0)?,
            nome: row.get(1)?,
            identificacao: row.get(2)?,
            modelo: row.get(3)?,
            tipo: row.get(4)?,
            comprimento: row.get(5)?,
            ano_fabricacao: row.get(6)?,
            cliente_responsavel: row.get(7)?,
            status: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    let mut embarcacoes = Vec::new();
    for row in rows {
        embarcacoes.push(row?);
    }

    Ok(embarcacoes)
}
