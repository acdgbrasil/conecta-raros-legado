# Auditoria Operacional MongoDB (Ops & Security) - Módulo Social

**Data:** 22 de Janeiro de 2026
**Responsável:** MongoDB Ops Specialist Agent
**Escopo:** `src/modules/social/infra/database/**` e configurações relacionadas.

## 1. Resumo Executivo (Ops View)

A infraestrutura de banco de dados do módulo Social apresenta riscos significativos de **integridade de dados** e **segurança operacional**.

A ausência de **Transações ACID** em operações de escrita complexas (multi-documento) é o ponto mais crítico, garantindo a criação de registros "órfãos" em caso de falhas parciais. Além disso, a configuração de conexão é frágil para ambientes de produção (falta de timeouts e pool size explícitos) e há falhas de segurança em segredos hardcoded.

**Status Operacional:** 🔴 **Crítico** (Não apto para Produção sem correções)

---

## 2. Integridade de Dados & Transações

### 2.1. Violação de Atomicidade (Risco Alto)
*   **Arquivo:** `src/modules/social/infra/database/mongodb/mongoDtos/personReferenceDTO.ts`
*   **Função:** `createReferencePerson`
*   **Análise:** Esta função realiza **8 operações de escrita** sequenciais em coleções diferentes (`familyComposition`, `firstEntryInUnity`, `homeConditions`, etc.) antes de criar o registro principal `ReferencePerson`.
*   **Problema:** Se a criação do `ReferencePerson` falhar (ex: erro de validação, queda de rede), os 7 documentos anteriores persistirão no banco como "lixo" (dados órfãos), corrompendo o estado do sistema.
*   **Ação Obrigatória:** Envelopar toda a operação em uma **Session Transaction** (`session.withTransaction`).
    ```typescript
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // ...creates com { session }
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
    ```

### 2.2. Validação em Updates (Risco Médio)
*   **Arquivo:** `src/modules/social/infra/database/mongodb/mongoDtos/firstEntryInUnityDTO.ts`
*   **Código:**
    ```typescript
    await firstEntryInUnityModel.findOneAndUpdate({_id:...}, {...}, {new:true});
    ```
*   **Problema:** A opção `runValidators: true` está ausente. O Mongoose, por padrão, **não valida** atualizações (`findOneAndUpdate`). Isso permite que dados inválidos (que violam o Schema) sejam inseridos via update.
*   **Ação:** Adicionar `{ new: true, runValidators: true }`.

---

## 3. Conexões & Topologia

### 3.1. Gerenciamento de Conexão Frágil
*   **Arquivo:** `src/modules/social/infra/database/mongodb/mongoDtos/mongodbDto.ts`
*   **Análise:**
    *   Falta configuração explícita de `serverSelectionTimeoutMS`, `connectTimeoutMS` e `maxPoolSize`. Em produção (especialmente Serverless ou Containers), isso causa timeouts indeterminados ou exaustão de conexões.
    *   O tratamento de erro apenas loga no console (`console.log`) e não encerra o processo ou propaga o erro fatal adequadamente para orquestradores (K8s/Docker) reiniciarem o pod.
*   **Ação:** Definir opções de conexão robustas no `mongoose.connect`.

### 3.2. Singleton Pattern Incompleto
*   **Arquivo:** `src/modules/social/infra/database/mongodb/mongooseClientSingleton.ts`
*   **Análise:** A classe existe mas o código de conexão em `mongodbDto.ts` não parece utilizá-la consistentemente para prevenir múltiplas conexões em ambientes de desenvolvimento (hot-reload) ou testes.

---

## 4. Segurança e Configuração

### 4.1. Segredos Hardcoded (Risco Crítico)
*   **Arquivo:** `src/modules/social/infra/jwt/jwtToken.ts`
*   **Código:** `this.secret = process.env.JWT_SECRET || 'CHANGE_ME_IN_PROD_PLEASE';`
*   **Análise:** Defaults inseguros em código são vetores de ataque comuns. Se a variável de ambiente falhar ao carregar, o sistema sobe vulnerável silenciosamente.
*   **Ação:** O sistema deve **falhar ao iniciar** (throw Error) se segredos críticos não estiverem definidos. Nunca fornecer default inseguro.

### 4.2. Isolamento Multi-tenant
*   **Observação:** Não foi observado nenhum campo `tenantId` ou `organizationId` nos Schemas ou Queries.
*   **Questionamento:** Se este sistema for SaaS (Multi-inquilino), existe um vazamento de dados massivo por design. Se for Single-Tenant (On-premise), este ponto pode ser ignorado, mas deve ser documentado explicitamente.

---

## 5. Plano de Ação (Ops)

1.  **Imediato (Correção de Integridade):**
    *   [ ] Implementar **Transactions** no método `createReferencePerson`.
    *   [ ] Ativar `runValidators: true` em todos os `findOneAndUpdate`.

2.  **Curto Prazo (Segurança):**
    *   [ ] Remover fallback `'CHANGE_ME_IN_PROD_PLEASE'` e forçar erro na inicialização.
    *   [ ] Auditar injeção de NoSQL: Garantir que inputs de `req.body` não vão direto para filtros de `find()` sem sanitização (ex: impedir `{ $ne: null }`).

3.  **Infraestrutura:**
    *   [ ] Configurar `maxPoolSize` (rec: 10 para Lambda, 50+ para Containers long-running).
    *   [ ] Implementar *Graceful Shutdown* para fechar conexões MongoDB ao receber SIGTERM.

---
**Assinado:** *MongoDB Ops Specialist Agent*