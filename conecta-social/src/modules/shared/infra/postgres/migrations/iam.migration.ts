import { pg } from "../client/postgres.client"; // Ajuste o import conforme seu client

export async function createIAMTables() {
  console.log("🛠️  Iniciando Migração das Tabelas IAM...");

  try {
    // 1. Garante extensão para gerar UUIDs (se ainda não tiver)
    await pg`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

    // ==========================================================
    // 2. Tabela de CARGOS (Roles)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        is_system BOOLEAN DEFAULT false, -- Protege cargos nativos (Admin/Operator) de deleção
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // ==========================================================
    // 3. Tabela de PERMISSÕES (Capabilities)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) NOT NULL UNIQUE, -- ex: 'users:read', 'families:write'
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // ==========================================================
    // 4. Tabela Pivô (Role <-> Permission)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `;

    // ==========================================================
    // 5. Tabela de USUÁRIOS (Users)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Identificação
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255), -- Pode ser null se usuário for convidado e ainda não definiu senha
        
        -- Relacionamento
        role_id UUID NOT NULL REFERENCES roles(id), 
        
        -- Dados Corporativos (Opcionais)
        cpf VARCHAR(14),
        job_title VARCHAR(100),
        department VARCHAR(100),
        
        -- Controle de Acesso
        is_active BOOLEAN DEFAULT true,
        force_change_password BOOLEAN DEFAULT true,
        
        -- Auditoria
        created_by UUID, -- Self-reference (não coloco FK estrita para evitar deadlock no primeiro user)
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Índices para performance
    await pg`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await pg`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);`;

    // ==========================================================
    // 6. Tabela de REFRESH TOKENS (Segurança)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL, -- Guardamos o hash, nunca o token puro
        is_revoked BOOLEAN DEFAULT false,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Índice para busca rápida do token durante o refresh
    await pg`CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash);`;


    // ==========================================================
    // 7. Tabela de CÓDIGOS DE RECUPERAÇÃO (Segurança)
    // ==========================================================
    await pg`
    CREATE TABLE IF NOT EXISTS recovery_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL, -- O código de 6 dígitos
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
    `;

    // Índice para busca rápida por email
    await pg`CREATE INDEX IF NOT EXISTS idx_recovery_email ON recovery_codes(email);`

  console.log("✅ Tabelas IAM criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro fatal na migração IAM:", error);
    throw error;
  }
}