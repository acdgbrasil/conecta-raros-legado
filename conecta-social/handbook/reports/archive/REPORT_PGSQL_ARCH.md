# Relatório de Auditoria Arquitetural PostgreSQL
**Agente:** PGSQL_ARCH_Agent
**Data:** 23/01/2026
**Escopo:** `@conecta-social/src/modules/shared/infra/postgres/migrations` vs Módulos de Domínio

## 🚨 Sumário Executivo
A análise revelou inconsistências críticas entre a modelagem de dados e as melhores práticas do PostgreSQL, especificamente no tratamento de **fusos horários (Timezones)**, **integridade referencial** e **tipagem forte**.

A atual definição de schema (`TIMESTAMP` sem timezone) é uma bomba-relógio para ambientes de produção distribuídos (AWS/GCP), garantindo bugs de "off-by-N-hours". Além disso, a ausência de Enums nativos e Foreign Keys "preguiçosas" comprometem a qualidade dos dados a longo prazo.

---

## 1. 🛑 Inconsistências Críticas (Must Fix)

### 1.1. O Problema do `TIMESTAMP` (O Erro #1)
**Local:** Todas as tabelas (`users`, `notifications`, `refresh_tokens`, etc.)
**Problema:** O uso de `TIMESTAMP` (equivale a `TIMESTAMP WITHOUT TIME ZONE`) ignora o offset do servidor.
**Impacto:** Se o banco estiver em UTC e a aplicação em `America/Sao_Paulo`, as comparações de datas (`expires_at > NOW()`) falharão silenciosamente ou gerarão resultados errados dependendo da configuração da sessão.
**Correção Obrigatória:** Alterar **todos** os campos de data para `TIMESTAMPTZ` (`TIMESTAMP WITH TIME ZONE`). O Postgres converte tudo para UTC internamente e devolve no fuso da conexão, garantindo consistência matemática.

### 1.2. Integridade Referencial "Frouxa" (`users.created_by`)
**Local:** `iam.migration.ts` -> tabela `users`
**Trecho:** `created_by UUID, -- Self-reference (não coloco FK estrita para evitar deadlock no primeiro user)`
**Análise:** O medo de deadlock no seed não justifica perder a integridade referencial de toda a aplicação. Dados órfãos (usuários criados por IDs inexistentes) são inaceitáveis.
**Solução:**
1. Adicionar a FK: `REFERENCES users(id) ON DELETE SET NULL`.
2. No Seed: Inserir o primeiro Admin com `created_by = NULL`. Atualizações subsequentes podem preencher o campo se necessário.

### 1.3. Tipagem Fraca em Status e Canais (Magic Strings)
**Local:** `notification.migration.ts`
**Problema:** Campos `status` e `channel` são `VARCHAR(50)`. O código (Domain) usa Enums (`NotificationStatus`, `NotificationChannel`).
**Risco:** O banco aceita `'SENT_MESSAGE'`, `'sent'`, `'Enviado'`, quebrando a aplicação que espera `'SENT'`.
**Solução:**
*   **Opção A (Postgres Way):** Criar `TYPE`: `CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');`
*   **Opção B (Constraint):** Adicionar Check: `CHECK (status IN ('PENDING', 'SENT', 'FAILED'))`

---

## 2. ⚡ Performance e Indexação

### 2.1. Fila de Notificações (Gargalo Iminente)
**Local:** `notification.migration.ts`
**Cenário:** O sistema provavelmente terá um *Worker* buscando notificações `PENDING` para enviar.
**Problema:** A query `SELECT * FROM notifications WHERE status = 'PENDING'` fará um **Sequential Scan** na tabela inteira. Com milhões de notificações enviadas (histórico), buscar as pendentes será extremamente lento.
**Recomendação:** Índice Parcial.
```sql
CREATE INDEX idx_notifications_pending_process 
ON notifications(created_at) 
WHERE status = 'PENDING';
```
*Isso cria um índice minúsculo contendo apenas o que precisa ser processado.*

### 2.2. Paginação de Usuários (`COUNT(*) OVER()`)
**Local:** `UserPostgres.service.ts` -> `findAll`
**Análise:** A Window Function `COUNT(*) OVER()` força o banco a contar **todas** as linhas da tabela `users` a cada requisição de página, mesmo que você peça apenas 10 itens.
**Veredito:** Aceitável para < 100k usuários. Para escala maior, deve-se separar em duas queries (uma de contagem estimada ou cacheada e outra de dados) ou usar paginação por cursor (keyset pagination) em vez de `OFFSET`. *Mantido por enquanto, mas monitorar.*

---

## 3. 📝 Plano de Correção (Sugestão de DDL)

Abaixo, o arquivo de migração corrigido sugerido para o módulo IAM e Notifications.

### Correção sugerida para `iam.migration.ts`

```typescript
// Alterações chave:
// 1. TIMESTAMP -> TIMESTAMPTZ
// 2. FK em created_by
// 3. TEXT ao invés de VARCHAR (Best Practice PG: TEXT tem mesma performance e sem limite arbitrário)

await pg`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role_id UUID NOT NULL REFERENCES roles(id),
    
    cpf TEXT,
    job_title TEXT,
    department TEXT,
    
    is_active BOOLEAN DEFAULT true,
    force_change_password BOOLEAN DEFAULT true,
    
    -- Correção FK e TIMESTAMPTZ
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, 
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// ... (Mesma lógica para refresh_tokens e recovery_codes usando TIMESTAMPTZ)
```

### Correção sugerida para `notification.migration.ts`

```typescript
await pg`
  -- Garantir integridade dos valores do enum
  CREATE TYPE notification_status_enum AS ENUM ('PENDING', 'SENT', 'FAILED');
  CREATE TYPE notification_channel_enum AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');

  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    recipient TEXT NOT NULL,
    
    -- Uso dos tipos criados
    channel notification_channel_enum NOT NULL,
    status notification_status_enum NOT NULL DEFAULT 'PENDING',
    
    subject TEXT,
    content TEXT NOT NULL,
    
    recipient_id UUID, -- Se houver link com users, adicionar: REFERENCES users(id) ON DELETE SET NULL
    metadata JSONB DEFAULT '{}',
    
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// Índice para o Worker de envio (Performance Critical)
await pg`
    CREATE INDEX IF NOT EXISTS idx_notifications_pending_worker 
    ON notifications(created_at) 
    WHERE status = 'PENDING';
`;
```

## 4. Próximos Passos
1. [ ] Atualizar os arquivos de migration em `src/modules/shared/infra/postgres/migrations/`.
2. [ ] Atualizar as entidades de domínio para garantir que os testes passem com os novos tipos (ex: Enums).
3. [ ] Resetar o banco de dados local (`drop schema public cascade; create schema public;`) para aplicar as mudanças limpas.
