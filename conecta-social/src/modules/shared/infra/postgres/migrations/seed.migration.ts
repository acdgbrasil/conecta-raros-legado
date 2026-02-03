import { pg } from "../client/postgres.client";
import { PermissionMapper } from "../../../../iam/application/mappers/permission/Permission.mapper";

export async function seedIAM() {
  console.log("🌱 Iniciando Seed IAM (Bootstrap)...");

  try {
    await pg`SET TIME ZONE 'America/Fortaleza';`;
    
    const adminEmail = Bun.env.SUPER_ADM_EMAIL || "admin@conecta.com";
    const adminPass = Bun.env.SUPER_ADM_PASSWORD || "admin_password";

    // =================================================================
    // 1. PERMISSÕES DE BOOTSTRAP (Usando a Lei definida no Mapper)
    // =================================================================
    console.log("   --> Semeando Permissões Essenciais...");
    
    const { IAM_PERMISSIONS: P } = PermissionMapper;

    const bootstrapPermissions = [
      { slug: P.USERS.CREATE, description: 'Criar usuários', module: 'iam' },
      { slug: P.USERS.READ, description: 'Listar usuários', module: 'iam' },
      { slug: P.USERS.UPDATE, description: 'Editar detalhes de usuários', module: 'iam' },
      { slug: P.USERS.STATUS, description: 'Ativar/Desativar usuários (Last Admin protection)', module: 'iam' },
      { slug: P.ROLES.CREATE, description: 'Criar novos cargos customizados', module: 'iam' },
      { slug: P.ROLES.READ, description: 'Listar cargos e suas permissões', module: 'iam' },
      { slug: P.ROLES.UPDATE, description: 'Editar permissões e nomes de cargos', module: 'iam' },
      { slug: P.ROLES.DELETE, description: 'Remover cargos (Role in use protection)', module: 'iam' },
      { slug: P.ROLES.ASSIGN, description: 'Atribuir ou trocar cargos de usuários', module: 'iam' },
      { slug: P.PERMISSIONS.READ, description: 'Listar catálogo de permissões do sistema', module: 'iam' }
    ];

    for (const p of bootstrapPermissions) {
      await pg`
        INSERT INTO permissions (slug, description, module)
        VALUES (${p.slug}, ${p.description}, ${p.module})
        ON CONFLICT (slug) DO UPDATE SET 
          description = EXCLUDED.description,
          module = EXCLUDED.module;
      `;
    }

    // =================================================================
    // 2. ROLE SUPER ADMIN (System Protected)
    // =================================================================
    console.log("   --> Semeando Role SuperAdmin...");
    
    const [adminRole] = await pg`
      INSERT INTO roles (name, description, is_system)
      VALUES ('SuperAdmin', 'Acesso irrestrito ao gerenciamento do sistema', true)
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `;

    // =================================================================
    // 3. VÍNCULO (Admin -> Bootstrap Permissions)
    // =================================================================
    // Nota: O SuperAdmin conceitualmente pode ter bypass de permissão no código,
    // mas vinculamos explicitamente para manter a consistência do modelo RBAC.
    await pg`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT ${adminRole.id}, id FROM permissions 
      WHERE slug IN ${pg(bootstrapPermissions.map(p => p.slug))}
      ON CONFLICT DO NOTHING
    `;

    // =================================================================
    // 4. USUÁRIO ROOT
    // =================================================================
    console.log(`   --> Criando Root User (${adminEmail})...`);
    
    const hashedPassword = await Bun.password.hash(adminPass);

    await pg`
      INSERT INTO users (
        name, email, password_hash, role_id, is_active, 
        job_title, department, force_change_password
      )
      VALUES (
        'Root Administrator', ${adminEmail}, ${hashedPassword}, ${adminRole.id}, true,
        'SysAdmin', 'Infra', false
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        is_active = true
    `;

    console.log("✅ IAM Bootstrap Concluído!");
    console.log(`   🔑 SuperAdmin Role ID: ${adminRole.id}`);

  } catch (error) {
    console.error("❌ Erro no Seed:", error);
    process.exit(1);
  } finally {
    await pg.close();
  }
}

seedIAM();
