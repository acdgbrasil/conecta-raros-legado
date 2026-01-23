import { pg } from "../client/postgres.client";
import bcrypt from "bcrypt";

export async function seedIAM() {
  console.log("🌱 Iniciando Seed do IAM...");

  try {
    // 0. Setup
    await pg`SET TIME ZONE 'America/Fortaleza';`;

    // =================================================================
    // 1. PERMISSÕES (Capabilities)
    // =================================================================
    const permissions = [
      // IAM
      { slug: 'users:read', description: 'Ver lista de usuários' },
      { slug: 'users:write', description: 'Criar ou editar usuários' },
      { slug: 'users:block', description: 'Bloquear/Desbloquear acesso' },
      { slug: 'users:promote', description: 'Promover cargo de usuários' },

      // Social Care (Core)
      { slug: 'families:read', description: 'Visualizar dados familiares' },
      { slug: 'families:write', description: 'Cadastrar/Editar famílias' },

      // Reporting
      { slug: 'reports:read', description: 'Visualizar relatórios gerenciais' },
      
      // System
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
    // 2. ROLES (Cargos)
    // =================================================================
    
    // ADMIN
    const [adminRole] = await pg`
      INSERT INTO roles (name, description, is_system)
      VALUES ('ADMIN', 'Super Administrador', true)
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `;

    // OPERATOR (Equivalente ao 'user' do frontend)
    const [operatorRole] = await pg`
      INSERT INTO roles (name, description, is_system)
      VALUES ('OPERATOR', 'Operador Técnico Social', true)
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `;

    // =================================================================
    // 3. ROLE_PERMISSIONS
    // =================================================================

    // Admin = Tudo
    await pg`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT ${adminRole.id}, id FROM permissions
      ON CONFLICT DO NOTHING
    `;

    // Operator = Apenas Famílias e Relatórios
    await pg`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT ${operatorRole.id}, id FROM permissions 
      WHERE slug LIKE 'families:%' OR slug = 'reports:read'
      ON CONFLICT DO NOTHING
    `;

    // =================================================================
    // 4. SUPER ADMIN USER
    // =================================================================
    const adminEmail = process.env.SUPER_ADM_EMAIL || "admin@conecta.com";
    const adminPass = process.env.SUPER_ADM_PASSWORD || "admin_password";
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    // person_id gerado automaticamente pelo DEFAULT uuidv7() do banco
    await pg`
      INSERT INTO users (
        name, email, password_hash, role_id, is_active, 
        job_title, department
      )
      VALUES (
        'Super Admin', ${adminEmail}, ${hashedPassword}, ${adminRole.id}, true,
        'System Administrator', 'IT'
      )
      ON CONFLICT (email) DO NOTHING
    `;

    console.log("✅ Seed IAM Concluído!");
    console.log(`   Admin Role ID: ${adminRole.id}`);
    console.log(`   User: ${adminEmail}`);

  } catch (error) {
    console.error("❌ Erro no Seed:", error);
    process.exit(1);
  } finally {
    await pg.close();
  }
}

seedIAM();
