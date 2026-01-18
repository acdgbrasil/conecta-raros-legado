import { PoolClient } from "pg";

const CREATE_ROLES_TABLE = `
  CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
  );
`;

const INSERT_DEFAULT_ROLES = `
  INSERT INTO roles (name, description) VALUES
      ('ADMIN', 'Acesso total ao sistema e gerenciamento de usuários'),
      ('TERAPIAS', 'Acesso aos prontuários e evolução de pacientes'),
      ('JURIDICO', 'Acesso a documentos e processos legais'),
      ('FINANCEIRO', 'Acesso a informações financeiras e faturamento'),
      ('SERVICOS_GERAIS', 'Acesso operacional básico'),
      ('PACIENTE', 'Acesso limitado ao próprio prontuário e agendamentos')
  ON CONFLICT (name) DO NOTHING;
`;

export const migration_roles_setup_2026_01_18 = async (pgClient: PoolClient) => {
    try {
        console.log('--- [MIGRATION] Iniciando Setup de Roles ---');
        await pgClient.query(CREATE_ROLES_TABLE);
        console.log('--- [MIGRATION] Tabela de Roles criada com sucesso ---');
        await pgClient.query(INSERT_DEFAULT_ROLES);
        console.log('--- [MIGRATION] Roles padrão inseridas com sucesso ---');
    } catch (error) {
        console.error('--- [MIGRATION] Erro durante a migração de Roles ---', error);
        throw error;
    }
};