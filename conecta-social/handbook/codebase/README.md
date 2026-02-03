# Padrões de Código

## Nomenclatura
- Todo o código deve estar em **Inglês**.
- Pastas: `camelCase` e no plural onde aplicável (`useCases`, `controllers`, `mappers`).
- Arquivos: `PascalCase.tipo.ts` (ex: `Login.useCase.ts`).

## Importação de Módulos (Workspaces)
Com a adoção de Bun Workspaces, não utilizamos mais caminhos relativos longos (`../../../../shared`) para cruzar fronteiras de módulos.

- **Correto:** `import { JwtProvider } from "@modules/shared/providers/..."`
- **Incorreto:** `import { JwtProvider } from "../../../shared/providers/..."`

*Nota: Importações dentro do MESMO módulo ainda devem usar caminhos relativos.*

## Validação com Zod v4
Utilizamos o Zod para garantir que dados sujos não entrem no domínio.
- **Inputs**: Devem residir em `application/mappers/**/inputs/*.input.ts`.
- **Outputs**: Devem residir em `application/mappers/**/outputs/*.output.ts`.
- **Padrão de erro**: `{ error: { code, message, details? } }`.

## Injeção de Dependência
Utilizamos **GetIt (container leve)** para registrar e resolver casos de uso e serviços.
- Registro centralizado em `src/modules/**/infra/di/injections.di.ts`.
- Resolução via `GetIt.instance.get<T>(token)` nos controllers/handlers.

## Camada HTTP (Bun Native)
- Rotas são mapas planos (`routes`) compatíveis com `Bun.serve`.
- Use `prefixRoutes` para criar namespaces (`/iam/web/*`, `/iam/mobile/*`).
- BFFs web/mobile vivem em `interface/http/bff/**` e devem padronizar respostas via `AuthMapper.response`.
