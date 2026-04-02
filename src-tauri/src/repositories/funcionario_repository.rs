use rusqlite::{params, Connection};

use crate::error::AppError;
use crate::models::funcionario::{CreateFuncionario, Funcionario, UpdateFuncionario};

/// Repository responsável pelo acesso a dados de Funcionário

pub fn insert(conn: &Connection, data: &CreateFuncionario) -> Result<Funcionario, AppError> {
    conn.execute(
        "INSERT INTO funcionarios (nome, cargo, telefone) VALUES (?1, ?2, ?3)",
        params![data.nome, data.cargo, data.telefone],
    )?;

    let id = conn.last_insert_rowid();
    find_by_id(conn, id)
}

pub fn update(conn: &Connection, data: &UpdateFuncionario) -> Result<Funcionario, AppError> {
    let rows = conn.execute(
        "UPDATE funcionarios SET nome = ?1, cargo = ?2, telefone = ?3, ativo = ?4
         WHERE id = ?5",
        params![data.nome, data.cargo, data.telefone, data.ativo, data.id],
    )?;

    if rows == 0 {
        return Err(AppError::NotFound("Funcionário não encontrado".into()));
    }

    find_by_id(conn, data.id)
}

pub fn list(conn: &Connection) -> Result<Vec<Funcionario>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nome, cargo, telefone, ativo, created_at
         FROM funcionarios ORDER BY nome ASC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Funcionario {
            id: row.get(0)?,
            nome: row.get(1)?,
            cargo: row.get(2)?,
            telefone: row.get(3)?,
            ativo: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;

    let mut funcionarios = Vec::new();
    for row in rows {
        funcionarios.push(row?);
    }

    Ok(funcionarios)
}

pub fn list_ativos(conn: &Connection) -> Result<Vec<Funcionario>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, nome, cargo, telefone, ativo, created_at
         FROM funcionarios WHERE ativo = 1 ORDER BY nome ASC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Funcionario {
            id: row.get(0)?,
            nome: row.get(1)?,
            cargo: row.get(2)?,
            telefone: row.get(3)?,
            ativo: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;

    let mut funcionarios = Vec::new();
    for row in rows {
        funcionarios.push(row?);
    }

    Ok(funcionarios)
}

pub fn find_by_id(conn: &Connection, id: i64) -> Result<Funcionario, AppError> {
    conn.query_row(
        "SELECT id, nome, cargo, telefone, ativo, created_at
         FROM funcionarios WHERE id = ?1",
        params![id],
        |row| {
            Ok(Funcionario {
                id: row.get(0)?,
                nome: row.get(1)?,
                cargo: row.get(2)?,
                telefone: row.get(3)?,
                ativo: row.get(4)?,
                created_at: row.get(5)?,
            })
        },
    )
    .map_err(|_| AppError::NotFound("Funcionário não encontrado".into()))
}

pub fn search(conn: &Connection, termo: &str) -> Result<Vec<Funcionario>, AppError> {
    let termo_like = format!("%{}%", termo);
    let mut stmt = conn.prepare(
        "SELECT id, nome, cargo, telefone, ativo, created_at
         FROM funcionarios
         WHERE nome LIKE ?1 OR cargo LIKE ?1
         ORDER BY nome ASC"
    )?;

    let rows = stmt.query_map(params![termo_like], |row| {
        Ok(Funcionario {
            id: row.get(0)?,
            nome: row.get(1)?,
            cargo: row.get(2)?,
            telefone: row.get(3)?,
            ativo: row.get(4)?,
            created_at: row.get(5)?,
        })
    })?;

    let mut funcionarios = Vec::new();
    for row in rows {
        funcionarios.push(row?);
    }

    Ok(funcionarios)
}
