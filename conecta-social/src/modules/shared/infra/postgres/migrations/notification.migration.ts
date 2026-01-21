import { pg } from "../client/postgres.client"; // Ajuste para seu client

export async function createNotificationTables() {
  console.log("🛠️  Criando tabelas de Notificações...");

  await pg`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      
      -- Dados de Envio
      recipient VARCHAR(255) NOT NULL,
      channel VARCHAR(50) NOT NULL, -- EMAIL, SMS, ETC
      subject VARCHAR(255),         -- Pode ser null (SMS não tem assunto)
      content TEXT NOT NULL,        -- O corpo da mensagem
      
      -- Rastreabilidade
      recipient_id UUID,            -- Opcional: Link com a tabela Users se quiser
      metadata JSONB DEFAULT '{}',  -- Aqui guardamos o erro ou o ID da AWS/Provider
      
      -- Controle
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      sent_at TIMESTAMP,
      
      -- Timestamps padrão
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  // Índice para buscar histórico de um usuário rápido
  await pg`CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);`;
  
  console.log("✅ Tabela 'notifications' pronta.");
}