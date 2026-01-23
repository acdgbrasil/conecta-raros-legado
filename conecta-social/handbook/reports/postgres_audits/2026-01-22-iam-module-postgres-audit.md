# Auditoria de Arquitetura PostgreSQL - Módulo IAM

**Data:** 22 de Janeiro de 2026
**Responsável:** PostgreSQL Architect Agent
**Escopo:** `src/modules/iam/infra/database/postgres/**`

## 1. Resumo Executivo

A camada de persistência do módulo IAM demonstra boas práticas modernas de PostgreSQL (uso de `json_agg`, queries parametrizadas), mas apresenta **falhas de segurança crítica na geração de códigos** e **riscos de performance por ausência de estratégia de indexação explícita**.

O código analisado foca em DML (Data Manipulation Language), mas a ausência de DDL (Schemas) no contexto exige inferências que apontam para a necessidade de rigor na definição de constraints.

**Nível de Maturidade:** Médio (Código limpo, mas com falhas de segurança e indefinição de índices).

---

## 2. Segurança & Criptografia (Crítico)

### 2.1. Geração de Códigos Insegura
*   **Arquivo:** `RecoveryPostgres.service.ts`
*   **Código:** `Math.floor(100000 + Math.random() * 900000).toString()`
*   **Violação:** O uso de `Math.random()` não é criptograficamente seguro (CSPRNG). Códigos de recuperação de senha são vetores de ataque sensíveis.
*   **Ação Obrigatória:** Substituir por `crypto.randomInt()` (Node/Bun) ou `Web Crypto API`.
    ```typescript
    // Exemplo seguro
    const code = crypto.randomInt(100000, 999999).toString();
    ```

### 2.2. Integridade de Referência (Foreign Keys)
*   **Arquivo:** `RecoveryPostgres.service.ts`
*   **Análise:** O método `saveRecoveryCode` salva o código vinculado ao `email`.
    *   *Risco:* Se o e-mail do usuário mudar na tabela `users`, os códigos de recuperação antigos ficam órfãos ou válidos para um e-mail que não existe mais.
    *   *Recomendação:* Vincular `recovery_codes` ao `user_id` (FK), não ao e-mail. Isso garante integridade referencial (`ON DELETE CASCADE`).

---

## 3. Performance & Estratégia de Indexação

Como o DDL não foi fornecido, a auditoria baseia-se nas queries executadas (`WHERE` clauses). É **imperativo** que os seguintes índices existam:

### 3.1. Índices Obrigatórios (Checklist)

| Tabela | Colunas | Tipo | Justificativa | Evidência no Código |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `email` | `UNIQUE B-Tree` | Busca exata em login/recovery | `findByEmail` |
| `users` | `name` | `B-Tree` | Ordenação em listagens | `findAll` (`ORDER BY u.name`) |
| `refresh_tokens` | `token_hash` | `Hash` ou `B-Tree` | Busca exata de token | `findRefreshToken` |
| `refresh_tokens` | `user_id` | `B-Tree` | Revogação em massa | `revokeAllUserRefreshTokens` |
| `recovery_codes` | `(email, code)` | `B-Tree (Composite)` | Validação de código | `findValidRecoveryCode` |
| `role_permissions` | `role_id` | `B-Tree` | Join frequente de permissões | `getPermissionsByRoleId` |

### 3.2. Análise de Queries

*   **Arquivo:** `UserPostgres.service.ts`
*   **Query:** `findAll` utiliza `COUNT(*) OVER()`.
    *   *Análise:* Excelente para UX de paginação simples. Porém, em tabelas com milhões de registros, isso força um *Full Scan* ou *Index Scan* completo.
    *   *Ação:* Monitorar performance. Se a tabela `users` crescer > 100k, considerar estimativa (`reltuples`) ou cache de contagem.

*   **Arquivo:** `UserPostgres.service.ts`
*   **Query:** `findByEmail` e `findById` usam `json_agg` com `GROUP BY u.id`.
    *   *Ponto Positivo:* Evita o problema "N+1 Queries" (fetching permissions loop). Essa é uma prática recomendada de arquitetura para PostgreSQL moderno.
    *   *Observação:* O uso de `COALESCE(..., '[]')` garante que a aplicação não quebre com valores nulos.

---

## 4. Schema Design & Data Modeling

### 4.1. Tipos de Dados
*   **Timestamps:** O código usa `.toISOString()` (`expiresAt.toISOString()`).
    *   *Requisito:* O banco deve usar `TIMESTAMPTZ` (Timestamp with Time Zone) para evitar problemas de fuso horário. O driver do Bun/Postgres costuma converter strings ISO corretamente, mas a coluna no banco deve ser explícita.
*   **Arrays vs Relacional:**
    *   O uso de tabela associativa `role_permissions` (Many-to-Many) está correto e normalizado, preferível a um array de strings na tabela de roles para este caso (RBAC complexo).

### 4.2. Soft Deletes
*   **Evidência:** `is_active` em `users`.
*   **Recomendação:** Garantir que índices parciais sejam criados se as buscas por usuários ativos forem a maioria.
    *   Ex: `CREATE INDEX idx_users_active_email ON users(email) WHERE is_active = true;`

---

## 5. Plano de Ação (PostgreSQL)

1.  **Imediato (Segurança):**
    *   [ ] **Refatorar `RecoveryPostgres.service.ts` para usar `crypto.randomInt()`** no lugar de `Math.random()`.
    *   [ ] Verificar se `recovery_codes` possui FK para `users`. Se não, planejar migration.

2.  **Curto Prazo (DDL & Índices):**
    *   [ ] Criar arquivo `migration.sql` formalizando os índices listados na seção 3.1.
    *   [ ] Garantir que todas as colunas de data sejam `TIMESTAMPTZ`.

3.  **Médio Prazo (Manutenibilidade):**
    *   [ ] Extrair queries SQL para arquivos `.sql` ou usar um Query Builder leve se a complexidade das strings aumentar (reduz risco de erro de sintaxe).

---
**Assinado:** *PostgreSQL Architect Agent*
