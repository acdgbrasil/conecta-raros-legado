# Conecta Social API

API em **Monolito Modular (Monorepo)** com **Bun Native**, focada em performance, DX e manutenibilidade. O projeto aplica **Clean Architecture**, **DDD** e **Event-Driven Design**, com módulos isolados por domínio e BFF web/mobile para o IAM.

## Status do Projeto
- **IAM (`@modules/iam`)**: gestão de identidades, autenticação e autorização (BFF web/mobile).
- **Notifications (`@modules/notifications`)**: orquestração de mensageria.
- **Shared (`@modules/shared`)**: kernel compartilhado (banco, validações, eventos).
- **Social (`@modules/social`)**: **LEGADO/DESATIVADO**. Não utilizar.

## Estrutura do Repositório
- `src/` - aplicação e módulos do monorepo (`src/modules/*`).
- `handbook/` - documentação viva: arquitetura, padrões, processos e referências.
- `example.env` - template de variáveis de ambiente.
- `bunfig.toml` - configuração do Bun.
- `Dockerfile` - build para deploy.

## Requisitos
- **Bun** (runtime, package manager e test runner).
- **PostgreSQL** (IAM/Notifications) e **MongoDB** (módulos legados/integrações).
- **Docker** (para deploy local e pipeline).

## Configuração Rápida
1. Crie o arquivo `.env` a partir de `example.env`.
2. Configure credenciais de Postgres, MongoDB e serviços externos (Resend/SendGrid).
3. Instale dependências:
   ```bash
   bun install
   ```
4. Inicie o servidor:
   ```bash
   bun dev
   ```

## Variáveis de Ambiente
Veja `example.env` para a lista completa. Principais grupos:
- **Aplicação**: `PORT`.
- **Admin inicial**: `SUPER_ADM_EMAIL`, `SUPER_ADM_NAME`, `SUPER_ADM_PASSWORD`.
- **Postgres (Bun.sql)**: `PG_USER`, `PG_PASSWORD`, `PG_HOST`, `PG_PORT`, `PG_DATABASE`.
- **MongoDB (Mongoose)**: `MONGO_LOCAL_URL`.
- **Serviços externos**: `RESEND_API_KEY`, `SENDGRID_API_KEY`.
- **Segurança**: `JWT_SECRET`.

## Comandos do Projeto
| Comando | Descrição |
| --- | --- |
| `bun install` | Instala dependências e linka workspaces. |
| `bun dev` | Dev com `--watch` (hard restart). |
| `bun start` | Inicia servidor em modo normal. |
| `bun test` | Testes unitários. |
| `bun run db:migrate` | Migrações de IAM + Notifications no Postgres. |
| `bun run db:seed` | Seed inicial de IAM. |
| `bun run db:setup` | Migrações + seed. |
| `bun run docker:up` | Sobe ambiente via Docker. |
| `bun run legacy:start` | Inicia servidor legado (descontinuado). |

## API Reference (Resumo)
- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Auth**: Bearer Token (JWT) em `Authorization` quando aplicável
- **IAM (BFF)**:
  - Web: `POST /iam/web/auth/login`, `POST /iam/web/auth/refresh`
  - Mobile: `POST /iam/mobile/login`, `POST /iam/mobile/refresh`

Detalhes e curls em `handbook/api_reference/`.

## Diretrizes de Código
Consulte `handbook/codebase/README.md` para detalhes. Resumo:
- **Idioma**: todo o código em inglês.
- **Pastas**: `camelCase`, no plural quando aplicável.
- **Arquivos**: `PascalCase.tipo.ts` (ex: `Login.useCase.ts`).
- **Workspaces**: importar módulos via `@modules/*`, evitando caminhos relativos longos.
- **Zod v4**:
  - Inputs em `application/mappers/**/inputs/*.input.ts`.
  - Outputs em `application/mappers/**/outputs/*.output.ts`.
  - Erros no padrão `{ error: { code, message, details? } }`.
- **Injeção de Dependência**: `GetIt` como container leve (tokens em `infra/di/injections.di.ts`).

## Qualidade e Guardrails
Consolidado em `handbook/quality/README.md`:
- `biome check` (ou ESLint) sem erros.
- Testes unitários para novos UseCases.
- **SQL seguro**: sem interpolação de string; use `pg`${var}`.
- Cobertura alvo: **80%** em UseCases.

## Processo de Engenharia
Fluxo padrão (`handbook/process/README.md`):
1. **Design**: atualizar `handbook/domain_questions/`.
2. **TDD**: escrever testes (RED).
3. **Implementação**: passar testes (GREEN).
4. **Refactor**: melhorar e documentar (BLUE).

Deploy é via Docker e a imagem deve ser buildada a partir da `main`.

## Tooling (Bun)
Guia completo em `handbook/tooling/README.md`. Destaques:
- **Workspaces**: `src/modules/*` como pacotes isolados.
- **Catalogs**: versões centralizadas no `package.json` raiz.
- **bunfig.toml**: telemetria off, lockfile em texto, workspaces linkados.
- **Hot Reload**: use `bun --hot` se precisar, mas o padrão do projeto é `bun --watch`.

## Governança de Dados
Guias em `handbook/quality/governance/`:
- Qualidade de Dados
- Dicionário de Dados
- Privacidade & LGPD
- Ciclo de Vida & Auditoria

## Referências e Relatórios
- Convenções de Postgres: `handbook/references/postgresql.md`.
- Relatórios e roadmap: `handbook/reports/`.

## Documentação Viva
O handbook é a fonte de verdade. Antes de codar, valide se a documentação está atualizada:
- `handbook/README.md`
- `handbook/domain_questions/`
- `handbook/tooling/`
