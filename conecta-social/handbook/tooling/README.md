# Tooling & Setup: O Ecossistema Bun

Este projeto utiliza o **Bun** não apenas como runtime, mas como uma suíte completa de ferramentas (Package Manager, Bundler, Test Runner). Abaixo detalhamos as funcionalidades chave que utilizamos e o porquê.

## 1. Monorepo com Workspaces
Transformamos a aplicação em um Monorepo utilizando **Bun Workspaces**.

- **Como funciona:** O `package.json` raiz define `"workspaces": ["src/modules/*"]`. Cada pasta em `src/modules` tem seu próprio `package.json`.
- **Por que usamos:**
    - **Isolamento:** Cada módulo declara suas próprias dependências explícitas.
    - **Links Locais:** O módulo IAM pode importar o Shared como uma lib padrão: `import ... from "@modules/shared"`. O Bun cria symlinks automáticos na `node_modules`.
    - **Performance:** O Bun instala todas as dependências de uma vez, deduplicando o que for comum.

📄 **Documentação de Referência:** [handbook/tooling/bun/workspace.md](./bun/workspace.md)

## 2. Gestão de Dependências com Catalogs
Para evitar o "inferno de versões" (módulos usando versões diferentes da mesma lib), utilizamos a feature **Catalogs** do Bun.

- **Como funciona:** As versões das bibliotecas (ex: `hono`, `zod`) são definidas **uma única vez** no `package.json` da raiz, na seção `catalog`.
- **Nos Módulos:** Os `package.json` dos módulos referenciam a versão com `"hono": "catalog:"`.
- **Por que usamos:** Garante consistência absoluta. Se atualizarmos o Hono na raiz, todos os módulos são atualizados instantaneamente.

📄 **Documentação de Referência:** [handbook/tooling/bun/catalog.md](./bun/catalog.md)

## 3. Configuração via `bunfig.toml`
O comportamento do Bun é ajustado via arquivo `bunfig.toml` na raiz.

- **Configurações Ativas:**
    - `telemetry = false`: Privacidade.
    - `install.linkWorkspacePackages = true`: Garante que `@modules/*` sejam linkados localmente.
    - `install.saveTextLockfile = true`: Gera um `bun.lock` legível para facilitar Code Review (em vez do binário padrão).
    - `run.bun = true`: Força o uso do Bun mesmo se invocar scripts como `node`.

📄 **Documentação de Referência:** [handbook/tooling/bun/bunfig.md](./bun/bunfig.md)

## 4. Runtime & Hot Reload
Utilizamos o modo de Hot Reload nativo do Bun para uma DX superior.

- **Script:** `bun run dev:hot` (mapeado para `bun --hot src/index.ts`).
- **Por que usamos:** Diferente do `--watch` (que reinicia o processo), o `--hot` recarrega o código mantendo o estado da aplicação e conexões de banco ativas. O feedback loop é instantâneo.

📄 **Documentação de Referência:** [handbook/tooling/bun/runtime.md](./bun/runtime.md)

## Comandos do Projeto

| Comando | Descrição | Contexto |
| :--- | :--- | :--- |
| `bun install` | Instala dependências e linka workspaces. | Raiz |
| `bun dev` | Inicia servidor em modo Watch (Hard Restart). | Raiz |
| `bun dev:hot` | Inicia servidor em modo Hot (Soft Reload). | Raiz |
| `bun test` | Roda testes unitários. | Raiz |
| `bun migrate:iam` | Roda migrações do banco Postgres. | Raiz |
