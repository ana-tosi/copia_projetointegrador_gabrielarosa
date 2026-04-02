# MarinaFlow: Sistema web de gestão e controle de serviços para a Marina Porto Seguro.

Sistema desktop focado na gestão de embarcações, funcionários e registros de serviços marítimos. Construído com foco em performance, segurança e usabilidade.

---

## 🚀 Tecnologias

- **Backend**: Rust + Tauri
- **Frontend**: React + Vite
- **UI Framework**: Mantine UI
- **Banco de Dados**: SQLite (Relacional e Local)
- **Segurança**: RBAC (Role-Based Access Control) + Bcrypt hashing

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

1.  **[Node.js](https://nodejs.org/)** (v18+)
2.  **[Rust](https://www.rust-lang.org/tools/install)** (Cargo e Rustc)
3.  **Dependências do Tauri**: Siga o [guia oficial de instalação](https://tauri.app/v1/guides/getting-started/prerequisites) para o seu sistema operacional (Windows, macOS ou Linux).

---

## 🛠️ Configuração e Instalação

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd ProjetoIntegrador-I-UNIVESP
```

### 2. Instalar dependências (Node)
```bash
npm install
```

### 3. Executar o projeto em desenvolvimento
```bash
npm run desktop
```

---

## 🗄️ Banco de Dados e Inicialização

O sistema utiliza **SQLite** para persistência local, eliminando a necessidade de configurar um servidor de banco de dados externo.

- **Arquivos**: O banco de dados (`dados.db`) é criado automaticamente no diretório de dados da sua aplicação (ex: `App Data` no Windows ou `Library/Application Support` no Mac).
- **Esquema**: As tabelas e migrações são executadas **automaticamente** na primeira vez que o sistema é aberto. Não é necessário rodar scripts SQL manuais.

---

## 🔐 Primeiro Acesso (Autenticação)

O sistema conta com um usuário administrador padrão pré-configurado:

-   **Login:** `admin`
-   **Senha:** `admin123`

> [!IMPORTANT]
> **Segurança de Primeiro Acesso**: No primeiro login com o usuário `admin`, o sistema exigirá que você defina uma nova senha segura. Só após esta etapa as funcionalidades do sistema serão liberadas.

---

## 📁 Estrutura do Projeto

*   `/src`: Código-fonte do frontend (React, Mantine).
*   `/src-tauri`: Código-fonte do backend (Rust, SQLite).
*   `/src-tauri/src/db`: Gerenciador de inicialização e migrações do banco.
*   `/src-tauri/src/auth`: Núcleo de segurança e controle de acesso.

---

## 🎓 Projeto Integrador — UNIVESP

Este projeto faz parte do portfólio acadêmico desenvolvido para a Universidade Virtual do Estado de São Paulo.
