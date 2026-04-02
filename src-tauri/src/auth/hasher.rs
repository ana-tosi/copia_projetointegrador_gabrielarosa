use crate::error::AppError;
use rand::distr::Alphanumeric;
use rand::Rng;

/// Módulo de hashing — encapsula bcrypt e geração de senhas temporárias
/// Princípio: Single Responsibility — apenas operações criptográficas

const BCRYPT_COST: u32 = 10;
const TEMP_PASSWORD_LENGTH: usize = 8;

/// Hash de senha usando bcrypt (custo 10 — bom equilíbrio segurança/performance)
pub fn hash_password(plain: &str) -> Result<String, AppError> {
    bcrypt::hash(plain, BCRYPT_COST)
        .map_err(|e| AppError::Database(format!("Erro ao gerar hash: {}", e)))
}

/// Verifica se uma senha em texto plano corresponde ao hash bcrypt
pub fn verify_password(plain: &str, hash: &str) -> Result<bool, AppError> {
    bcrypt::verify(plain, hash)
        .map_err(|e| AppError::Database(format!("Erro ao verificar senha: {}", e)))
}

/// Gera senha temporária alfanumérica de 8 caracteres
/// Usa rand::thread_rng() que implementa CryptoRng (seguro para senhas)
pub fn generate_temp_password() -> String {
    rand::rng()
        .sample_iter(&Alphanumeric)
        .take(TEMP_PASSWORD_LENGTH)
        .map(char::from)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_and_verify() {
        let plain = "minha_senha_123";
        let hash = hash_password(plain).unwrap();
        assert!(verify_password(plain, &hash).unwrap());
        assert!(!verify_password("senha_errada", &hash).unwrap());
    }

    #[test]
    fn test_temp_password_length() {
        let temp = generate_temp_password();
        assert_eq!(temp.len(), TEMP_PASSWORD_LENGTH);
        assert!(temp.chars().all(|c| c.is_ascii_alphanumeric()));
    }
}
