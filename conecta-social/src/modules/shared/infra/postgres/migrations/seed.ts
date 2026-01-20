import { pg } from "../client/postgres.client";

export async function seedIAM() {
  console.log("🌱 Iniciando Seed do IAM...");

  // =================================================================
  // 1. CRIAR PERMISSÕES (Capabilities do Sistema)
  // =================================================================
  // Definimos aqui tudo o que o sistema "sabe fazer"
  const permissions = [
    // Gestão de Usuários (Apenas Admins)
    { slug: 'users:read', description: 'Ver lista de usuários' },
    { slug: 'users:write', description: 'Criar ou editar usuários' },
    { slug: 'users:block', description: 'Bloquear/Desbloquear acesso' },
    { slug: 'users:promote', description: 'Promover cargo de usuários' },

    // Gestão de Famílias (Core Business)
    { slug: 'families:read', description: 'Visualizar dados familiares' },
    { slug: 'families:write', description: 'Cadastrar/Editar famílias' },

    // Relatórios e Dashboards
    { slug: 'reports:read', description: 'Visualizar relatórios gerenciais' },
    
    // Configurações
    { slug: 'settings:read', description: 'Ver configurações do sistema' },
    { slug: 'settings:write', description: 'Alterar configurações do sistema' },
  ];

  for (const p of permissions) {
    await pg`
      INSERT INTO permissions (slug, description)
      VALUES (${p.slug}, ${p.description})
      ON CONFLICT (slug) DO NOTHING;
    `;
  }

  // =================================================================
  // 2. CRIAR ROLES (Cargos Padrão)
  // =================================================================
  
  // --- ADMIN (O Deus do Sistema) ---
  // is_system = true impede que alguém delete esse cargo por engano
  const [adminRole] = await pg`
    INSERT INTO roles (name, description, is_system)
    VALUES ('ADMIN', 'Super Administrador - Acesso Total', true)
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `;

  // --- OPERATOR (O Trabalhador Padrão) ---
  const [operatorRole] = await pg`
    INSERT INTO roles (name, description, is_system)
    VALUES ('OPERATOR', 'Operador Social - Gestão de Famílias', true)
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `;

  // =================================================================
  // 3. VINCULAR PERMISSÕES (Dar Poderes aos Cargos)
  // =================================================================

  // Admin ganha TODAS as permissões que existem no banco
  await pg`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT ${adminRole.id}, id FROM permissions
    ON CONFLICT DO NOTHING
  `;

  // Operator ganha apenas permissões de Família e Leitura de Relatórios
  // Ele NÃO pode mexer em usuários (users:*)
  await pg`
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT ${operatorRole.id}, id FROM permissions 
    WHERE slug LIKE 'families:%' OR slug = 'reports:read'
    ON CONFLICT DO NOTHING
  `;

  console.log("✅ IAM Seeded com Sucesso!");
  console.log(`   🔑 ID do Admin Role: ${adminRole.id}`);
  console.log(`   🛡️ ID do Operator Role: ${operatorRole.id}`);
}