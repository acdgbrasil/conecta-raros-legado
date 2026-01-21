# Padrões de Código

## Nomenclatura
- Todo o código deve estar em **Inglês**.
- Pastas: `camelCase` e no plural onde aplicável (`useCases`, `queries`).
- Arquivos: `PascalCase.tipo.ts` (ex: `Login.useCase.ts`).

## Importação de Módulos (Workspaces)
Com a adoção de Bun Workspaces, não utilizamos mais caminhos relativos longos (`../../../../shared`) para cruzar fronteiras de módulos.

- **Correto:** `import { JwtProvider } from "@modules/shared/providers/..."`
- **Incorreto:** `import { JwtProvider } from "../../../shared/providers/..."`

*Nota: Importações dentro do MESMO módulo ainda devem usar caminhos relativos.*

## Validação com Zod v4
Utilizamos o Zod para garantir que dados sujos não entrem no domínio.
- **Inputs**: Devem residir em `mapper/*.input.ts`.
- **Outputs**: Devem residir em `mapper/*.output.ts`.
- Padrão de erro: `{ error: "Mensagem personalizada" }`.

## Injeção de Dependência
Utilizamos **Pure DI** (Injeção Manual).
- As dependências são instanciadas no arquivo `*.server.ts` do módulo e passadas via construtor.
- Evita o overhead de containers de DI complexos e mantém a inicialização do Bun rápida.
