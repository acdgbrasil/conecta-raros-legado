# Relatório de Migração: Bun Workspaces & Catalogs

**Data:** 21 de Janeiro de 2026
**Status:** ✅ Concluído

Este relatório documenta a migração estrutural do projeto para suportar nativamente as funcionalidades avançadas do Bun v1.1+.

---

## 1. Contexto e Motivação
O projeto estava estruturado como um monólito simples, mas com separação lógica de pastas (`modules/iam`, `modules/social`). Embora funcional, isso apresentava desafios:
- **Gestão de Dependências:** O `package.json` raiz estava inchado.
- **Acoplamento:** Não havia barreiras claras entre os módulos.
- **Performance:** O setup do TypeScript não estava otimizado para o resolvedor do Bun.

## 2. Mudanças Realizadas

### 2.1. Adoção de Workspaces
Transformamos a pasta `src/modules` em workspaces do Bun.
- Criamos `package.json` em cada módulo (`iam`, `notifications`, `social`, `shared`).
- Definimos os nomes dos pacotes como `@modules/<nome>`.
- **Benefício:** Agora o módulo `iam` declara explicitamente que depende de `@modules/shared`.

### 2.2. Implementação de Catalogs
Movemos todas as versões de dependências (ex: `hono`, `zod`, `mongoose`) para a chave `catalog` no `package.json` raiz.
- **Benefício:** Elimina conflitos de versão. Todos os módulos usam, garantidamente, a mesma versão do `zod` definida no catálogo.

### 2.3. Configuração do Bunfig (`bunfig.toml`)
Criamos um arquivo de configuração explícito para o Bun:
- `saveTextLockfile = true`: Gera um `bun.lock` em formato de texto (tipo Yarn), permitindo leitura humana e diffs no Git.
- `linkWorkspacePackages = true`: Força a criação de symlinks para desenvolvimento local.

### 2.4. Hot Reload
Adicionamos o script `dev:hot` que utiliza a flag `--hot` do Bun.
- **Diferença:** Ao contrário do `--watch` (que mata e reinicia o processo), o `--hot` atualiza os módulos em memória. Isso mantém conexões de banco de dados ativas e acelera drasticamente o desenvolvimento.

### 2.5. Otimização do TypeScript
Atualizamos o `tsconfig.json` para o "Bun Way":
- `module: "esnext"` e `target: "esnext"`: O Bun transpila nativamente, então não precisamos fazer downlevel para CommonJS ou versões antigas do JS.
- `moduleResolution: "bundler"`: Otimizado para importações modernas.
- `noEmit: true`: O Bun roda TS diretamente; o `tsc` serve apenas para checagem de tipos.

## 3. Estado do Módulo Social
O módulo `social` foi marcado como **LEGADO/DESATIVADO**.
- Seu `package.json` reflete a versão `0.0.0-legacy`.
- Foi adicionado um README específico alertando sobre a refatoração.
- Ele foi integrado ao sistema de Catalogs para manter compatibilidade, mas seu uso é desencorajado até a refatoração.
