import { pg } from "../client/postgres.client";

export async function createNotificationTables() {
  console.log("🛠️  Criando tabelas de Notificações...");

  try {
    // 0. Configura Timezone
    await pg`SET TIME ZONE 'America/Fortaleza';`;

    // 1. Tipos ENUM Nativos (Type Safety & Performance)
    // Try/Catch para evitar erro se já existirem
    try { await pg`CREATE TYPE notification_channel_enum AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');`; } catch {}
    try { await pg`CREATE TYPE notification_status_enum AS ENUM ('PENDING', 'SENT', 'FAILED');`; } catch {}

    // 2. Tabela NOTIFICATIONS
    // Mudança: VARCHAR -> TEXT, TIMESTAMP -> TIMESTAMPTZ
    // Mudança: Strings -> ENUMs
    await pg`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuidv7(),
        
        -- Core Data
        recipient TEXT NOT NULL,
        channel notification_channel_enum NOT NULL,
        status notification_status_enum NOT NULL DEFAULT 'PENDING',
        
        subject TEXT,
        content TEXT NOT NULL,
        
        -- Traceability
        recipient_id UUID, -- Loose coupling (sem FK restritiva para permitir envio a não-usuários)
        metadata JSONB DEFAULT '{}',
        
        -- Timestamps
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    // Índice de busca por destinatário
    await pg`CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);`;

    // Índice Parcial para WORKERS (High Performance Queue Pattern)
    // Permite que workers encontrem instantaneamente o que precisa ser processado
    await pg`
      CREATE INDEX IF NOT EXISTS idx_notifications_pending_worker 
      ON notifications(created_at) 
      WHERE status = 'PENDING';
    `;
    
    console.log("✅ Tabela 'notifications' pronta.");

  } catch (error) {
    console.error("❌ Erro na migração de Notificações:", error);
    process.exit(1);
  } finally {
    await pg.close();
  }
}

createNotificationTables();
