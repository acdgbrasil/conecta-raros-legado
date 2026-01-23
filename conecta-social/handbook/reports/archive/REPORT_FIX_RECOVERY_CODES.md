# Relatório de Correção: Erro "column user_id of relation recovery_codes does not exist"

## Diagnóstico
O erro indica que a aplicação está tentando acessar ou gravar na coluna `user_id` da tabela `recovery_codes`, mas essa coluna não existe no banco de dados.

Isso ocorre porque:
1.  O código do repositório (`RecoveryPostgres.service.ts`) utiliza `user_id`.
2.  A definição da tabela (`iam.migration.ts`) foi criada utilizando `email`.

Embora o erro possa ter surgido durante um fluxo que envolve notificações (como "Esqueci minha senha"), a falha raiz está na estrutura do banco de dados do módulo IAM.

---

## Arquivos para Modificar

### 1. `conecta-social/src/modules/shared/infra/postgres/migrations/iam.migration.ts`
**Problema:** A definição da tabela está desatualizada em relação ao código.
**Ação:** Substituir a coluna `email` por `user_id` (FK para `users`).

```typescript
// De:
email VARCHAR(255) NOT NULL,

// Para:
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```

### 2. `conecta-social/src/modules/iam/infra/database/postgres/migrations/001_performance_indexes.sql`
**Problema:** Este arquivo cria índices usando `user_id`. Se rodar contra o banco atual, falhará.
**Ação:** Nenhuma alteração no código é necessária se a tabela for corrigida, pois ele já está "correto" (esperando `user_id`). Apenas garanta que a tabela seja corrigida antes de rodar este script.

### 3. Criar Script de Correção (Migration Fix)
Como o banco de dados já está criado, alterar o arquivo de migração original não muda a tabela existente automaticamente. É necessário rodar um script para corrigir o banco.

**Criar arquivo:** `conecta-social/src/modules/iam/infra/database/postgres/migrations/fix_recovery_schema.ts`

**Conteúdo sugerido:**
```typescript
import { pg } from "../../../../../shared/infra/postgres/client/postgres.client";

async function fix() {
  console.log("🔄 Recriando tabela recovery_codes...");
  // Drop é seguro pois códigos de recuperação são dados efêmeros
  await pg`DROP TABLE IF EXISTS recovery_codes CASCADE`;
  
  await pg`
    CREATE TABLE IF NOT EXISTS recovery_codes (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  await pg`CREATE INDEX IF NOT EXISTS idx_recovery_user_id ON recovery_codes(user_id);`;
  console.log("✅ Tabela recovery_codes corrigida!");
  process.exit(0);
}

fix();
```
*Observação: Certifique-se de que as variáveis de ambiente do banco de dados (PG_HOST, etc.) estejam configuradas ao rodar este script.*

---

## Por que o erro apareceu no `SendNotificationUseCase`?
Provavelmente o erro não ocorreu *dentro* da classe `SendNotificationUseCase`, mas sim no fluxo que o antecede ou o envolve (ex: `ForgotPasswordUseCase`). Se você estiver olhando logs, o erro de banco pode ter interrompido o processo antes da notificação ser enviada, ou o log de erro capturou a stack trace próxima. O `SendNotificationUseCase` em si não acessa a tabela `recovery_codes`.
