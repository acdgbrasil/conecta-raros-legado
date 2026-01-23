# Tooling: TypeScript & Bun

Este projeto é um monólito moderno construído sobre o runtime **Bun**.

## Por que Bun?
Escolhemos o Bun pela performance nativa, suporte de primeira classe ao TypeScript (sem build step para dev) e ferramentas integradas (Test Runner, Package Manager).

## Configuração do TypeScript (`tsconfig.json`)
O projeto roda em modo `ESNext` estrito.

- **`strict: true`**: `noImplicitAny` é obrigatório. Tipagem forte não é opcional.
- **`moduleResolution: bundler`**: Para melhor compatibilidade com imports modernos.
- **`paths`**: Não utilizamos Path Aliases (`@/modules/...`) para evitar complexidade na resolução de módulos em produção/docker. Usamos caminhos relativos explícitos.

## Scripts do `package.json`
- `dev`: `bun --watch src/index.ts` (Hot Reload nativo)
- `test`: `bun test` (Runner compatível com Jest/Vitest)
- `typecheck`: `tsc --noEmit` (Apenas checagem de tipos, o Bun ignora erros de tipo em runtime)
