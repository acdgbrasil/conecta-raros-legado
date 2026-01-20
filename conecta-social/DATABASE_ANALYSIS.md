# Análise de Implementações PostgreSQL

Este documento detalha as diferentes implementações de conexão com o PostgreSQL encontradas no projeto, identificando qual é a **Fonte da Verdade (Ativa)** e qual é **Código Morto/Redundante**.

## 1. Implementação Ativa (Em Uso) ✅

**Caminho:** `src/infra/database/postgress/`

Esta é a implementação que está efetivamente segurando a aplicação. Ela utiliza o driver nativo do Bun (`bun:sql`), que é mais performático.

*   **Arquivo Principal:** `src/infra/database/postgress/postgres.ts`
    *   **Responsabilidade:** Exporta a instância `sql` conectada via `bun:sql`.
    *   **Quem usa:**
        *   `src/index.ts` (Health check na inicialização).
        *   `src/modules/iam/infra/IAMRepository.ts` (Novo módulo de IAM).
        *   `src/infra/database/postgress/postgressDTO.ts` (Sistema legado de usuários).
        *   Todas as Migrations (`src/infra/database/postgress/migrations/*`).

*   **Arquivo Auxiliar:** `src/infra/database/postgress/postgressDTO.ts`
    *   **Responsabilidade:** Contém funções de acesso a dados (DAO) do sistema legado.
    *   **Quem usa:** `src/infra/database/databaseService.ts`.

---

## 2. Implementação Inativa / Redundante (Código Morto) ❌

**Caminho:** `src/modules/database/`

Esta estrutura parece ser uma tentativa anterior ou paralela de criar um módulo de banco de dados agnóstico (Adapter Pattern), mas utiliza a biblioteca `pg` (Node.js) em vez do `bun:sql` e **não está conectada ao fluxo principal da aplicação**.

*   **Arquivos:**
    *   `src/modules/database/DatabaseModule.ts` (Singleton não instanciado pelo `index.ts`).
    *   `src/modules/database/postgres/PostgresAdapter.ts` (Usa `import pg from 'pg'`, criando uma dependência desnecessária já que estamos no Bun).
    *   `src/modules/database/interfaces/IDatabaseClient.ts`.

*   **Veredito:**
    *   Não é importado pelo `src/index.ts`.
    *   Não é usado pelo novo módulo IAM.
    *   Não é usado pelos Services legados.
    *   Gera confusão por ter uma estrutura de pastas similar.

---

## 3. Recomendação de Limpeza

Para evitar confusão futura e reduzir dependências (como remover o pacote `pg` se ele não for usado em outro lugar), recomenda-se:

1.  **Manter:** `src/infra/database/postgress/**` (Renomear para `postgres` corrigindo o typo "ss" no futuro seria bom).
2.  **Excluir:** `src/modules/database/` inteiro.
3.  **Verificar:** Se `pg` e `@types/pg` estão no `package.json` apenas por causa da pasta inativa, removê-los após a exclusão.
