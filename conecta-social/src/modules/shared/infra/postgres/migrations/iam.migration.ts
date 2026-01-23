import { pg } from "../client/postgres.client";

export async function createIAMTables() {
  console.log("🛠️  Iniciando Migração das Tabelas IAM...");

  try {
    // 0. Configurações de Sessão e Extensões
    await pg`SET TIME ZONE 'America/Fortaleza';`;
    await pg`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

    // ==========================================================
    // 1. Tabela de CARGOS (Roles)
    // ==========================================================
    // Mudança: VARCHAR -> TEXT, TIMESTAMP -> TIMESTAMPTZ
    await pg`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // ==========================================================
    // 2. Tabela de PERMISSÕES (Permissions)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // ==========================================================
    // 3. Tabela Pivô (Role <-> Permission)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `;

    // ==========================================================
    // 4. Tabela de USUÁRIOS (Users)
    // ==========================================================
    // Mudança: Adicionado person_id (Golden Record)
    // Mudança: created_by com FK Self-Reference
    // Mudança: Tipagem forte (TEXT, TIMESTAMPTZ)
    // Removido: cpf (Desnormalizado/Desnecessário neste Contexto)
    await pg`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        
        -- Identity Integration (Golden Record)
        person_id UUID UNIQUE DEFAULT uuidv7(),
        
        -- Core Identity
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        
        -- Access Control
        role_id UUID NOT NULL REFERENCES roles(id), 
        is_active BOOLEAN DEFAULT true,
        force_change_password BOOLEAN DEFAULT true,
        
        -- Organizational Info
        job_title TEXT,
        department TEXT,
        
        -- Audit & Metadata
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await pg`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await pg`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_person_id ON users(person_id);`;
    await pg`CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);`;
    await pg`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);`;

    // ==========================================================
    // 5. Tabela de REFRESH TOKENS
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        is_revoked BOOLEAN DEFAULT false,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await pg`CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash);`;

    // ==========================================================
    // 6. Tabela de CÓDIGOS DE RECUPERAÇÃO
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS recovery_codes (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await pg`CREATE INDEX IF NOT EXISTS idx_recovery_user_id ON recovery_codes(user_id);`;

    // ==========================================================
    // 7. Tabela de LOGS DE AUDITORIA
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        resource TEXT,
        resource_id UUID,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await pg`CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);`;
    await pg`CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);`;

    // ==========================================================
    // 8. Tabela de CONVITES (Invites)
    // ==========================================================
    await pg`
      CREATE TABLE IF NOT EXISTS invites (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        email TEXT NOT NULL,
        role_id UUID NOT NULL REFERENCES roles(id),
        invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
        token TEXT NOT NULL,
        accepted BOOLEAN DEFAULT false,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await pg`CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);`;
    await pg`CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);`;

    console.log("✅ Tabelas IAM (re)criadas com sucesso!");

  } catch (error) {
    console.error("❌ Erro fatal na migração IAM:", error);
    process.exit(1);
  } finally {
    await pg.close();
  }
}

createIAMTables();
