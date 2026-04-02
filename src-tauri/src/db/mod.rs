pub mod migrations;

use rusqlite::Connection;
use std::path::PathBuf;

use crate::error::AppError;

/// Inicializa o banco de dados SQLite no diretório de dados da aplicação
pub fn initialize(app_data_dir: PathBuf) -> Result<Connection, AppError> {
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| AppError::Database(format!("Erro ao criar diretório: {}", e)))?;

    let db_path = app_data_dir.join("dados.db");
    let conn = Connection::open(&db_path)?;

    // Habilitar foreign keys (desabilitado por padrão no SQLite)
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;
    // WAL mode para melhor performance em leituras concorrentes
    conn.execute_batch("PRAGMA journal_mode = WAL;")?;

    migrations::run(&conn)?;

    Ok(conn)
}
